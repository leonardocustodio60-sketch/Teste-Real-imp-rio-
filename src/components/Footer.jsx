import { site, whatsappLink } from '../config/site'
import { Logo } from './Logo'
import { FacebookIcon, InstagramIcon, LinkIcon, WhatsAppIcon } from './Icons'

export function Footer() {
  const { contact, brand, nav, stores, hours, legal } = site
  const socials = [
    { label: 'Instagram', href: contact.instagram, Icon: InstagramIcon },
    { label: 'Facebook', href: contact.facebook, Icon: FacebookIcon },
    { label: 'WhatsApp', href: whatsappLink(), Icon: WhatsAppIcon },
    { label: 'Todos os links', href: contact.beacons, Icon: LinkIcon },
  ]
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/[0.07] bg-coal">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <a href="#inicio" aria-label={`${brand.name} ${brand.suffix} — voltar ao topo`} className="inline-block rounded-lg">
            <Logo />
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist">
            {brand.tagline}. Moda multimarcas importada e nacional em {stores.map((s) => s.city).join(' e ')} – RJ.
          </p>
          <ul className="mt-6 flex gap-3" aria-label="Redes sociais">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-bone transition hover:border-gold hover:text-gold hover:shadow-[0_0_20px_-4px_rgba(245,197,66,0.6)]"
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Rodapé">
          <p className="hud-label">Navegue</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-mist transition hover:text-gold-soft">
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#duvidas" className="text-mist transition hover:text-gold-soft">
                Dúvidas frequentes
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="hud-label">Contato</p>
          <address className="mt-4 space-y-2.5 text-sm text-mist not-italic">
            <p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="transition hover:text-gold-soft">
                WhatsApp {contact.whatsappDisplay}
              </a>
            </p>
            <p>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="transition hover:text-gold-soft">
                {contact.instagramHandle}
              </a>
            </p>
            <p>
              {stores[0].address}, {stores[0].city} – {stores[0].state}
            </p>
            <p>{hours}</p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-mist/80 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {brand.name} {brand.suffix}. Todos os direitos reservados.
          </p>
          <a href={legal.privacyPath} className="transition hover:text-gold-soft">
            Política de Privacidade
          </a>
        </div>
      </div>
    </footer>
  )
}
