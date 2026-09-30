import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { getBodyProfiles, radiusAt, shellProfile, limbGeometry } from './anatomy'
import {
  getFabricMaterial,
  getDecalMaterial,
  getPrintTexture,
  getPocketTexture,
  goldMaterial,
  mannequinMaterial,
  plasticMaterial,
  getSolidMaterial,
} from './materials'
import { getKingGeometry } from './chess'

const TAU = Math.PI * 2

/* ---------------------------------------------------------------------------
 * Regras de caimento de cada peça superior.
 * Cada função devolve o raio da roupa em uma altura y, a partir do raio do corpo.
 * ------------------------------------------------------------------------ */
function topShape(top, spec, torso) {
  const chest = radiusAt(torso, spec.shoulder[1] - 0.08)
  const neckTop = [spec.neck.r + 0.014, spec.neck.y0 + 0.036]
  const yNeck = spec.neck.y0 + 0.024
  const shoulderLine = spec.shoulder[1] - 0.06
  // blocos reutilizáveis
  const boxy = (ease, floor) => (y, r) => (y < shoulderLine ? Math.max(r, chest * floor) : r) + ease
  const sleeveless = (ease, floor) => (y, r) =>
    y > shoulderLine ? r + ease - (y - shoulderLine) * 0.32 : Math.max(r, chest * floor) + ease

  switch (top.type) {
    case 'jersey':
      return { y0: 0.8, ease: sleeveless(0.02, 0.9), yNeck, neckTop, sleeve: null }
    case 'crop':
      return { y0: 1.13, ease: sleeveless(0.007, 0), yNeck, neckTop, sleeve: null }
    case 'hoodie':
      return { y0: 0.8, ease: boxy(0.034, 0.96), yNeck, neckTop, sleeve: { long: true, ease: 0.024, wide: 0.02 } }
    case 'blazer':
      return {
        y0: 0.82,
        ease: boxy(0.024, 0.93),
        yNeck: spec.neck.y0 - 0.005,
        neckTop: [spec.neck.r + 0.03, spec.neck.y0 + 0.03],
        sleeve: { long: true, ease: 0.018, wide: 0.004 },
        open: 0.62,
      }
    case 'tee':
    default:
      return top.fit === 'oversized'
        ? { y0: 0.76, ease: boxy(0.03, 0.97), yNeck, neckTop, sleeve: { long: false, oversized: true } }
        : { y0: 0.88, ease: 0.014, yNeck, neckTop, sleeve: { long: false } }
  }
}

function bottomShape(bottom, spec) {
  const legR = (profile, y) => radiusAt(profile, Math.max(y, 0.1))
  switch (bottom.type) {
    case 'balloon':
      return {
        waist: spec.waistY - 0.01,
        ease: 0.024,
        hem: 0.42,
        leg: (profile) => (y) => {
          const t = (y - 0.42) / (0.905 - 0.42)
          return legR(profile, y) + 0.026 + 0.03 * Math.sin(Math.PI * Math.min(1, t * 1.15)) - (t < 0.04 ? 0.012 : 0)
        },
      }
    case 'wide':
      return {
        waist: spec.waistY + 0.012,
        ease: 0.01,
        hem: 0.03,
        leg: (profile) => (y) => legR(profile, y) + 0.012 + Math.max(0, 0.8 - y) * 0.085,
      }
    case 'tailored':
      return {
        waist: spec.waistY + 0.012,
        ease: 0.01,
        hem: 0.075,
        leg: (profile) => (y) => Math.max(legR(profile, y) + 0.012, 0.066),
      }
    case 'cargo':
      return {
        waist: spec.waistY - 0.01,
        ease: 0.022,
        hem: 0.06,
        pockets: true,
        leg: (profile) => (y) => Math.max(legR(profile, y) + 0.02, 0.088),
      }
    case 'baggy':
    default:
      return {
        waist: spec.waistY - 0.015,
        ease: 0.024,
        hem: 0.045,
        leg: (profile) => (y) => {
          const stack = y < 0.26 ? 0.009 * Math.sin(y * 70) * ((0.26 - y) / 0.26) : 0
          return Math.max(legR(profile, y) + 0.022, 0.1) + stack
        },
      }
  }
}

