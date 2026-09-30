import { useEffect, useRef } from 'react'

/*
 * Um único verificador de rolagem para todos os <Reveal>: revela tudo o que já
 * entrou (ou passou) pela área visível. Diferente de um IntersectionObserver por
 * elemento, nada fica escondido quando o visitante pula seções pelo menu ou rola
 * muito rápido em aparelhos lentos.
 */
const pending = new Set()
let frame = 0

function check() {
  frame = 0
  const limit = window.innerHeight * 0.92
  for (const el of pending) {
    if (el.getBoundingClientRect().top < limit) {
      el.classList.add('is-visible')
      pending.delete(el)
    }
  }
  if (!pending.size) {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(check)
}

function watch(el) {
  if (!pending.size) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  pending.add(el)
  schedule()
}

/** Revela o conteúdo com fade/slide quando entra na tela (uma vez). */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    watch(el)
    return () => pending.delete(el)
  }, [])

  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }} {...props}>
      {children}
    </Tag>
  )
}
