import { useEffect, useState } from 'react'
import { whatsappLink } from '../config/site'
import { WhatsAppIcon } from './Icons'

/** Botão flutuante de WhatsApp: aparece depois que o visitante passa do topo. */
export function WhatsAppFloat() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comprar pelo WhatsApp"
      tabIndex={show ? 0 : -1}
      className={`fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-ink shadow-[0_10px_40px_-8px_rgba(245,197,66,0.8)] transition-all duration-500 hover:scale-105 sm:right-6 sm:bottom-6 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <span aria-hidden="true" className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-gold" />
      <WhatsAppIcon className="relative h-7 w-7" />
    </a>
  )
}