/* ---------------------------------------------------------------------------
 * Peças básicas
 * ------------------------------------------------------------------------ */
function Lathe({ points, segments = 48, phiStart = 0, phiLength = TAU, material, ...props }) {
  const geo = useMemo(
    () => new THREE.LatheGeometry(points, segments, phiStart, phiLength),
    [points, segments, phiStart, phiLength],
  )
  return <mesh geometry={geo} material={material} {...props} />
}

/** Estampa aplicada sobre a superfície curva da roupa (faixa de lathe com UV próprio). */
function Decal({ torso, ease, y0, y1, center, width, texture, depth }) {
  const points = useMemo(
    () =>
      shellProfile(torso, y0, y1, (y, r) => (typeof ease === 'function' ? ease(y, r) : r + ease) + 0.004, {
        steps: 18,
      }),
    [torso, ease, y0, y1],
  )
  return (
    <Lathe
      points={points}
      segments={20}
      phiStart={center - width / 2}
      phiLength={width}
      material={getDecalMaterial(texture)}
      scale={[1, 1, depth]}
      renderOrder={2}
    />
  )
}

function Sphere({ r, material, segments = 24, ...props }) {
  const geo = useMemo(() => new THREE.SphereGeometry(r, segments, Math.round(segments * 0.75)), [r, segments])
  return <mesh geometry={geo} material={material} {...props} />
}

function Limb({ r1, r2, len, material, ...props }) {
  const geo = useMemo(() => limbGeometry(r1, r2, len), [r1, r2, len])
  return <mesh geometry={geo} material={material} {...props} />
}

function Ring({ radius, tube, material, arc = TAU, ...props }) {
  const geo = useMemo(() => new THREE.TorusGeometry(radius, tube, 10, 48, arc), [radius, tube, arc])
  return <mesh geometry={geo} material={material} {...props} />
}

/* ---------------------------------------------------------------------------
 * Braço (com manga e acessórios de punho/mão)
 * ------------------------------------------------------------------------ */
