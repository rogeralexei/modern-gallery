import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { artist } from '../data/artist'
import { useScrollLock } from '../lib/hooks'
import { navigate, type Route } from '../lib/router'
import { useShop } from '../store/cart'
import { InstagramIcon } from './ui'

const links = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'collection', label: 'Collection' },
  { id: 'about', label: 'The Artist' },
  { id: 'contact', label: 'Contact' },
]

export function goToSection(id: string) {
  const el = document.getElementById(id)
  if (el && !window.location.hash.startsWith('#work-') && window.location.hash !== '#checkout') {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  } else {
    navigate(id)
  }
}

export function Nav({ route }: { route: Route }) {
  const { count, setDrawerOpen } = useShop()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)
  useScrollLock(menu)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    setHidden(y > 500 && y > prev + 4 && !menu)
    if (y < prev - 4) setHidden(false)
  })

  useEffect(() => setMenu(false), [route])

  const solid = scrolled || route.name !== 'home'

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500 ${
          solid ? 'border-b border-line bg-ivory/75 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10" aria-label="Main">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (route.name === 'home') window.scrollTo({ top: 0, behavior: 'smooth' })
              else navigate('')
            }}
            className="group flex items-baseline gap-2"
            aria-label={`${artist.name} — home`}
          >
            <span className="font-display text-[1.6rem] leading-none tracking-tight">
              {artist.firstName} <span className="italic">{artist.lastName}</span>
            </span>
            <span className="hidden text-[0.625rem] tracking-[0.25em] text-mute uppercase sm:inline">Studio</span>
          </a>

          <ul className="hidden items-center gap-10 lg:flex">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => goToSection(l.id)}
                  className="link-line pb-0.5 text-[0.8125rem] tracking-[0.04em] text-ink-soft transition-colors hover:text-ink"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setDrawerOpen(true)}
              className="group relative flex h-11 items-center gap-2.5 px-3 text-[0.8125rem]"
              aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
            >
              <ShoppingBag className="h-[18px] w-[18px] transition-transform duration-500 group-hover:-rotate-6" strokeWidth={1.4} />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.6875rem] tabular-nums ${count ? 'bg-ink text-ivory' : 'bg-ink/8 text-ink-soft'}`}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </button>
            <button
              className="relative flex h-11 w-11 items-center justify-center lg:hidden"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-label={menu ? 'Close menu' : 'Open menu'}
            >
              <span className="relative block h-3 w-6">
                <span className={`absolute left-0 h-px w-6 bg-ink transition-all duration-500 ${menu ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-px bg-ink transition-all duration-500 ${menu ? 'top-1.5 w-6 -rotate-45' : 'top-3 w-4'}`} />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ivory px-6 pt-28 pb-10 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          >
            <ul className="flex flex-col gap-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => {
                      setMenu(false)
                      setTimeout(() => goToSection(l.id), 350)
                    }}
                    className="flex w-full items-baseline gap-4 border-b border-line py-4 text-left"
                  >
                    <span className="font-display text-sm italic text-mute">0{i + 1}</span>
                    <span className="display text-5xl">{l.label}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between text-sm text-ink-soft">
              <a href={artist.contact.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <InstagramIcon /> {artist.contact.instagramHandle}
              </a>
              <button onClick={() => setMenu(false)} className="flex items-center gap-1" aria-label="Close menu">
                <X className="h-4 w-4" /> Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
