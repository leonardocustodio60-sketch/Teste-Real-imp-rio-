import { site } from '../config/site'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { ArrowRightIcon, InstagramIcon } from './Icons'

function Stars() {
  return (
    <div className="flex gap-1" role="img" aria-label="Avaliação: 5 de 5 estrelas">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="star" aria-hidden="true">
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8L10 1.8z" />
        </svg>
      ))}
    </div>
  )
}

export function Testimonials() {
  const { testimonials, testimonialsAreExamples, contact } = site
  return (
    <section id="depoimentos" aria-labelledby="depoimentos-title" className="relative py-24 sm:py-32">
      <div aria-hidden="true" className="absolute top-1/3 left-1/2 -z-10 h-[40vmax] w-[40vmax] -translate-x-1/2 rounded-full bg-gold/[0.05] blur-[120px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="depoimentos-title"
          eyebrow="Prova social"
          align="center"
          title={
            <>
              Quem veste, <span className="text-gold-gradient">volta.</span>
            </>
          }
          text="Clientes de Araruama, Iguaba Grande e de toda a Região dos Lagos contam como foi comprar com a Real Império."
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 110}>
              <figure className="glow-border flex h-full flex-col rounded-3xl bg-graphite/70 p-7 sm:p-8">
                <Stars />
                <blockquote className="mt-5 flex-1 text-base leading-relaxed text-bone/90">
                  <p>“{t.text}”</p>
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-white/[0.07] pt-5">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-gold-soft to-gold-deep font-display text-sm font-bold text-ink"
                  >
                    {t.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <span>
                    <span className="block font-bold text-bone">{t.name}</span>
                    <span className="block text-xs text-mist">
                      {t.city} · {t.look}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 flex flex-col items-center gap-3 text-center">
          <a
            href={contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-bone transition hover:border-gold hover:text-gold-soft"
          >
            <InstagramIcon className="h-5 w-5" />
            Ver os feedbacks no Instagram {contact.instagramHandle}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          {testimonialsAreExamples && (
            <p className="text-xs text-mist/70">* Depoimentos ilustrativos. Os feedbacks reais dos clientes estão no destaque “Feedbacks” do nosso Instagram.</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
