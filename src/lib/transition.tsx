import { AnimatePresence, motion } from 'motion/react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { Artwork } from '../data/artworks'
import { navigate, workHref } from './router'

/**
 * "Camera" transition into an artwork: the clicked image is cloned at its
 * on-screen rect, glides to centre stage while the page dims, then the
 * detail route mounts underneath and the clone dissolves into it.
 */
interface Flight {
  art: Artwork
  from: DOMRect
}

const Ctx = createContext<(art: Artwork, el?: HTMLElement | null) => void>(() => {})

export function ArtTransitionProvider({ children }: { children: ReactNode }) {
  const [flight, setFlight] = useState<Flight | null>(null)

  const open = useCallback((art: Artwork, el?: HTMLElement | null) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || reduce) {
      navigate(workHref(art.slug))
      return
    }
    setFlight({ art, from: el.getBoundingClientRect() })
    window.setTimeout(() => navigate(workHref(art.slug)), 560)
    window.setTimeout(() => setFlight(null), 1050)
  }, [])

  const target = flight ? targetRect(flight.art.aspect) : null

  return (
    <Ctx.Provider value={open}>
      {children}
      <AnimatePresence>
        {flight && target && (
          <motion.div
            key={flight.art.id}
            className="pointer-events-none fixed inset-0 z-[80]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          >
            <motion.div
              className="absolute inset-0 bg-ivory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.img
              src={flight.art.image}
              alt=""
              className="absolute object-cover shadow-[0_40px_80px_-30px_rgba(40,30,20,0.5)]"
              initial={{ left: flight.from.left, top: flight.from.top, width: flight.from.width, height: flight.from.height }}
              animate={{ left: target.left, top: target.top, width: target.width, height: target.height }}
              transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

function targetRect(aspect: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxW = vw >= 1024 ? vw * 0.5 : vw * 0.86
  const maxH = vh * 0.62
  let w = maxW
  let h = w / aspect
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  const left = vw >= 1024 ? vw * 0.06 + (vw * 0.52 - w) / 2 : (vw - w) / 2
  return { left, top: (vh - h) / 2 + 30, width: w, height: h }
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOpenArtwork = () => useContext(Ctx)
