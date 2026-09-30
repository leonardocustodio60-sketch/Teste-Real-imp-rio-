import { Reveal } from './Reveal'

/** Cabeçalho de seção: rótulo HUD + H2 + texto de apoio. */
export function SectionHeading({ id, eyebrow, title, text, align = 'left', className = '' }) {
  const centered = align === 'center'
  return (
    <Reveal className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      <p className={`hud-label flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
        <span aria-hidden="true" className="h-px w-8 bg-gold/70" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 font-display text-3xl leading-[1.08] font-bold tracking-tight text-balance text-bone sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-5 text-base leading-relaxed text-pretty text-mist sm:text-lg">{text}</p>}
    </Reveal>
  )
}
