import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export const useIsDesktop = () => useMediaQuery('(min-width: 900px) and (not (pointer: coarse))')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Locks body scroll while `locked` is true (for drawers and modals). */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

export function useEscape(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && handler()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [handler, active])
}
