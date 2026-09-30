import { useEffect, useRef } from 'react'

/** Posição normalizada do mouse (-1..1) guardada em ref, para parallax nas cenas 3D. */
export function usePointer(enabled = true) {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])
  return pointer
}
