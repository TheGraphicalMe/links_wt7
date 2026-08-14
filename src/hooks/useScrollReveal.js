import { useEffect, useRef } from 'react'

export default function useScrollReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-visible')
        }
      },
      { threshold: 0.1, rootMargin: '-30px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
