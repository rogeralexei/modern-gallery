import { useEffect, useState } from 'react'

/**
 * Tiny hash router. Routes are flat hash names (`#work-blue-hour`,
 * `#checkout`) so links can be bookmarked and shared on any static host
 * without server rewrites. Swap for React Router / TanStack Router later
 * if the site grows.
 */
export type Route =
  | { name: 'home'; section?: string }
  | { name: 'work'; slug: string }
  | { name: 'checkout' }

const SECTIONS = ['gallery', 'collection', 'about', 'contact']

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, '')
  if (h.startsWith('work-')) return { name: 'work', slug: h.slice(5) }
  if (h === 'checkout') return { name: 'checkout' }
  if (SECTIONS.includes(h)) return { name: 'home', section: h }
  return { name: 'home' }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const navigate = (hash: string) => {
  const next = hash.startsWith('#') ? hash : `#${hash}`
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = next
  }
}

export const workHref = (slug: string) => `#work-${slug}`