function Arm({ spec, side, skin, sleeve, sleeveMat, wristExtra, handExtra }) {
  const { upperArm: ua, forearm: fa } = spec
  const handGeo = useMemo(() => new THREE.CapsuleGeometry(fa.r2 * 0.95, 0.07, 4, 12), [fa.r2])

  let sleeveParts = null
  if (sleeve && sleeveMat) {
    if (sleeve.long) {
      const e = sleeve.ease
      sleeveParts = (
        <>
          <Sphere r={spec.shoulderR + e + sleeve.wide} material={sleeveMat} />
          <Limb r1={spec.shoulderR + e + sleeve.wide} r2={ua.r2 + e + sleeve.wide * 0.6} len={ua.len} material={sleeveMat} />
        </>
      )
    } else if (sleeve.oversized) {
      sleeveParts = (
        <>
          <Sphere r={spec.shoulderR + 0.034} material={sleeveMat} />
          <Limb r1={spec.shoulderR + 0.034} r2={0.078} len={ua.len * 0.74} material={sleeveMat} />
        </>
      )
    } else {
      sleeveParts = (
        <>
          <Sphere r={spec.shoulderR + 0.012} material={sleeveMat} />
          <Limb r1={spec.shoulderR + 0.012} r2={ua.r1 + 0.012} len={ua.len * 0.5} material={sleeveMat} />
        </>
      )
    }
  }

  const longSleeve = sleeve?.long && sleeveMat
  return (
    <group position={[side * spec.shoulder[0], spec.shoulder[1], 0]} rotation={[0, 0, side * spec.spread]}>
      <Sphere r={spec.shoulderR} material={skin} />
      <Limb r1={ua.r1} r2={ua.r2} len={ua.len} material={skin} />
      {sleeveParts}
      <group position={[0, -ua.len, 0]} rotation={[spec.elbowBend, 0, 0]}>
        <Sphere r={ua.r2 * 1.01} material={skin} />
        <Limb r1={fa.r1} r2={fa.r2} len={fa.len} material={skin} />
        {longSleeve && (
          <>
            <Sphere r={ua.r2 + sleeve.ease + sleeve.wide * 0.6} material={sleeveMat} />
            <Limb
              r1={ua.r2 + sleeve.ease + sleeve.wide * 0.6}
              r2={fa.r2 + sleeve.ease * 0.85}
              len={fa.len - 0.01}
              material={sleeveMat}
            />
            <Ring
              radius={fa.r2 + sleeve.ease * 0.8}
              tube={0.007}
              material={sleeveMat}
              position={[0, -fa.len + 0.012, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          </>
        )}
        <mesh geometry={handGeo} material={skin} position={[0, -fa.len - 0.05, 0]} scale={[0.62, 1, 1.05]} />
        {wristExtra?.({ y: -fa.len + 0.03, r: longSleeve ? fa.r2 + sleeve.ease : fa.r2 + 0.004, side })}
        {handExtra?.({ y: -fa.len - 0.06, side })}
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------------------
 * Corpo do manequim
 * ------------------------------------------------------------------------ */
function Body({ spec, torso, leg, skin }) {
  const torsoGeo = useMemo(() => new THREE.LatheGeometry(torso, 48), [torso])
  const legGeo = useMemo(() => new THREE.LatheGeometry(leg, 32), [leg])
  const neckGeo = useMemo(
    () => new THREE.CylinderGeometry(spec.neck.r * 0.9, spec.neck.r, spec.neck.y1 - spec.neck.y0, 24),
    [spec],
  )
  return (
    <group>
      <mesh geometry={torsoGeo} material={skin} scale={[1, 1, spec.depth]} />
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={legGeo} material={skin} position={[side * spec.hipX, 0, 0]} />
      ))}
      <mesh geometry={neckGeo} material={skin} position={[0, (spec.neck.y0 + spec.neck.y1) / 2, 0]} />
      <Sphere r={spec.head.r} segments={40} material={skin} position={[0, spec.head.y, 0]} scale={spec.head.scale} />
    </group>
  )
}

/* ---------------------------------------------------------------------------
 * Parte de cima
 * ------------------------------------------------------------------------ */
function Top({ top, shape, spec, torso, lite }) {
  const mat = getFabricMaterial(top.color, top.fabric, lite)
  const points = useMemo(
    () => shellProfile(torso, shape.y0, shape.yNeck, shape.ease, { steps: 46, top: shape.neckTop }),
    [torso, shape],
  )
  const trim = top.trim ? getSolidMaterial(`trim|${top.trim}`, () => new THREE.MeshStandardMaterial({ color: top.trim, roughness: 0.5 })) : null
  const printFront = top.printFront && getPrintTexture(top.printFront)
  const printBack = top.printBack && getPrintTexture(top.printBack)
  const sh = spec.shoulder[1]
  const phiStart = shape.open ? shape.open / 2 : 0
  const phiLength = shape.open ? TAU - shape.open : TAU

  return (
    <group>
      {top.inner && <InnerTop inner={top.inner} spec={spec} torso={torso} lite={lite} />}
      <Lathe points={points} segments={56} phiStart={phiStart} phiLength={phiLength} material={mat} scale={[1, 1, spec.depth]} />

      {/* Barra (bainha) — escala no grupo pai para achatar depois de girar */}
      <group position={[0, shape.y0 + 0.004, 0]} scale={[1, 1, spec.depth]}>
        <Ring
          radius={(typeof shape.ease === 'function' ? shape.ease(shape.y0 + 0.004, radiusAt(torso, shape.y0 + 0.004)) : radiusAt(torso, shape.y0) + shape.ease) - 0.002}
          tube={0.0065}
          arc={phiLength}
          material={trim || mat}
          rotation={[Math.PI / 2, 0, Math.PI / 2 + phiStart]}
        />
      </group>

      {/* Gola */}
      {!shape.open && (
        <Ring
          radius={shape.neckTop[0] + 0.002}
          tube={top.type === 'hoodie' ? 0.012 : 0.008}
          material={trim || mat}
          position={[0, shape.neckTop[1] - 0.004, 0.006]}
          rotation={[Math.PI / 2 + 0.28, 0, 0]}
          scale={[1, spec.depth + 0.12, 1]}
        />
      )}

      {/* Cavas (regata / camisa de time) */}
      {top.type === 'jersey' &&
        trim &&
        [-1, 1].map((side) => (
          <Ring
            key={side}
            radius={spec.shoulderR + 0.022}
            tube={0.0065}
            material={trim}
            position={[side * (spec.shoulder[0] - 0.012), sh - 0.03, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[1.35, 1, 1]}
          />
        ))}

      {/* Estampas */}
      {printBack && (
        <Decal torso={torso} ease={shape.ease} y0={sh - 0.36} y1={sh - 0.06} center={Math.PI} width={1.5} texture={printBack} depth={spec.depth} />
      )}
      {printFront && (
        <Decal
          torso={torso}
          ease={shape.ease}
          y0={top.printFront.crown ? sh - 0.16 : sh - 0.36}
          y1={top.printFront.crown ? sh - 0.09 : sh - 0.08}
          center={top.printFront.crown ? 0.42 : 0}
          width={top.printFront.crown ? 0.34 : 1.35}
          texture={printFront}
          depth={spec.depth}
        />
      )}

      {/* Capuz do moletom */}
      {top.type === 'hoodie' && (
        <>
          <Sphere
            r={0.13}
            material={mat}
            position={[0, spec.neck.y0 + 0.04, -0.075]}
            scale={[1, 0.62, 0.72]}
          />
        </>
      )}

      {/* Lapelas do blazer */}
      {top.type === 'blazer' && <Lapels spec={spec} torso={torso} ease={shape.ease} material={mat} />}
    </group>
  )
}

function InnerTop({ inner, spec, torso, lite }) {
  const mat = getFabricMaterial(inner.color, inner.fabric, lite)
  const points = useMemo(
    () => shellProfile(torso, 0.98, spec.neck.y0 + 0.022, 0.007, { steps: 34, top: [spec.neck.r + 0.01, spec.neck.y0 + 0.032] }),
    [torso, spec],
  )
  return <Lathe points={points} segments={48} material={mat} scale={[1, 1, spec.depth]} />
}

function Lapels({ spec, torso, ease, material }) {
  // Duas faixas em "V" apoiadas na frente do blazer
  const make = (side) => {
    const top = new THREE.Vector3(side * 0.062, spec.neck.y0 - 0.01, 0)
    const bottom = new THREE.Vector3(side * 0.05, spec.waistY + 0.06, 0)
    for (const p of [top, bottom]) {
      const r = ease(p.y, radiusAt(torso, p.y))
      const nx = Math.min(0.95, Math.abs(p.x) / r)
      p.z = r * spec.depth * Math.sqrt(1 - nx * nx) + 0.006
    }
    const mid = top.clone().add(bottom).multiplyScalar(0.5)
    const len = top.distanceTo(bottom)
    const dir = top.clone().sub(bottom).normalize()
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), side * -0.35)
    return { mid, len, quat: tilt.multiply(quat) }
  }
  return [-1, 1].map((side) => {
    const { mid, len, quat } = make(side)
    return (
      <RoundedBox
        key={side}
        args={[0.056, len, 0.01]}
        radius={0.004}
        smoothness={2}
        material={material}
        position={mid}
        quaternion={quat}
      />
    )
  })
}

