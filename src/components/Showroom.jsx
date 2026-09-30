import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { looks } from '../config/looks'
import { whatsappLink } from '../config/site'
import { useInView } from '../hooks/useInView'
import { usePointer } from '../hooks/usePointer'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { SectionHeading } from './SectionHeading'
import { GlowButton } from './GlowButton'
import { Reveal } from './Reveal'
import {
  CheckIcon,
  ChessKingMark,
  ChevronLeftIcon,
  ChevronRightIcon,
  HandIcon,
  PauseIcon,
  PlayIcon,
  WhatsAppIcon,
} from './Icons'

const ShowroomScene = lazy(() => import('../three/ShowroomScene'))

const ZOOMS = [
  { id: 'full', label: 'Look inteiro' },
  { id: 'upper', label: 'Parte de cima' },
  { id: 'lower', label: 'Parte de baixo' },
]

const DISPLAY_FONT = '800 64px "Unbounded Variable"'

export function Showroom({ profile }) {
  const section = useRef(null)
  const stage = useRef(null)
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState('full')
  const [autoRotate, setAutoRotate] = useState(true)
  const [interacted, setInteracted] = useState(false)
  const [optIn, setOptIn] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const drag = useRef({ dragging: false, rot: 0, vel: 0, lastX: 0, lastT: 0 })
  const hotspotEls = useRef([])

  const near = useInView(section, { rootMargin: '400px 0px', once: true })
  const visible = useInView(stage, { rootMargin: '80px' })
  const progress = useScrollProgress(section)
  const pointer = usePointer(!!profile?.finePointer && !profile?.reducedMotion)
  const look = looks[active]

  // As estampas usam a fonte da marca: espera ela carregar antes de montar o 3D
  useEffect(() => {
    if (!near) return
    let done = false
    const finish = () => !done && (done = true, setFontsReady(true))
    const timer = setTimeout(finish, 1500)
    document.fonts?.load(DISPLAY_FONT).then(finish, finish)
    return () => clearTimeout(timer)
  }, [near])

  const select = useCallback((index) => {
    const n = looks.length
    setActive(((index % n) + n) % n)
    drag.current.rot = 0
    drag.current.vel = 0
  }, [])

  // Arraste horizontal para girar (o vertical continua rolando a página no celular)
  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    const d = drag.current
    d.dragging = true
    d.lastX = e.clientX
    d.lastT = performance.now()
    d.vel = 0
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setInteracted(true)
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.dragging) return
    const now = performance.now()
    const dx = e.clientX - d.lastX
    const dt = Math.max(1, now - d.lastT) / 1000
    const delta = dx * 0.011
    d.rot += delta
    d.vel = delta / dt
    d.lastX = e.clientX
    d.lastT = now
  }
  const endDrag = () => {
    const d = drag.current
    d.dragging = false
    d.vel = Math.max(-8, Math.min(8, d.vel))
  }

  const onKeyDown = (e) => {
    const d = drag.current
    if (e.key === 'ArrowLeft') d.vel = -3
    else if (e.key === 'ArrowRight') d.vel = 3
    else if (e.key === '+' || e.key === '=') setZoom('upper')
    else if (e.key === '-') setZoom('full')
    else return
    e.preventDefault()
    setInteracted(true)
  }

  const quality = profile?.quality
  const canRender3D = !!profile && profile.webgl && (quality !== 'poster' || optIn)
  const mount3D = canRender3D && near && fontsReady

  return (
    <section id="looks" ref={section} aria-labelledby="looks-title" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_at_30%_40%,rgba(245,197,66,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="looks-title"
          eyebrow="Provador 3D · 360°"
          title={
            <>
              Gire o look. <span className="text-gold-gradient">Repare em cada detalhe.</span>
            </>
          }
          text="Arraste para girar os manequins, aproxime a câmera e escolha o look que combina com você. Gostou? Peça pelo WhatsApp e a gente separa o seu tamanho."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
          {/* Palco 3D */}
          <Reveal>
            <div
              ref={stage}
              role="group"
              aria-roledescription="provador 3D"
              aria-label={`Manequim com o look ${look.name}. Use as setas do teclado para girar e + ou - para aproximar.`}
              tabIndex={0}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onLostPointerCapture={endDrag}
              className="hud-corners relative h-[62svh] max-h-[760px] min-h-[440px] cursor-grab touch-pan-y overflow-hidden rounded-3xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_50%_35%,#1b1710_0%,#0b0b0d_55%,#070708_100%)] select-none active:cursor-grabbing lg:h-[72svh]"
            >
              {mount3D ? (
                <Suspense fallback={<StageLoading />}>
                  <ShowroomScene
                    looks={looks}
                    active={active}
                    zoom={zoom}
                    autoRotate={autoRotate}
                    drag={drag}
                    progress={progress}
                    pointer={pointer}
                    quality={quality === 'poster' ? 'lite' : quality}
                    reducedMotion={!!profile?.reducedMotion}
                    hotspotEls={hotspotEls}
                    visible={visible}
                  />
                </Suspense>
              ) : (
                <StageFallback profile={profile} onOptIn={() => setOptIn(true)} loading={canRender3D} />
              )}

              {/* Etiquetas de detalhe (posicionadas a cada quadro pela cena 3D) */}
              {mount3D && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                  {look.hotspots?.map((h, k) => (
                    <div
                      key={`${look.id}-${h.anchor}`}
                      ref={(el) => (hotspotEls.current[k] = el)}
                      data-visible="false"
                      className="hotspot-anchor"
                    >
                      <div className="hotspot" style={{ '--i': k }}>
                        <span className="hotspot-dot" />
                        <span className="hotspot-label">{h.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HUD superior */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
                <p className="hud-label rounded-full border border-white/10 bg-ink/60 px-3 py-1.5 backdrop-blur" aria-live="polite">
                  Look {String(active + 1).padStart(2, '0')}/{String(looks.length).padStart(2, '0')} · {look.name}
                </p>
                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-pressed={autoRotate}
                  className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-ink/60 px-3.5 text-xs font-semibold text-bone backdrop-blur transition hover:border-gold/60"
                >
                  {autoRotate ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{autoRotate ? 'Pausar giro' : 'Girar sozinho'}</span>
                  <span className="sr-only sm:hidden">{autoRotate ? 'Pausar giro automático' : 'Ativar giro automático'}</span>
                </button>
              </div>

              {/* Dica de interação */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-16 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap sm:top-20 rounded-full border border-gold/40 bg-ink/70 px-4 py-2 text-xs font-semibold text-gold-soft backdrop-blur transition-opacity duration-700 ${
                  interacted || !mount3D ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <HandIcon className="h-4 w-4" /> Arraste para girar
              </div>

              {/* Controles inferiores */}
              <div
                className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div role="radiogroup" aria-label="Enquadramento da câmera" className="flex rounded-full border border-white/10 bg-ink/70 p-1 backdrop-blur">
                  {ZOOMS.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      role="radio"
                      aria-checked={zoom === z.id}
                      onClick={() => {
                        setZoom(z.id)
                        setInteracted(true)
                      }}
                      className={`rounded-full px-3 py-2 text-[0.7rem] font-bold transition sm:px-4 sm:text-xs ${
                        zoom === z.id ? 'bg-gold text-ink' : 'text-mist hover:text-bone'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => select(active - 1)}
                    aria-label="Look anterior"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink/70 text-bone backdrop-blur transition hover:border-gold hover:text-gold"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => select(active + 1)}
                    aria-label="Próximo look"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink/70 text-bone backdrop-blur transition hover:border-gold hover:text-gold"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Painel do look */}
          <Reveal delay={120} className="flex flex-col rounded-3xl border border-white/[0.08] bg-graphite/60 p-6 backdrop-blur sm:p-8">
            <div role="tablist" aria-label="Escolha o look" className="grid grid-cols-2 gap-2">
              {looks.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  id={`tab-${l.id}`}
                  aria-selected={i === active}
                  aria-controls="look-panel"
                  onClick={() => select(i)}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${
                    i === active
                      ? 'border-gold/70 bg-gold/10 shadow-[0_0_24px_-6px_rgba(245,197,66,0.5)]'
                      : 'border-white/[0.08] hover:border-white/25'
                  }`}
                >
                  <span className="hud-label block !text-[0.6rem]">{l.tag}</span>
                  <span className="mt-1 block font-display text-sm font-semibold text-bone">{l.name}</span>
                </button>
              ))}
            </div>

            <div id="look-panel" role="tabpanel" aria-labelledby={`tab-${look.id}`} className="mt-8 flex flex-1 flex-col">
              <p className="hud-label">
                {look.tag} · {look.vibe}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold text-bone sm:text-3xl">{look.name}</h3>
              <p className="mt-4 leading-relaxed text-mist">{look.description}</p>

              <h4 className="mt-7 text-xs font-bold tracking-[0.2em] text-bone/80 uppercase">Peças do look</h4>
              <ul className="mt-4 space-y-3">
                {look.pieces.map((piece) => (
                  <li key={piece} className="flex items-center gap-3 text-sm text-bone/90">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    {piece}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <GlowButton
                  href={whatsappLink(`Olá, Real Império! 👑 Vi o look "${look.name}" no site e quero saber tamanhos e valores.`)}
                  icon={<WhatsAppIcon className="h-5 w-5" />}
                  className="w-full"
                >
                  Quero esse look
                </GlowButton>
                <p className="mt-3 text-center text-xs text-mist">Tamanhos, valores e disponibilidade na hora, pelo WhatsApp.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function StageLoading() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" role="status">
      <ChessKingMark className="h-16 w-16 animate-pulse" />
      <span className="hud-label">Montando o provador…</span>
    </div>
  )
}

function StageFallback({ profile, onOptIn, loading }) {
  if (!profile || loading) return <StageLoading />
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
      <ChessKingMark className="h-16 w-16" />
      {profile.webgl ? (
        <>
          <p className="max-w-xs text-sm text-mist">O modo economia de dados está ativo. O provador 3D usa um pouco mais de internet.</p>
          <button
            type="button"
            onClick={onOptIn}
            className="rounded-full border border-gold/60 bg-gold/10 px-5 py-2.5 text-sm font-bold text-gold-soft transition hover:bg-gold hover:text-ink"
          >
            Carregar provador 3D
          </button>
        </>
      ) : (
        <p className="max-w-xs text-sm text-mist">Seu navegador não suporta 3D. Veja os detalhes do look ao lado e fale com a gente no WhatsApp.</p>
      )}
    </div>
  )
}
