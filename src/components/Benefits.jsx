import { useRef } from 'react'
import { site } from '../config/site'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { BoltIcon, CrownIcon, FabricIcon } from './Icons'

const ICONS = { crown: CrownIcon, fabric: FabricIcon, bolt: BoltIcon }

/** Card com inclinação 3D e brilho que segue o cursor (desktop). */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const frame = useRef(0)

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--mx', `${x * 100}%`)
      el.style.setProperty('--my', `${y * 100}%`)
      el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
      el.style.setProperty('--ry', `${(x - 0.5) * 12}deg`)
    })
  }
  const onLeave = () => {
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="h-full [perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`glow-border h-full rounded-3xl bg-graphite/70 transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] motion-reduce:[transform:none] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export function Benefits() {
  return (
    <section id="diferenciais" aria-labelledby="diferenciais-title" className="relative overflow-hidden py-24 sm:py-32">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="diferenciais-title"
          eyebrow="Por que a Real Império"
          title={
            <>
              Três motivos para o seu guarda-roupa <span className="text-gold-gradient">subir de patamar.</span>
            </>
          }
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {site.benefits.map((b, i) => {
            const Icon = ICONS[b.icon] || CrownIcon
            return (
              <Reveal as="li" key={b.title} delay={i * 110}>
                <TiltCard>
                  <article className="flex h-full flex-col p-7 [transform:translateZ(30px)] sm:p-8">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold shadow-[0_0_30px_-8px_rgba(245,197,66,0.7)]">
                      <Icon className="h-7 w-7" />
                    </span>
                    <p className="hud-label mt-7">{b.kicker}</p>
                    <h3 className="mt-3 font-display text-xl leading-snug font-bold text-bone">{b.title}</h3>
                    <p className="mt-4 leading-relaxed text-mist">{b.text}</p>
                  </article>
                </TiltCard>
              </Reveal>
            )
          })}
        </ul>

        <Reveal className="mt-14 grid overflow-hidden rounded-3xl border border-white/[0.08] sm:grid-cols-3">
          {site.stats.map((s) => (
            <div key={s.label} className="border-b border-white/[0.08] px-7 py-8 last:border-0 sm:border-r sm:border-b-0">
              <p className="font-display text-4xl font-extrabold text-gold-gradient">{s.value}</p>
              <p className="mt-2 text-sm text-mist">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
