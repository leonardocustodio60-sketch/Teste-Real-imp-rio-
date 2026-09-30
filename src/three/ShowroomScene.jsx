import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { Mannequin } from './Mannequin'
import { getAnchors } from './anatomy'
import { StudioEnvironment, StudioLights, BlobShadow, Pedestal } from './Studio'

const TAU = Math.PI * 2
const RING_RADIUS = 2.3
const damp = THREE.MathUtils.damp

// Enquadramentos da câmera (relativos ao manequim ativo)
const SHOTS = {
  full: { pos: [0, 1.12, 4.5], target: [0, 0.96, 0] },
  upper: { pos: [0, 1.46, 1.75], target: [0, 1.34, 0] },
  lower: { pos: [0, 0.55, 1.8], target: [0, 0.4, 0] },
}

const tmpPos = new THREE.Vector3()
const tmpNormal = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()
const tmpView = new THREE.Vector3()

/**
 * Projeta os pontos de detalhe (hotspots) do manequim ativo para a tela e
 * posiciona as etiquetas DOM (renderizadas pelo componente Showroom).
 * Etiquetas somem quando o ponto fica de costas para a câmera.
 */
function updateHotspots(anchors, elements, normals, camera, size) {
  for (let k = 0; k < elements.length; k++) {
    const el = elements[k]
    const obj = anchors[k]
    if (!el) continue
    if (!obj) {
      el.dataset.visible = 'false'
      continue
    }
    obj.getWorldPosition(tmpPos)
    obj.getWorldQuaternion(tmpQuat)
    tmpNormal.copy(normals[k]).applyQuaternion(tmpQuat)
    tmpView.copy(camera.position).sub(tmpPos).normalize()
    const facing = tmpNormal.dot(tmpView) > 0.2
    tmpPos.project(camera)
    const inside = tmpPos.z < 1 && Math.abs(tmpPos.x) < 0.98 && Math.abs(tmpPos.y) < 0.9
    const x = (tmpPos.x * 0.5 + 0.5) * size.width
    const y = (-tmpPos.y * 0.5 + 0.5) * size.height
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    const show = facing && inside ? 'true' : 'false'
    if (el.dataset.visible !== show) el.dataset.visible = show
    // perto da borda direita, a etiqueta abre para a esquerda
    const side = x > size.width * 0.6 ? 'left' : 'right'
    if (el.dataset.side !== side) el.dataset.side = side
  }
}

