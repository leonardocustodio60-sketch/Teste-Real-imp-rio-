/**
 * Botão de CTA com brilho dourado no hover (e reflexo animado).
 * Renderiza <a> quando recebe `href`, senão <button>.
 */
export function GlowButton({ href, children, variant = 'primary', className = '', icon, ...props }) {
  const Tag = href ? 'a' : 'button'
  const external = href?.startsWith('http')
  const styles =
    variant === 'primary'
      ? 'bg-linear-to-r from-gold-soft via-gold to-gold-deep text-ink shadow-[0_0_0_1px_rgba(245,197,66,0.5),0_10px_40px_-10px_rgba(245,197,66,0.6)] hover:shadow-[0_0_0_1px_rgba(255,224,138,0.9),0_0_30px_4px_rgba(245,197,66,0.55),0_18px_60px_-12px_rgba(245,197,66,0.8)]'
      : 'border border-white/15 bg-white/[0.04] text-bone backdrop-blur-md hover:border-gold/70 hover:text-gold-soft hover:shadow-[0_0_28px_-4px_rgba(245,197,66,0.45)]'

  return (
    <Tag
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-sm font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60 ${styles} ${className}`}
      {...props}
    >
      {variant === 'primary' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-shine"
        />
      )}
      {icon && <span className="relative">{icon}</span>}
      <span className="relative">{children}</span>
    </Tag>
  )
}
