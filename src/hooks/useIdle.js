import { useEffect, useState } from 'react'

/** Fica true quando o navegador está ocioso — adia trabalho pesado (3D) para depois do primeiro paint. */
export function useIdle(timeout = 1200) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setIdle(true), 300)
    return () => clearTimeout(id)
  }, [timeout])
  return idle
}
