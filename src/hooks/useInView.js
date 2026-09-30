import { useEffect, useState } from 'react'

/** true enquanto o elemento estiver (próximo de estar) visível na tela. */
export function useInView(ref, { rootMargin = '0px', once = false, threshold = 0 } = {}) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin, threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, once, threshold])

  return inView
}
