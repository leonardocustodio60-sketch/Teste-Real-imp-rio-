import * as THREE from 'three'

/**
 * Texturas de tecido geradas em tempo real (canvas) — nenhuma imagem para baixar.
 * São usadas como mapa de cor sutil + bump, e aparecem quando o cliente aproxima a câmera.
 */
const textureCache = new Map()

function makeCanvas(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  return [c, c.getContext('2d')]
}

const patterns = {
  // trama simples (algodão)
  cotton(ctx, s) {
    ctx.fillStyle = '#e6e6e6'
    ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < s; i += 4) {
      ctx.fillStyle = i % 8 ? '#f4f4f4' : '#d5d5d5'
      ctx.fillRect(0, i, s, 2)
      ctx.fillStyle = i % 8 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.08)'
      ctx.fillRect(i, 0, 2, s)
    }
  },
  // sarja diagonal (jeans)
  denim(ctx, s) {
    ctx.fillStyle = '#cfcfcf'
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    for (let i = -s; i < s * 2; i += 5) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + s, s)
      ctx.stroke()
    }
    for (let n = 0; n < 900; n++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.12})`
      ctx.fillRect(Math.random() * s, Math.random() * s, 2, 1)
    }
  },
  // canelado / tricô
  knit(ctx, s) {
    ctx.fillStyle = '#dcdcdc'
    ctx.fillRect(0, 0, s, s)
    for (let x = 0; x < s; x += 6) {
      const g = ctx.createLinearGradient(x, 0, x + 6, 0)
      g.addColorStop(0, '#bdbdbd')
      g.addColorStop(0.5, '#ffffff')
      g.addColorStop(1, '#bdbdbd')
      ctx.fillStyle = g
      ctx.fillRect(x, 0, 6, s)
    }
  },
  // tela furadinha (camisa de time)
  mesh(ctx, s) {
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = '#9a9a9a'
    for (let y = 0; y < s; y += 6) {
      for (let x = (y / 6) % 2 ? 3 : 0; x < s; x += 6) {
        ctx.beginPath()
        ctx.arc(x + 1.5, y + 1.5, 1.3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
  // moletom / flanelado
  fleece(ctx, s) {
    ctx.fillStyle = '#e2e2e2'
    ctx.fillRect(0, 0, s, s)
    for (let n = 0; n < 2400; n++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.1})`
      ctx.fillRect(Math.random() * s, Math.random() * s, 1.5, 1.5)
    }
  },
  // lã fria de alfaiataria (espinha de peixe discreta)
  wool(ctx, s) {
    ctx.fillStyle = '#dedede'
    ctx.fillRect(0, 0, s, s)
    ctx.lineWidth = 1.5
    for (let band = 0; band < s; band += 8) {
      ctx.strokeStyle = band % 16 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.12)'
      for (let y = -8; y < s + 8; y += 3) {
        ctx.beginPath()
        ctx.moveTo(band, y)
        ctx.lineTo(band + 8, y + (band % 16 ? 4 : -4))
        ctx.stroke()
      }
    }
  },
  // couro (granulado)
  leather(ctx, s) {
    ctx.fillStyle = '#d9d9d9'
    ctx.fillRect(0, 0, s, s)
    for (let n = 0; n < 500; n++) {
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.12})`
      ctx.beginPath()
      ctx.arc(Math.random() * s, Math.random() * s, Math.random() * 3 + 1, 0, Math.PI * 2)
      ctx.stroke()
    }
  },
}

const REPEAT = { cotton: 26, denim: 22, knit: 14, mesh: 24, fleece: 10, wool: 18, leather: 6 }

export function getFabricTexture(kind = 'cotton') {
  if (textureCache.has(kind)) return textureCache.get(kind)
  const size = 64
  const [canvas, ctx] = makeCanvas(size)
  ;(patterns[kind] || patterns.cotton)(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(REPEAT[kind] ?? 20, REPEAT[kind] ?? 20)
  // Mantida linear de propósito: funciona como "detalhe" que multiplica a cor sem escurecê-la demais.
  tex.anisotropy = 4
  textureCache.set(kind, tex)
  return tex
}

const FABRIC_PRESETS = {
  cotton: { roughness: 0.92, sheen: 0.5, bump: 0.6 },
  denim: { roughness: 0.95, sheen: 0.25, bump: 1.2 },
  knit: { roughness: 0.9, sheen: 0.7, bump: 1.4 },
  mesh: { roughness: 0.55, sheen: 0.35, bump: 0.9 },
  fleece: { roughness: 1, sheen: 0.9, bump: 0.5 },
  wool: { roughness: 0.85, sheen: 0.45, bump: 0.7 },
  leather: { roughness: 0.38, sheen: 0, bump: 0.5, clearcoat: 0.4 },
}

const materialCache = new Map()

/** Material de tecido com sheen (brilho aveludado) + trama procedural. */
export function getFabricMaterial(color, fabric = 'cotton', lite = false) {
  const key = `${color}|${fabric}|${lite}`
  if (materialCache.has(key)) return materialCache.get(key)
  const preset = FABRIC_PRESETS[fabric] || FABRIC_PRESETS.cotton
  const tex = getFabricTexture(fabric)
  const base = new THREE.Color(color)
  const common = {
    color: base,
    map: tex,
    bumpMap: tex,
    bumpScale: preset.bump,
    roughness: preset.roughness,
    metalness: 0,
    side: THREE.DoubleSide,
  }
  const mat = lite
    ? new THREE.MeshStandardMaterial(common)
    : new THREE.MeshPhysicalMaterial({
        ...common,
        sheen: preset.sheen,
        sheenRoughness: 0.55,
        sheenColor: base.clone().lerp(new THREE.Color('#ffffff'), 0.35),
        clearcoat: preset.clearcoat ?? 0,
        clearcoatRoughness: 0.4,
      })
  materialCache.set(key, mat)
  return mat
}

export function getSolidMaterial(key, factory) {
  if (materialCache.has(key)) return materialCache.get(key)
  const mat = factory()
  materialCache.set(key, mat)
  return mat
}

export const goldMaterial = (lite) =>
  getSolidMaterial(`gold|${lite}`, () =>
    lite
      ? new THREE.MeshStandardMaterial({ color: '#f5c542', metalness: 1, roughness: 0.24 })
      : new THREE.MeshPhysicalMaterial({ color: '#f5c542', metalness: 1, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
  )

export const mannequinMaterial = (lite) =>
  getSolidMaterial(`mannequin|${lite}`, () =>
    lite
      ? new THREE.MeshStandardMaterial({ color: '#d8d3ca', roughness: 0.38, metalness: 0.05 })
      : new THREE.MeshPhysicalMaterial({
          color: '#d8d3ca',
          roughness: 0.34,
          metalness: 0.02,
          clearcoat: 0.8,
          clearcoatRoughness: 0.25,
        }),
  )

export const plasticMaterial = (color, roughness = 0.45) =>
  getSolidMaterial(`plastic|${color}|${roughness}`, () => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }))

/** Coroa vetorial (desenhada no canvas, não depende de fonte). */
function drawCrown(ctx, cx, cy, size, color) {
  const w = size
  const h = size * 0.72
  const x = cx - w / 2
  const y = cy - h / 2
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.28)
  ctx.lineTo(x + w * 0.25, y + h * 0.62)
  ctx.lineTo(x + w * 0.5, y)
  ctx.lineTo(x + w * 0.75, y + h * 0.62)
  ctx.lineTo(x + w, y + h * 0.28)
  ctx.lineTo(x + w * 0.9, y + h * 0.84)
  ctx.lineTo(x + w * 0.1, y + h * 0.84)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(x + w * 0.1, y + h * 0.9, w * 0.8, h * 0.1)
  for (const px of [0, 0.5, 1]) {
    ctx.beginPath()
    ctx.arc(x + w * px, y + (px === 0.5 ? 0 : h * 0.28), size * 0.06, 0, Math.PI * 2)
    ctx.fill()
  }
}

const DISPLAY_FONT = '"Unbounded Variable", "Arial Black", Impact, sans-serif'

/** Textura com arte (estampas, números de camisa). Fundo transparente. */
const printCache = new Map()
export function getPrintTexture({ title = '', subtitle = '', number = '', color = '#111', accent, crown = false }) {
  const key = JSON.stringify({ title, subtitle, number, color, accent, crown })
  if (printCache.has(key)) return printCache.get(key)
  const w = 512
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (crown && !title) {
    drawCrown(ctx, w / 2, h / 2, 260, color)
  } else if (number) {
    ctx.fillStyle = color
    ctx.font = `800 64px ${DISPLAY_FONT}`
    ctx.fillText(title, w / 2, 96)
    ctx.font = `800 260px ${DISPLAY_FONT}`
    ctx.lineWidth = 12
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.strokeText(number, w / 2, 300)
    ctx.fillText(number, w / 2, 300)
  } else {
    // arte estilo streetwear: coroa + arco + título + legenda
    const tone = accent || color
    drawCrown(ctx, w / 2, 110, 120, tone)
    ctx.strokeStyle = tone
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(w / 2, 330, 200, Math.PI * 1.12, Math.PI * 1.88)
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = `800 88px ${DISPLAY_FONT}`
    ctx.fillText(title, w / 2, 280)
    ctx.font = `600 28px ${DISPLAY_FONT}`
    ctx.fillStyle = tone
    ctx.fillText(subtitle, w / 2, 372)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  printCache.set(key, tex)
  return tex
}

/** Bolsos traseiros de jeans com pesponto dourado. */
let pocketTex
export function getPocketTexture() {
  if (pocketTex) return pocketTex
  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const pocket = (cx) => {
    ctx.beginPath()
    ctx.moveTo(cx - 70, 30)
    ctx.lineTo(cx + 70, 30)
    ctx.lineTo(cx + 62, 190)
    ctx.lineTo(cx, 226)
    ctx.lineTo(cx - 62, 190)
    ctx.closePath()
  }
  for (const cx of [140, 372]) {
    pocket(cx)
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.fill()
    ctx.setLineDash([10, 7])
    ctx.lineWidth = 4
    ctx.strokeStyle = '#e7b53c'
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - 50, 110)
    ctx.quadraticCurveTo(cx, 150, cx + 50, 110)
    ctx.stroke()
  }
  pocketTex = new THREE.CanvasTexture(canvas)
  pocketTex.colorSpace = THREE.SRGBColorSpace
  pocketTex.anisotropy = 8
  return pocketTex
}

const decalCache = new Map()
export function getDecalMaterial(texture) {
  if (decalCache.has(texture)) return decalCache.get(texture)
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.75,
    metalness: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    side: THREE.FrontSide,
  })
  decalCache.set(texture, mat)
  return mat
}

/** Sombra de contato fake (gradiente radial) — muito mais leve que shadow maps. */
let blobTex
export function getBlobShadowTexture() {
  if (blobTex) return blobTex
  const s = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = s
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.75)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  blobTex = new THREE.CanvasTexture(canvas)
  return blobTex
}
