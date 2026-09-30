import { useEffect, useState } from 'react'
import { site, whatsappLink } from '../config/site'
import { Logo } from './Logo'
import { CloseIcon, MenuIcon, WhatsAppIcon } from './Icons'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? 'border-b border-white/[0.07] bg-ink/75 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
      >
        Pular para o conteúdo
      </a>
      <nav aria-label="Principal" className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" aria-label={`${site.brand.name} ${site.brand.suffix} — início`} className="rounded-lg">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-mist transition-colors hover:bg-white/5 hover:text-bone"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-bold text-gold-soft transition hover:bg-gold hover:text-ink hover:shadow-[0_0_24px_rgba(245,197,66,0.5)] sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Comprar agora
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-bone md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <div id="menu-mobile" hidden={!open} className="border-t border-white/[0.07] px-4 pt-2 pb-6 md:hidden">
        <ul className="flex flex-col">
          {site.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-white/[0.06] py-4 font-display text-lg font-semibold text-bone"
              >
                {item.label}
                <span className="hud-label">→</span>
              </a>
            </li>
          ))}
        </ul>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3.5 font-bold text-ink"
        >
          <WhatsAppIcon className="h-5 w-5" /> Comprar pelo WhatsApp
        </a>
      </div>
    </header>
  )
}
