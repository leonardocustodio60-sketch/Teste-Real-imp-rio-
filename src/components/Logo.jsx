import { site } from '../config/site'
import { ChessKingMark } from './Icons'

/** Logo da marca. Se `site.brand.logoSrc` estiver preenchido, usa a imagem oficial. */
export function Logo({ className = '', compact = false }) {
  if (site.brand.logoSrc) {
    return (
      <img
        src={site.brand.logoSrc}
        alt={`${site.brand.name} ${site.brand.suffix}`}
        className={`h-10 w-auto ${className}`}
        width="160"
        height="40"
      />
    )
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ChessKingMark className="h-9 w-9 shrink-0 drop-shadow-[0_0_12px_rgba(245,197,66,0.35)]" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.95rem] font-bold tracking-[0.04em] text-bone uppercase">{site.brand.name}</span>
        {!compact && (
          <span className="mt-1 font-display text-[0.52rem] font-medium tracking-[0.42em] text-gold uppercase">
            {site.brand.suffix}
          </span>
        )}
      </span>
    </span>
  )
}