/* ---------------------------------------------------------------------------
 * Parte de baixo
 * ------------------------------------------------------------------------ */
function Bottom({ bottom, spec, torso, leg, lite }) {
  const shape = bottomShape(bottom, spec)
  const mat = getFabricMaterial(bottom.color, bottom.fabric, lite)
  const pelvis = useMemo(
    () => shellProfile(torso, 0.808, shape.waist, shape.ease, { steps: 20, closeBottom: true }),
    [torso, shape.waist, shape.ease],
  )
  const legFn = useMemo(() => shape.leg(leg), [shape, leg])
  const legPoints = useMemo(() => {
    const pts = []
    const steps = 40
    for (let i = 0; i <= steps; i++) {
      const y = shape.hem + ((0.905 - shape.hem) * i) / steps
      pts.push(new THREE.Vector2(legFn(y), y))
    }
    return pts
  }, [legFn, shape.hem])
  const waistR = radiusAt(torso, shape.waist) + shape.ease
  const denim = bottom.fabric === 'denim'

  return (
    <group>
      <Lathe points={pelvis} segments={48} material={mat} scale={[1, 1, spec.depth]} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * spec.hipX, 0, 0]}>
          <Lathe points={legPoints} segments={36} material={mat} />
          <Ring
            radius={legFn(shape.hem + 0.004) - 0.001}
            tube={0.006}
            material={mat}
            position={[0, shape.hem + 0.004, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
          {shape.pockets && (
            <RoundedBox
              args={[0.034, 0.14, 0.1]}
              radius={0.01}
              smoothness={2}
              material={mat}
              position={[side * (legFn(0.58) + 0.008), 0.58, 0.01]}
            />
          )}
        </group>
      ))}
      {/* Cós */}
      <Ring
        radius={waistR}
        tube={0.011}
        material={mat}
        position={[0, shape.waist - 0.008, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, spec.depth, 1]}
      />
      {denim && (
        <Decal
          torso={torso}
          ease={shape.ease + 0.001}
          y0={0.85}
          y1={Math.min(shape.waist - 0.03, 0.97)}
          center={Math.PI}
          width={1.9}
          texture={getPocketTexture()}
          depth={spec.depth}
        />
      )}
    </group>
  )
}

