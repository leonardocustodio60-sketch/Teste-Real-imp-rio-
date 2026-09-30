import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Grid, Sparkles } from '@react-three/drei'
import { getKingGeometry, getQueenGeometry, KING_CROSS, queenCoronet } from './chess'
import { goldMaterial } from './materials'
import { StudioEnvironment, StudioLights, BlobShadow, Pedestal } from './Studio'

const damp = THREE.MathUtils.damp

function useChessMaterials(lite) {
  const gold = goldMaterial(lite)
  const obsidian = useMemo(
    () =>
      lite
        ? new THREE.MeshStandardMaterial({ color: '#0d0d10', roughness: 0.18, metalness: 0.5 })
        : new THREE.MeshPhysicalMaterial({ color: '#0c0c0f', roughness: 0.12, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.04 }),
    [lite],
  )
  const coronet = useMemo(() => queenCoronet(10), [])
  return { gold, obsidian, coronet }
}

function HeroContent({ progress, pointer, lite, reducedMotion }) {
  const root = useRef()
  const spin = useRef()
  const king = useRef()
  const queen = useRef()
  const rings = useRef()
  const state = useRef({ p: 0, spin: 0, px: 0, py: 0 })
  const { gold, obsidian, coronet } = useChessMaterials(lite)
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#f5c542', transparent: true, opacity: 0.55, toneMapped: false }),
    [],
  )

  useFrame(({ camera, size, clock }, dt) => {
    const s = state.current
    const delta = Math.min(dt, 0.05)
    const target = reducedMotion ? 0 : progress.current
    s.p = damp(s.p, target, 5, delta)
    if (!reducedMotion) s.spin += delta * 0.16
    s.px = damp(s.px, pointer.current.x, 3, delta)
    s.py = damp(s.py, pointer.current.y, 3, delta)

    // Composição responsiva: à direita no desktop, embaixo no celular
    const aspect = size.width / Math.max(1, size.height)
    const landscape = aspect >= 1.1
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 8.4 * aspect
    root.current.position.x = landscape ? Math.min(halfW * 0.44, 2.7) : 0
    root.current.scale.setScalar(landscape ? 1 : 0.8)

    spin.current.rotation.y = s.spin + s.p * Math.PI * 0.9
    const t = clock.elapsedTime
    const float = reducedMotion ? 0 : 1
    king.current.position.set(-0.6 - s.p * 0.55, 0.14 + Math.sin(t * 0.9) * 0.035 * float, -0.12)
    queen.current.position.set(0.6 + s.p * 0.55, 0.14 + Math.sin(t * 0.9 + 1.4) * 0.035 * float, 0.16)
    rings.current.rotation.set(0.35 + s.p * 0.6, s.spin * 1.6, 0.12)
    rings.current.children[1].rotation.set(1.1, 0, s.spin * -2.2)

    camera.position.set(s.px * 0.35, 1.8 + s.p * 1.3 + s.py * 0.18, (landscape ? 8.4 : 9.2) + s.p * 1.8)
    camera.lookAt(0, (landscape ? 1.12 : 1.55) - s.p * 0.2, 0)
  })

  return (
    <>
      <StudioLights />
      <StudioEnvironment />

      <group ref={root}>
        <group ref={spin}>
          <Pedestal radius={1.55} height={0.14} glow={1.2} />
          <group ref={king}>
            <mesh geometry={getKingGeometry()} material={gold} />
            {KING_CROSS.map((c, i) => (
              <mesh key={i} material={gold} position={c.pos}>
                <boxGeometry args={c.size} />
              </mesh>
            ))}
            <BlobShadow size={1.7} opacity={0.6} y={0.003} />
          </group>
          <group ref={queen} scale={0.92}>
            <mesh geometry={getQueenGeometry()} material={obsidian} />
            {coronet.map((p, i) => (
              <mesh key={i} material={gold} position={p}>
                <sphereGeometry args={[0.065, 16, 12]} />
              </mesh>
            ))}
            <mesh material={gold} position={[0, 2.02, 0]}>
              <sphereGeometry args={[0.11, 24, 18]} />
            </mesh>
            <mesh material={gold} position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.6, 0.018, 12, 96]} />
            </mesh>
            <BlobShadow size={1.6} opacity={0.6} y={0.003} />
          </group>
        </group>

        <group ref={rings} position={[0, 1.25, 0]}>
          <mesh material={ringMat}>
            <torusGeometry args={[1.95, 0.004, 8, 160]} />
          </mesh>
          <mesh material={ringMat}>
            <torusGeometry args={[2.2, 0.003, 8, 160]} />
          </mesh>
        </group>

        <Sparkles count={lite ? 36 : 90} scale={[5.5, 3.6, 5.5]} position={[0, 1.7, 0]} size={2.4} speed={reducedMotion ? 0 : 0.35} color="#f5c542" opacity={0.8} />
      </group>

      <Grid
        position={[0, 0, 0]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#2a2417"
        sectionSize={2.5}
        sectionThickness={1.1}
        sectionColor="#8a6a1c"
        fadeDistance={22}
        fadeStrength={1.6}
        infiniteGrid
      />
    </>
  )
}

/**
 * Cena 3D do topo: rei (dourado) e rainha (obsidiana) do logo da Real Império.
 * Gira com o tempo, reage à rolagem (parallax) e ao mouse. Pausa fora da tela.
 */
export default function HeroScene({ progress, pointer, quality, reducedMotion, active }) {
  const lite = quality === 'lite'
  return (
    <Canvas
      dpr={lite ? [1, 1.3] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.75, 7], fov: 32, near: 0.1, far: 80 }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <HeroContent progress={progress} pointer={pointer} lite={lite} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
