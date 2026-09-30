import { useId, useState } from 'react'
import { site, whatsappLink } from '../config/site'
import { Reveal } from './Reveal'
import { GlowButton } from './GlowButton'
import { ArrowRightIcon, CheckIcon, ClockIcon, MapPinIcon, TruckIcon, WhatsAppIcon } from './Icons'

// Endpoint de envio (Formspree, Getform, webhook do Make/Zapier, API própria...).
// Configure em .env: VITE_LEAD_ENDPOINT=https://...
const ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function LeadForm() {
  const id = useId()
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errors, setErrors] = useState({})

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (data.empresa) return // honeypot anti-spam: humanos não preenchem

    const nome = String(data.nome || '').trim()
    const email = String(data.email || '').trim()
    const next = {}
    if (nome.length < 2) next.nome = 'Conte pra gente o seu nome.'
    if (!EMAIL_RE.test(email)) next.email = 'Digite um e-mail válido.'
    setErrors(next)
    if (Object.keys(next).length) {
      form.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus()
      return
    }

    setStatus('loading')
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ nome, email, origem: 'landing-page-lista-vip' }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } else {
        // Modo demonstração: sem endpoint configurado, apenas simula o envio.
        await new Promise((r) => setTimeout(r, 700))
        console.info('[Lista VIP] Configure VITE_LEAD_ENDPOINT para receber os cadastros.', { nome, email })
      }
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-6">
        <p className="flex items-center gap-3 font-display text-lg font-bold text-gold-soft">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink">
            <CheckIcon className="h-5 w-5" />
          </span>
          {site.lead.success}
        </p>
        <a
          href={whatsappLink('Olá, Real Império! 👑 Acabei de entrar na Lista VIP pelo site.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-bone underline decoration-gold/60 underline-offset-4 hover:text-gold-soft"
        >
          Quer ver as novidades agora? Chame no WhatsApp <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    )
  }

  const field =
    'peer w-full rounded-2xl border bg-ink/70 px-5 pt-6 pb-2.5 text-base text-bone placeholder-transparent transition outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(245,197,66,0.15)]'
  const label =
    'pointer-events-none absolute top-2 left-5 text-[0.7rem] font-bold tracking-wide text-gold-soft uppercase transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-mist peer-placeholder-shown:normal-case peer-focus:top-2 peer-focus:text-[0.7rem] peer-focus:font-bold peer-focus:tracking-wide peer-focus:text-gold-soft peer-focus:uppercase'

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4" aria-describedby={`${id}-consent`}>
      <div className="relative">
        <input
          id={`${id}-nome`}
          name="nome"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          required
          aria-invalid={!!errors.nome}
          aria-describedby={errors.nome ? `${id}-nome-err` : undefined}
          className={`${field} ${errors.nome ? 'border-red-400/70' : 'border-white/10'}`}
        />
        <label htmlFor={`${id}-nome`} className={label}>
          Seu nome
        </label>
        {errors.nome && (
          <p id={`${id}-nome-err`} className="mt-2 pl-2 text-xs font-semibold text-red-300">
            {errors.nome}
          </p>
        )}
      </div>

      <div className="relative">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Seu melhor e-mail"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${id}-email-err` : undefined}
          className={`${field} ${errors.email ? 'border-red-400/70' : 'border-white/10'}`}
        />
        <label htmlFor={`${id}-email`} className={label}>
          Seu melhor e-mail
        </label>
        {errors.email && (
          <p id={`${id}-email-err`} className="mt-2 pl-2 text-xs font-semibold text-red-300">
            {errors.email}
          </p>
        )}
      </div>

      {/* Honeypot (invisível para pessoas) */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Empresa
          <input name="empresa" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <GlowButton type="submit" className="w-full" disabled={status === 'loading'} aria-busy={status === 'loading'}>
        {status === 'loading' ? 'Enviando…' : site.lead.button}
      </GlowButton>

      {status === 'error' && (
        <p role="alert" className="text-sm font-semibold text-red-300">
          Não conseguimos enviar agora. Tente de novo ou chame a gente no WhatsApp.
        </p>
      )}

      <p id={`${id}-consent`} className="text-xs leading-relaxed text-mist">
        {site.lead.consent}{' '}
        <a href={site.legal.privacyPath} className="font-semibold text-bone underline decoration-gold/50 underline-offset-2 hover:text-gold-soft">
          Política de Privacidade
        </a>
        .
      </p>
    </form>
  )
}

export function LeadSection() {
  const { lead, stores, hours, contact } = site
  return (
    <section id="lista-vip" aria-labelledby="lista-vip-title" className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <Reveal className="hud-corners noise relative overflow-hidden rounded-3xl border border-gold/25 bg-[radial-gradient(ellipse_at_top_left,rgba(245,197,66,0.16),transparent_55%),linear-gradient(180deg,#121214,#0b0b0d)] p-7 sm:p-10">
          <p className="hud-label">{lead.eyebrow}</p>
          <h2 id="lista-vip-title" className="mt-4 font-display text-3xl leading-tight font-bold text-balance text-bone sm:text-4xl">
            {lead.title}
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-mist">{lead.text}</p>
          <LeadForm />
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/[0.08] bg-graphite/60 p-7 sm:p-8">
            <h3 className="font-display text-xl font-bold text-bone">Visite o Império</h3>
            <ul className="mt-6 space-y-5">
              {stores.map((store) => (
                <li key={store.city} className="flex gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold">
                    <MapPinIcon className="h-5 w-5" />
                  </span>
                  <address className="not-italic">
                    <span className="block font-bold text-bone">
                      {store.city} – {store.state}
                    </span>
                    <span className="block text-sm text-mist">{store.address}</span>
                    <span className="block text-sm text-mist">{store.complement}</span>
                    {store.mapsUrl && (
                      <a
                        href={store.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-sm font-bold text-gold-soft underline-offset-4 hover:underline"
                      >
                        Ver rotas no Google <ArrowRightIcon className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </address>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/[0.08] bg-graphite/60 p-6">
              <ClockIcon className="h-6 w-6 text-gold" />
              <p className="mt-3 font-bold text-bone">Horário</p>
              <p className="text-sm text-mist">{hours}</p>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-graphite/60 p-6">
              <TruckIcon className="h-6 w-6 text-gold" />
              <p className="mt-3 font-bold text-bone">Envios</p>
              <p className="text-sm text-mist">Combine a entrega pelo WhatsApp</p>
            </div>
          </div>

          <GlowButton href={whatsappLink()} variant="ghost" icon={<WhatsAppIcon className="h-5 w-5 text-gold" />} className="w-full">
            WhatsApp {contact.whatsappDisplay}
          </GlowButton>
        </Reveal>
      </div>
    </section>
  )
}
