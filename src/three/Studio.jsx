import { useMemo } from 'react'
import * as THREE from 'three'
import { Environment, Lightformer } from '@react-three/drei'
import { getBlobShadowTexture } from './materials'

/**
 * Iluminação de estúdio "cyber-imperial": softboxes brancas + recorte dourado.
 * O mapa de ambiente é gerado localmente com Lightformers (nenhum HDR baixado).
 */
export function StudioEnvironment({ lite }) {
  return (
    <Environment resolution={lite ? 128 : 256} frames={1}>
      <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 6, 1]} scale={[10, 4, 1]} />
      <Lightformer form="rect" intensity={1.8} color="#fff1d6" position={[-6, 2, 3]} scale={[3, 7, 1]} />
      <Lightformer form="rect" intensity={3.2} color="#f5c542" position={[6, 1.5, -2]} scale={[2.5, 7, 1]} />
      <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 2, 8]} scale={4} />
      <Lightformer form="rect" intensity={0.6} color="#f5c542" position={[0, -4, 0]} scale={[12, 12, 1]} />
    </Environment>
  )
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