/* ---------------------------------------------------------------------------
 * Calçados
 * ------------------------------------------------------------------------ */
function Shoes({ shoes, spec, lite }) {
  const upperMat = getFabricMaterial(shoes.color, 'leather', lite)
  const soleMat = plasticMaterial(shoes.sole || '#f2f0ea', 0.6)
  const accentMat = shoes.accent === '#f5c542' ? goldMaterial(lite) : plasticMaterial(shoes.accent || '#f5c542', 0.4)
  const loafer = shoes.type === 'loafer'
  const upperGeo = useMemo(
    () => (loafer ? new THREE.CapsuleGeometry(0.037, 0.16, 6, 18) : new THREE.CapsuleGeometry(0.047, 0.15, 6, 18)),
    [loafer],
  )

  return [-1, 1].map((side) => (
    <group key={side} position={[side * spec.footX, 0, 0.035]} rotation={[0, side * 0.06, 0]}>
      {loafer ? (
        <>
          <RoundedBox args={[0.084, 0.018, 0.255]} radius={0.008} smoothness={2} material={soleMat} position={[0, 0.009, 0]} />
          <mesh geometry={upperGeo} material={upperMat} position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1, 0.72]} />
          <Ring radius={0.016} tube={0.0035} material={accentMat} position={[0, 0.07, 0.055]} rotation={[-0.9, 0, 0]} />
          <RoundedBox args={[0.06, 0.03, 0.05]} radius={0.006} smoothness={2} material={soleMat} position={[0, 0.015, -0.1]} />
        </>
      ) : (
        <>
          <RoundedBox args={[0.104, 0.036, 0.285]} radius={0.013} smoothness={3} material={soleMat} position={[0, 0.018, 0]} />
          <mesh geometry={upperGeo} material={upperMat} position={[0, 0.064, -0.004]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1, 0.78]} />
          <Ring radius={0.038} tube={0.012} material={upperMat} position={[0, 0.098, -0.052]} rotation={[Math.PI / 2, 0, 0]} />
          {[0, 1, 2].map((i) => (
            <RoundedBox
              key={i}
              args={[0.046, 0.006, 0.01]}
              radius={0.002}
              smoothness={1}
              material={soleMat}
              position={[0, 0.098 - i * 0.006, 0.012 + i * 0.024]}
              rotation={[-0.35, 0, 0]}
            />
          ))}
          <RoundedBox args={[0.03, 0.045, 0.012]} radius={0.004} smoothness={2} material={accentMat} position={[0, 0.075, -0.142]} />
        </>
      )}
    </group>
  ))
}

