import { site } from '../config/site'
import { SectionHeading } from './SectionHeading'
import { Reveal } from './Reveal'
import { PlusIcon } from './Icons'

/** Perguntas frequentes com <details> nativo (funciona sem JavaScript). */
export function FAQ() {
  return (
    <section id="duvidas" aria-labelledby="duvidas-title" className="relative py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:px-8">
        <SectionHeading
          id="duvidas-title"
          eyebrow="Dúvidas frequentes"
          title="Tudo o que você precisa saber antes de vestir o Império."
          text="Não achou sua resposta? Chame no WhatsApp — a gente responde rapidinho."
        />
        <Reveal as="div" delay={100} className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {site.faq.map((item) => (
            <details key={item.q} className="group py-2 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-left">
                <h3 className="font-display text-base font-semibold text-bone sm:text-lg">{item.q}</h3>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-gold transition-transform duration-300 group-open:rotate-45 group-open:border-gold">
                  <PlusIcon className="h-4 w-4" />
                </span>
              </summary>
              <p className="pr-12 pb-5 leading-relaxed text-mist">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
