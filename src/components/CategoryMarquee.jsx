import { site } from '../config/site'

/** Faixa infinita com as categorias da loja. */
export function CategoryMarquee() {
  const items = [...site.categories, ...site.categories]
  return (
    <section aria-label="Categorias disponíveis" className="relative overflow-hidden border-y border-white/[0.07] bg-coal/80 py-5">
      <ul className="sr-only">
        {site.categories.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
        {items.map((c, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-lg font-semibold tracking-wide whitespace-nowrap text-bone/85 uppercase sm:text-xl">
            {c}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-ink to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-ink to-transparent" />
    </section>
  )
}