/* ---------------------------------------------------------------------------
 * Acessórios
 * ------------------------------------------------------------------------ */
function Cap({ extra, spec, lite }) {
  const mat = getFabricMaterial(extra.color || '#111114', 'cotton', lite)
  const h = spec.head
  const domeGeo = useMemo(() => new THREE.SphereGeometry(h.r * 1.07, 36, 18, 0, TAU, 0, Math.PI * 0.5), [h.r])
  const brimGeo = useMemo(() => new THREE.CylinderGeometry(h.r * 0.92, h.r * 0.92, 0.008, 36, 1, false, -Math.PI / 2, Math.PI), [h.r])
  const capProfile = useMemo(() => {
    const R = h.r * 1.07
    return Array.from({ length: 12 }, (_, i) => {
      const y = (R * 0.95 * i) / 11
      return new THREE.Vector2(Math.sqrt(Math.max(0, R * R - y * y)), y)
    })
  }, [h.r])
  return (
    <group position={[0, h.y + h.r * 0.12, 0]} rotation={[-0.12, 0, 0]}>
      <mesh geometry={domeGeo} material={mat} scale={h.scale} />
      <mesh geometry={brimGeo} material={mat} position={[0, 0.004, h.r * 0.42]} rotation={[0.16, 0, 0]} scale={[0.95, 1, 1.5]} />
      <Sphere r={0.011} material={mat} position={[0, h.r * 1.07 * h.scale[1], 0]} segments={12} />
      <group scale={h.scale}>
        <Decal
          torso={capProfile}
          ease={0}
          y0={h.r * 0.2}
          y1={h.r * 0.72}
          center={0}
          width={0.9}
          texture={getPrintTexture({ crown: true, color: '#f5c542' })}
          depth={1}
        />
      </group>
    </group>
  )
}

function Chain({ spec, torso, surface, lite }) {
  const geo = useMemo(() => {
    const pts = []
    const count = 48
    const yTop = spec.neck.y0 + 0.045
    const yBottom = spec.shoulder[1] - 0.055
    for (let i = 0; i < count; i++) {
      const phi = (i / count) * TAU
      const drop = Math.pow((1 + Math.cos(phi)) / 2, 1.6)
      const y = yTop - (yTop - yBottom) * drop
      const r = Math.max(surface(y, radiusAt(torso, y)), spec.neck.r + 0.012) + 0.007
      pts.push(new THREE.Vector3(Math.sin(phi) * r, y, Math.cos(phi) * r * spec.depth + (1 - drop) * 0.004))
    }
    const curve = new THREE.CatmullRomCurve3(pts, true)
    return { tube: new THREE.TubeGeometry(curve, 160, 0.0048, 6, true), front: pts[0] }
  }, [spec, torso, surface])
  const gold = goldMaterial(lite)
  return (
    <group>
      <mesh geometry={geo.tube} material={gold} />
      {/* Pingente: o rei do xadrez da marca */}
      <mesh
        geometry={getKingGeometry()}
        material={gold}
        position={[geo.front.x, geo.front.y - 0.052, geo.front.z + 0.012]}
        scale={0.021}
      />
    </group>
  )
}

function Watch({ y, r, lite }) {
  const gold = goldMaterial(lite)
  const face = getSolidMaterial('watch-face', () => new THREE.MeshPhysicalMaterial({ color: '#0a0a0c', roughness: 0.1, clearcoat: 1 }))
  return (
    <group position={[0, y, 0]}>
      <Ring radius={r + 0.006} tube={0.0075} material={gold} rotation={[Math.PI / 2, 0, 0]} />
      <group position={[-(r + 0.012), 0, 0.004]} rotation={[0, 0, Math.PI / 2]}>
        <mesh material={gold}>
          <cylinderGeometry args={[0.019, 0.019, 0.01, 28]} />
        </mesh>
        <mesh material={face} position={[0, -0.0055, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.002, 28]} />
        </mesh>
      </group>
    </group>
  )
}

