import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { getBlobShadowTexture } from './materials'

// Softboxes do estúdio: [cor, intensidade, posição, escala, forma]
const SOFTBOXES = [
  ['#ffffff', 2.4, [0, 6, 1], [10, 4, 1], 'rect'],
  ['#fff1d6', 1.8, [-6, 2, 3], [3, 7, 1], 'rect'],
  ['#f5c542', 3.2, [6, 1.5, -2], [2.5, 7, 1], 'rect'],
  ['#ffffff', 2, [0, 2, 8], [4, 4, 1], 'ring'],
  ['#f5c542', 0.6, [0, -4, 0], [12, 12, 1], 'rect'],
]

/**
 * Iluminação de estúdio "cyber-imperial": softboxes brancas + recorte dourado.
 * O mapa de reflexos é gerado uma única vez no próprio navegador (PMREM),
 * sem baixar nenhum arquivo HDR.
 */
export function StudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const studio = new THREE.Scene()
    const disposables = []
    for (const [color, intensity, pos, scale, form] of SOFTBOXES) {
      const geo = form === 'ring' ? new THREE.RingGeometry(0.25, 0.5, 48) : new THREE.PlaneGeometry(1, 1)
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...pos)
      mesh.scale.set(...scale)
      mesh.lookAt(0, 0, 0)
      studio.add(mesh)
      disposables.push(geo, mat)
    }
    const target = pmrem.fromScene(studio, 0.03)
    scene.environment = target.texture
    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      disposables.forEach((d) => d.dispose())
    }
  }, [gl, scene])

  return null
}

export function StudioLights({ intensity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.22 * intensity} />
      <directionalLight position={[3.5, 6, 5]} intensity={2.1 * intensity} color="#fff6e8" />
      <spotLight position={[-4.5, 4.5, -4]} angle={0.6} penumbra={1} intensity={70 * intensity} color="#f5c542" decay={2} />
      <pointLight position={[4, 2.2, -3]} intensity={18 * intensity} color="#ffffff" decay={2} />
    </>
  )
}

/** Sombra de contato barata sob cada objeto. */
export function BlobShadow({ size = 1, opacity = 0.8, y = 0.002 }) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getBlobShadowTexture(),
        transparent: true,
        depthWrite: false,
        opacity,
      }),
    [opacity],
  )
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={mat}>
      <planeGeometry args={[size, size]} />
    </mesh>
  )
}

/** Pedestal com anel neon dourado. */
export function Pedestal({ radius = 0.5, height = 0.07, glow = 1 }) {
  const baseMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#0b0b0e', roughness: 0.22, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.1 }),
    [],
  )
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#f5c542').multiplyScalar(1.4 * glow), toneMapped: false }),
    [glow],
  )
  return (
    <group>
      <mesh material={baseMat} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 1.04, height, 64]} />
      </mesh>
      <mesh material={glowMat} position={[0, height + 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.97, 0.005, 8, 96]} />
      </mesh>
      <mesh material={glowMat} position={[0, 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.045, 0.004, 8, 96]} />
      </mesh>
    </group>
  )
}
