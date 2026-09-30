import * as THREE from 'three'

/**
 * Proporções dos manequins (em metros). Perfis [raio, altura] giram em torno
 * do eixo Y (LatheGeometry) e depois são achatados em Z (`depth`), gerando
 * silhuetas suaves sem precisar de nenhum modelo externo.
 */
export const BODIES = {
  m: {
    torso: [
      [0, 0.8], [0.12, 0.805], [0.163, 0.85], [0.17, 0.93], [0.157, 1.03], [0.163, 1.13],
      [0.183, 1.25], [0.19, 1.35], [0.184, 1.42], [0.15, 1.485], [0.085, 1.525], [0.05, 1.555], [0, 1.565],
    ],
    depth: 0.66,
    leg: [
      [0, 0.065], [0.03, 0.07], [0.036, 0.1], [0.043, 0.2], [0.056, 0.32], [0.05, 0.44], [0.047, 0.5],
      [0.058, 0.6], [0.074, 0.72], [0.085, 0.82], [0.07, 0.89], [0, 0.91],
    ],
    hipX: 0.09,
    shoulder: [0.2, 1.43],
    shoulderR: 0.056,
    upperArm: { len: 0.29, r1: 0.047, r2: 0.037 },
    forearm: { len: 0.26, r1: 0.036, r2: 0.027 },
    spread: 0.11,
    elbowBend: -0.22,
    neck: { r: 0.047, y0: 1.5, y1: 1.67 },
    head: { r: 0.104, y: 1.765, scale: [0.86, 1.1, 0.95] },
    waistY: 1.0,
    footX: 0.1,
  },
  f: {
    torso: [
      [0, 0.8], [0.12, 0.805], [0.172, 0.86], [0.18, 0.94], [0.16, 1.02], [0.14, 1.08], [0.148, 1.17],
      [0.168, 1.26], [0.163, 1.33], [0.156, 1.4], [0.122, 1.46], [0.07, 1.5], [0.042, 1.53], [0, 1.54],
    ],
    depth: 0.7,
    leg: [
      [0, 0.065], [0.027, 0.07], [0.032, 0.1], [0.039, 0.2], [0.052, 0.32], [0.045, 0.44], [0.043, 0.5],
      [0.056, 0.6], [0.073, 0.72], [0.086, 0.83], [0.07, 0.89], [0, 0.91],
    ],
    hipX: 0.092,
    shoulder: [0.168, 1.4],
    shoulderR: 0.048,
    upperArm: { len: 0.27, r1: 0.04, r2: 0.032 },
    forearm: { len: 0.24, r1: 0.031, r2: 0.024 },
    spread: 0.12,
    elbowBend: -0.2,
    neck: { r: 0.04, y0: 1.47, y1: 1.63 },
    head: { r: 0.098, y: 1.715, scale: [0.84, 1.1, 0.95] },
    waistY: 1.06,
    footX: 0.095,
  },
}

/** Curva suave (Catmull-Rom) a partir de pontos de controle. */
export function smoothProfile(points, samples = 72) {
  const curve = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)))
  return curve.getPoints(samples).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y))
}

/** Raio do perfil em uma altura y (interpolação linear entre amostras). */
export function radiusAt(profile, y) {
  if (y <= profile[0].y) return profile[0].x
  for (let i = 1; i < profile.length; i++) {
    const a = profile[i - 1]
    const b = profile[i]
    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / Math.max(1e-6, b.y - a.y)
      return a.x + (b.x - a.x) * t
    }
  }
  return profile[profile.length - 1].x
}

const bodyCache = new Map()

/** Perfis suavizados (em cache) de um tipo de corpo. */
export function getBodyProfiles(type) {
  if (bodyCache.has(type)) return bodyCache.get(type)
  const spec = BODIES[type]
  const value = { spec, torso: smoothProfile(spec.torso), leg: smoothProfile(spec.leg) }
  bodyCache.set(type, value)
  return value
}

/**
 * Gera o perfil de uma peça que "veste" o corpo:
 * amostra o perfil do corpo entre y0 e y1 e soma a folga ease(y).
 */
export function shellProfile(profile, y0, y1, ease, { steps = 40, closeBottom = false, top } = {}) {
  const pts = []
  if (closeBottom) pts.push(new THREE.Vector2(0, y0 - 0.004))
  for (let i = 0; i <= steps; i++) {
    const y = y0 + ((y1 - y0) * i) / steps
    const r = typeof ease === 'function' ? ease(y, radiusAt(profile, y)) : radiusAt(profile, y) + ease
    pts.push(new THREE.Vector2(Math.max(0.001, r), y))
  }
  if (top) pts.push(new THREE.Vector2(top[0], top[1]))
  return pts
}

/** Membro afunilado (cilindro + tampas esféricas) ao longo de -Y. */
export function limbGeometry(r1, r2, len, radial = 20) {
  const geo = new THREE.CylinderGeometry(r1, r2, len, radial, 1, true)
  geo.translate(0, -len / 2, 0)
  return geo
}

/** Posição de um ponto do braço (para anexar acessórios e hotspots). */
export function armPoint(spec, side, alongForearm) {
  const [sx, sy] = spec.shoulder
  const rz = new THREE.Euler(0, 0, side * spec.spread)
  const elbow = new THREE.Vector3(0, -spec.upperArm.len, 0).applyEuler(rz)
  const forearm = new THREE.Vector3(0, -alongForearm, 0)
    .applyEuler(new THREE.Euler(spec.elbowBend, 0, 0))
    .applyEuler(rz)
  return new THREE.Vector3(side * sx, sy, 0).add(elbow).add(forearm)
}

/** Pontos de interesse (hotspots) com a normal usada para esconder quando estão de costas. */
export function getAnchors(type) {
  const s = BODIES[type]
  const f = type === 'f'
  const wrist = armPoint(s, -1, s.forearm.len - 0.02)
  const hand = armPoint(s, 1, s.forearm.len + 0.14)
  return {
    chest: { pos: [0.07, f ? 1.27 : 1.3, f ? 0.14 : 0.155], normal: [0.2, 0, 1] },
    back: { pos: [0, f ? 1.22 : 1.26, f ? -0.145 : -0.16], normal: [0, 0, -1] },
    neck: { pos: [0.02, f ? 1.36 : 1.4, f ? 0.14 : 0.155], normal: [0, 0.2, 1] },
    head: { pos: [0, s.head.y + 0.13, 0.02], normal: [0, 0.6, 0.8] },
    waist: { pos: [0.1, s.waistY, f ? 0.12 : 0.125], normal: [0.3, 0, 1] },
    thigh: { pos: [0.16, 0.66, 0.08], normal: [0.6, 0, 0.8] },
    knee: { pos: [0.15, 0.47, 0.1], normal: [0.5, 0, 0.85] },
    foot: { pos: [s.footX, 0.1, 0.2], normal: [0, 0.3, 1] },
    wrist: { pos: [wrist.x - 0.035, wrist.y, wrist.z + 0.02], normal: [-0.8, 0, 0.6] },
    hand: { pos: [hand.x + 0.05, hand.y, hand.z + 0.05], normal: [0.6, 0, 0.8] },
  }
}