function Bag({ y, spec, color, lite }) {
  const leather = getFabricMaterial(color || '#8a5a2b', 'leather', lite)
  const gold = goldMaterial(lite)
  // desfaz a rotação do braço para a bolsa pender na vertical
  const rotation = useMemo(() => new THREE.Euler(-spec.elbowBend, 0, -spec.spread, 'XYZ'), [spec])
  return (
    <group position={[0.004, y, 0]} rotation={rotation}>
      <Ring radius={0.055} tube={0.006} arc={Math.PI} material={leather} position={[0.02, -0.055, 0]} rotation={[0, Math.PI / 2, 0]} />
      <RoundedBox args={[0.075, 0.17, 0.25]} radius={0.018} smoothness={3} material={leather} position={[0.02, -0.14, 0]} />
      <RoundedBox args={[0.012, 0.022, 0.06]} radius={0.003} smoothness={1} material={gold} position={[0.061, -0.09, 0]} />
    </group>
  )
}

function Belt({ spec, torso, bottom, lite }) {
  const shape = bottomShape(bottom, spec)
  const y = shape.waist - 0.022
  const r = radiusAt(torso, y) + shape.ease + 0.006
  const leather = getSolidMaterial('belt', () => new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.35 }))
  const gold = goldMaterial(lite)
  return (
    <group position={[0, y, 0]}>
      <mesh material={leather} scale={[1, 1, spec.depth]}>
        <cylinderGeometry args={[r, r, 0.024, 48, 1, true]} />
      </mesh>
      <RoundedBox args={[0.05, 0.034, 0.008]} radius={0.004} smoothness={2} material={gold} position={[0, 0, r * spec.depth + 0.004]} />
    </group>
  )
}

/* ---------------------------------------------------------------------------
 * Manequim completo
 * ------------------------------------------------------------------------ */
export function Mannequin({ look, lite = false }) {
  const { spec, torso, leg } = getBodyProfiles(look.body)
  const skin = mannequinMaterial(lite)
  const { top, bottom, shoes, extras = [] } = look.outfit
  const shape = useMemo(() => (top ? topShape(top, spec, torso) : null), [top, spec, torso])
  const sleeveMat = top ? getFabricMaterial(top.color, top.fabric, lite) : null
  const has = (type) => extras.find((e) => e.type === type)
  const bag = has('bag')
  const surface = useMemo(() => {
    if (!shape) return (y, r) => r + 0.004
    return typeof shape.ease === 'function' ? shape.ease : (y, r) => r + shape.ease
  }, [shape])

  return (
    <group>
      <Body spec={spec} torso={torso} leg={leg} skin={skin} />
      {[-1, 1].map((side) => (
        <Arm
          key={side}
          spec={spec}
          side={side}
          skin={skin}
          sleeve={shape?.sleeve}
          sleeveMat={sleeveMat}
          wristExtra={has('watch') && side === -1 ? ({ y, r }) => <Watch y={y} r={r} lite={lite} /> : null}
          handExtra={bag && side === 1 ? ({ y }) => <Bag y={y} spec={spec} color={bag.color} lite={lite} /> : null}
        />
      ))}
      {top && <Top top={top} shape={shape} spec={spec} torso={torso} lite={lite} />}
      {bottom && <Bottom bottom={bottom} spec={spec} torso={torso} leg={leg} lite={lite} />}
      {shoes && <Shoes shoes={shoes} spec={spec} lite={lite} />}
      {has('cap') && <Cap extra={has('cap')} spec={spec} lite={lite} />}
      {has('chain') && <Chain spec={spec} torso={torso} surface={surface} lite={lite} />}
      {has('belt') && bottom && <Belt spec={spec} torso={torso} bottom={bottom} lite={lite} />}
    </group>
  )
}