function ShowroomContent({ looks, active, zoom, autoRotate, drag, progress, pointer, lite, reducedMotion, hotspotEls }) {
  const ring = useRef()
  const figures = useRef([])
  const n = looks.length
  const s = useRef({
    ring: -active * (TAU / n),
    idle: looks.map(() => 0),
    cam: new THREE.Vector3(0, 1.12, RING_RADIUS + 4.5),
    target: new THREE.Vector3(0, 0.96, RING_RADIUS),
  })
  const anchors = useMemo(() => ({ m: getAnchors('m'), f: getAnchors('f') }), [])
  const anchorObjs = useRef([])
  const activeLook = looks[active]
  const normals = useMemo(
    () => (activeLook.hotspots || []).map((h) => new THREE.Vector3(...anchors[activeLook.body][h.anchor].normal).normalize()),
    [activeLook, anchors],
  )

  useFrame(({ camera, size }, dt) => {
    const st = s.current
    const delta = Math.min(dt, 0.05)

    // 1) carrossel: leva o look ativo para a frente pelo menor caminho
    const goal = -active * (TAU / n)
    let diff = goal - st.ring
    diff = ((((diff + Math.PI) % TAU) + TAU) % TAU) - Math.PI
    st.ring += diff * (1 - Math.exp(-4.5 * delta))
    const scrollTwist = reducedMotion ? 0 : (0.5 - progress.current) * 0.5
    ring.current.rotation.y = st.ring + scrollTwist

    // 2) giro do manequim ativo (arraste com inércia + giro automático)
    const d = drag.current
    if (!d.dragging) {
      d.rot += d.vel * delta
      d.vel *= Math.exp(-3.2 * delta)
      if (autoRotate && !reducedMotion && Math.abs(d.vel) < 0.05) d.rot += delta * 0.38
    }
    looks.forEach((_, i) => {
      const fig = figures.current[i]
      if (!fig) return
      const base = i * (TAU / n)
      if (i === active) {
        fig.rotation.y = base + d.rot - scrollTwist
      } else {
        if (!reducedMotion) st.idle[i] += delta * 0.3
        fig.rotation.y = base + st.idle[i]
      }
    })

    // 3) câmera: enquadramento escolhido + leve parallax do mouse
    const shot = SHOTS[zoom] || SHOTS.full
    const aspect = size.width / Math.max(1, size.height)
    const far = zoom === 'full' ? (aspect < 0.85 ? 1.22 : aspect < 1.2 ? 1.08 : 1) : aspect < 0.85 ? 1.2 : 1
    const px = reducedMotion ? 0 : pointer.current.x * 0.22
    const py = reducedMotion ? 0 : pointer.current.y * 0.1
    st.cam.set(shot.pos[0] + px, shot.pos[1] + py, RING_RADIUS + shot.pos[2] * far)
    st.target.set(shot.target[0], shot.target[1], RING_RADIUS)
    camera.position.x = damp(camera.position.x, st.cam.x, 3.5, delta)
    camera.position.y = damp(camera.position.y, st.cam.y, 3.5, delta)
    camera.position.z = damp(camera.position.z, st.cam.z, 3.5, delta)
    camera.userData.look ??= st.target.clone()
    camera.userData.look.lerp(st.target, 1 - Math.exp(-3.5 * delta))
    camera.lookAt(camera.userData.look)

    // 4) etiquetas de detalhe acompanham o manequim ativo
    if (hotspotEls) {
      camera.updateMatrixWorld()
      updateHotspots(anchorObjs.current, hotspotEls.current, normals, camera, size)
    }
  })

  return (
    <>
      <fog attach="fog" args={['#070708', 6.5, 13]} />
      <StudioLights intensity={1.05} />
      <StudioEnvironment />

      <group ref={ring}>
        <Pedestal radius={RING_RADIUS + 0.85} height={0.03} glow={0.7} />
        {looks.map((look, i) => {
          const angle = i * (TAU / n)
          return (
            <group key={look.id} position={[Math.sin(angle) * RING_RADIUS, 0.03, Math.cos(angle) * RING_RADIUS]}>
              <Pedestal radius={0.46} height={0.06} glow={i === active ? 1.6 : 0.6} />
              <group ref={(el) => (figures.current[i] = el)} position={[0, 0.06, 0]}>
                <Mannequin look={look} lite={lite} />
                {i === active &&
                  look.hotspots?.map((h, k) => (
                    <object3D
                      key={`${look.id}-${h.anchor}`}
                      ref={(el) => (anchorObjs.current[k] = el)}
                      position={anchors[look.body][h.anchor].pos}
                    />
                  ))}
              </group>
              <BlobShadow size={1.05} opacity={0.75} y={0.062} />
            </group>
          )
        })}
      </group>

      <Sparkles count={lite ? 24 : 60} scale={[7, 3.2, 7]} position={[0, 1.6, 0]} size={2} speed={reducedMotion ? 0 : 0.25} color="#f5c542" opacity={0.55} />
    </>
  )
}

/**
 * Provador 3D: carrossel de manequins com looks da loja.
 * - arraste horizontal gira o look (controlado pelo DOM via `drag`)
 * - `zoom` alterna entre look inteiro / parte de cima / parte de baixo
 * - `active=false` pausa a renderização quando a seção sai da tela
 */
export default function ShowroomScene({ quality, visible, ...props }) {
  const lite = quality === 'lite'
  return (
    <Canvas
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      frameloop={visible ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.12, RING_RADIUS + 4.5], fov: 30, near: 0.05, far: 60 }}
    >
      <ShowroomContent lite={lite} {...props} />
    </Canvas>
  )
}
