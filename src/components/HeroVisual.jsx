import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChessKingMark } from './Icons'

// A cena 3D (three.js) fica em um chunk separado: o texto do topo aparece
// imediatamente e o 3D carrega em seguida, sem bloquear a página.
const HeroScene = lazy(() => import('../three/HeroScene'))

/**
 * Slot do elemento visual do topo. Aceita:
 *  - 'three'  → cena 3D nativa (padrão)
 *  - 'spline' → embed de uma cena do Spline (https://spline.design)
 *  - 'video'  → vídeo de rotação 3D; com `scrub` os quadros acompanham a rolagem
 * Em aparelhos sem WebGL / modo economia de dados, mostra o pôster estático.
 */
export function HeroVisual({ config = { type: 'three' }, profile, progress, pointer, active }) {
  if (!profile) return <HeroPoster />

  if (config.type === 'video' && config.src) {
    return <ScrollVideo {...config} progress={progress} reducedMotion={profile.reducedMotion} />
  }
  if (profile.quality === 'poster') return <HeroPoster />
  if (config.type === 'spline' && config.url) {
    return <SplineEmbed url={config.url} interactive={profile.finePointer} />
  }

  return (
    <Suspense fallback={<HeroPoster />}>
      <HeroScene
        progress={progress}
        pointer={pointer}
        quality={profile.quality}
        reducedMotion={profile.reducedMotion}
        active={active}
      />
    </Suspense>
  )
}

/** Pôster leve (SVG + CSS): usado no carregamento, no SSR e como fallback. */
export function HeroPoster() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-[6svh] lg:items-center lg:justify-end lg:pr-[12%] lg:pb-0" aria-hidden="true">
      <div className="relative flex h-[40svh] w-[40svh] max-w-[80vw] items-center justify-center lg:h-[56svh] lg:w-[56svh]">
        <div className="absolute inset-0 rounded-full border border-gold/25" />
        <div className="absolute inset-[9%] rounded-full border border-gold/15" />
        <div className="absolute inset-[22%] rounded-full bg-gold/15 blur-3xl" />
        <ChessKingMark className="relative h-3/5 w-3/5 drop-shadow-[0_0_40px_rgba(245,197,66,0.45)]" />
      </div>
    </div>
  )
}

function SplineEmbed({ url, interactive }) {
  return (
    <iframe
      src={url}
      title="Cena 3D interativa da Real Império"
      loading="lazy"
      className="absolute inset-0 h-full w-full border-0"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      allow="autoplay; fullscreen"
    />
  )
}

/** Vídeo 3D. Com `scrub`, o tempo do vídeo segue a rolagem (efeito de "transição de quadros"). */
function ScrollVideo({ src, poster, scrub = true, progress, reducedMotion }) {
  const video = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = video.current
    if (!el || !scrub || !ready) return
    let frame
    let current = 0
    const tick = () => {
      const target = (reducedMotion ? 0 : progress.current) * (el.duration || 0)
      current += (target - current) * 0.18
      if (Math.abs(el.currentTime - current) > 0.02) el.currentTime = current
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [scrub, ready, progress, reducedMotion])

  return (
    <video
      ref={video}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      autoPlay={!scrub && !reducedMotion}
      loop={!scrub}
      onLoadedMetadata={() => setReady(true)}
      aria-hidden="true"
    />
  )
}
