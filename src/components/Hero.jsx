import { useRef } from 'react'
import { site, whatsappLink } from '../config/site'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { useInView } from '../hooks/useInView'
import { usePointer } from '../hooks/usePointer'
import { HeroVisual } from './HeroVisual'
import { GlowButton } from './GlowButton'
import { ClockIcon, MapPinIcon, TruckIcon, WhatsAppIcon } from './Icons'

export function Hero({ profile }) {
  const section = useRef(null)
  const inView = useInView(section, { rootMargin: '100px' })
  const pointer = usePointer(!!profile?.finePointer && !profile?.reducedMotion)
  // O progresso de rolagem alimenta o 3D (via ref) e o parallax das camadas (via CSS var)
  const progress = useScrollProgress(section, {
    mode: 'exit',
    onChange: (p) => section.current?.style.setProperty('--hero-p', p.toFixed(4)),
  })
  const { hero, hours } = site

  return (
    <section
      id="inicio"
      ref={section}
      aria-labelledby="hero-title"
      className="hero-screen noise relative isolate flex items-center overflow-hidden"
    >
      {/* Camadas de fundo */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-30 [mask-image:radial-gradient(ellipse_at_70%_45%,black_20%,transparent_75%)]" />
      <div aria-hidden="true" className="absolute top-1/4 right-[-10%] -z-30 h-[60vmax] w-[60vmax] rounded-full bg-gold/[0.07] blur-[120px]" />

      <div className="hero-visual absolute inset-0 -z-20">
        <HeroVisual config={hero.visual} profile={profile} progress={progress} pointer={pointer} active={inView} />
      </div>

      {/* Véu para garantir leitura do texto sobre o 3D */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-ink/95 via-ink/55 to-ink/10 lg:bg-linear-to-r lg:from-ink lg:via-ink/70 lg:to-transparent"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-ink to-transparent" />

      <div className="hero-copy mx-auto w-full max-w-7xl px-4 pt-28 pb-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/[0.06] px-4 py-1.5 text-xs font-semibold tracking-wide text-gold-soft backdrop-blur">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-gold" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            {hero.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="mt-6 font-display text-[clamp(2.35rem,7.4vw,5.6rem)] leading-[0.98] font-extrabold tracking-[-0.02em] text-bone uppercase"
          >
            {hero.titleTop} <span className="text-gold-gradient block">{hero.titleHighlight}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-mist sm:text-lg">{hero.subtitle}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GlowButton href={whatsappLink()} icon={<WhatsAppIcon className="h-5 w-5" />}>
              {hero.primaryCta}
            </GlowButton>
            <GlowButton href="#looks" variant="ghost">
              {hero.secondaryCta}
            </GlowButton>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-mist" aria-label="Informações rápidas">
            <li className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gold" /> Araruama · Iguaba Grande
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gold" /> {hours}
            </li>
            <li className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-gold" /> Envio para você
            </li>
          </ul>
        </div>
      </div>

      {/* HUD */}
      <div aria-hidden="true" className="hud-label pointer-events-none absolute bottom-8 left-8 hidden flex-col gap-1 opacity-70 lg:flex">
        <span>RI · 001 — Coleção atual</span>
        <span className="text-mist">22.87°S · 42.34°W · Araruama RJ</span>
      </div>
      <a
        href="#looks"
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] font-semibold tracking-[0.3em] text-mist uppercase md:flex"
      >
        Role para explorar
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-gold" />
        </span>
      </a>
    </section>
  )
}
