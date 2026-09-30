import * as THREE from 'three'
import { smoothProfile } from './anatomy'

/**
 * Peças de xadrez do logo da Real Império, torneadas proceduralmente (LatheGeometry).
 * Altura aproximada: rei 2.45 / rainha 2.1 (unidades da cena).
 */
const KING = [
  [0, 0], [0.6, 0], [0.63, 0.03], [0.63, 0.11], [0.57, 0.15], [0.58, 0.2], [0.5, 0.25], [0.42, 0.31],
  [0.37, 0.4], [0.32, 0.56], [0.27, 0.82], [0.23, 1.1], [0.21, 1.3], [0.3, 1.35], [0.36, 1.4],
  [0.3, 1.45], [0.25, 1.49], [0.31, 1.53], [0.4, 1.64], [0.46, 1.82], [0.4, 1.88], [0.22, 1.92],
  [0.14, 1.98], [0.08, 2.03], [0, 2.04],
]

const QUEEN = [
  [0, 0], [0.58, 0], [0.61, 0.03], [0.61, 0.1], [0.55, 0.14], [0.56, 0.19], [0.47, 0.25], [0.38, 0.33],
  [0.32, 0.5], [0.25, 0.85], [0.2, 1.15], [0.19, 1.3], [0.28, 1.36], [0.33, 1.41], [0.27, 1.45],
  [0.23, 1.5], [0.3, 1.57], [0.41, 1.74], [0.45, 1.82], [0.36, 1.84], [0.2, 1.88], [0.1, 1.9], [0, 1.9],
]

let kingGeo
let queenGeo

export function getKingGeometry() {
  kingGeo ??= new THREE.LatheGeometry(smoothProfile(KING, 220), 96)
  return kingGeo
}

export function getQueenGeometry() {
  queenGeo ??= new THREE.LatheGeometry(smoothProfile(QUEEN, 200), 96)
  return queenGeo
}

/** Cruz do rei (em cima da coroa). */
export const KING_CROSS = [
  { size: [0.12, 0.44, 0.12], pos: [0, 2.24, 0] },
  { size: [0.36, 0.12, 0.12], pos: [0, 2.3, 0] },
]

/** Pérolas da coroa da rainha. */
export function queenCoronet(count = 10) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2
    return [Math.sin(a) * 0.4, 1.87, Math.cos(a) * 0.4]
  })
}
