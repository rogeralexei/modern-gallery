import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { CartDrawer } from './components/CartDrawer'
import { Nav } from './components/Nav'
import { InquiryModal, Preloader, Toast } from './components/Overlays'
import { useRoute, type Route } from './lib/router'
import { ArtTransitionProvider } from './lib/transition'
import { ArtworkPage } from './pages/ArtworkPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { About } from './sections/About'
import { Collection } from './sections/Collection'
import { Footer } from './sections/Footer'
import { GalleryWalk } from './sections/GalleryWalk'
import { Hero } from './sections/Hero'
import { Statement } from './sections/Statement'
import { ShopProvider } from './store/cart'

function Home({ section }: { section?: string }) {
  useEffect(() => {
    if (!section) return
    const t = setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 120)
    return () => clearTimeout(t)
  }, [section])
  return (
    <main>
      <Hero />
      <GalleryWalk />
      <Statement />
      <Collection />
      <About />
    </main>
  )
}

const routeKey = (r: Route) => (r.name === 'work' ? `work-${r.slug}` : r.name)

export default function App() {
  const route = useRoute()
  const [loading, setLoading] = useState(() => route.name === 'home' && !route.section)
  const done = useCallback(() => setLoading(false), [])

  // Restore scroll to top on page changes (sections handle their own scroll)
  useEffect(() => {
    if (route.name !== 'home' || !route.section) window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey(route)])

  return (
    <ShopProvider>
      <ArtTransitionProvider>
        <div className="grain min-h-screen">
          <a href="#collection" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
            Skip to collection
          </a>
          <Nav route={route} />
          <AnimatePresence mode="wait">
            <motion.div
              key={routeKey(route)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {route.name === 'home' && <Home section={route.section} />}
              {route.name === 'work' && <ArtworkPage slug={route.slug} />}
              {route.name === 'checkout' && <CheckoutPage />}
            </motion.div>
          </AnimatePresence>
          <Footer />
          <CartDrawer />
          <InquiryModal />
          <Toast />
          <AnimatePresence>{loading && <Preloader onDone={done} />}</AnimatePresence>
        </div>
      </ArtTransitionProvider>
    </ShopProvider>
  )
}
