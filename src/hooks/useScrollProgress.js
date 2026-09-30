import { useEffect, useRef } from 'react'

const clamp01 = (v) => Math.min(1, Math.max(0, v))

/**
 * Progresso de rolagem de uma seção, guardado em um ref (sem re-render):
 *  - mode 'exit'    → 0 com a seção no topo da tela, 1 quando ela sai por cima (ideal para o hero)
 *  - mode 'through' → 0 quando a seção entra por baixo, 1 quando sai por cima
 * O valor é lido a cada quadro pelas cenas 3D / vídeo, permitindo parallax suave.
 * `onChange` (opcional) é chamado com o progresso — útil para CSS vars.
 */
export function useScrollProgress(targetRef, { mode = 'through', onChange } = {}) {
  const progress = useRef(0)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const el = targetRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const value =
        mode === 'exit' ? clamp01(-rect.top / Math.max(1, rect.height)) : clamp01((vh - rect.top) / (vh + rect.height))
      progress.current = value
      onChangeRef.current?.(value)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [targetRef, mode])

  return progress
}
