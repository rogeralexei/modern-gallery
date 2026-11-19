import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { lazy, Suspense, useCallback, useRef, useState } from 'react'
import { FramedArtwork } from '../components/FramedArtwork'
import { goToSection } from '../components/Nav'
import { Button, MaskLines } from '../components/ui'
import { artist } from '../data/artist'
import { artworks } from '../data/artworks'
import { dims } from '../lib/format'
import { useIsDesktop, useReducedMotion } from '../lib/hooks'
import { useOpenArtwork } from '../lib/transition'

const HeroCanvas = lazy(() => import('../components/HeroCanvas'))

const heroArt = artworks.find((a) => a.slug === 'blue-hour') ?? artworks[0]

export function Hero() {
  const desktop = useIsDesktop()
  const reduce = useReducedMotion()
  const use3D = desktop && !reduce
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const open = useOpenArtwork()
  const fallbackImg = useRef<HTMLImageElement>(null)
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section ref={section} className="relative min-h-[100svh] overflow-hidden" aria-label="Introduction">
      {/* Gallery wall: warm light cone + floor line */}
      <div className="pointer-events-none absolute inset-0">
        <div className="wall-light absolute inset-x-0 top-0 h-[80%] lg:left-[38%]" />
        <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-b from-transparent to-paper/70" />
        <div className="absolute inset-x-0 bottom-[16%] h-px bg-ink/[0.06]" />
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1600px] grid-cols-1 items-center gap-6 px-5 pt-24 pb-16 md:px-10 lg:grid-cols-12 lg:gap-0 lg:pt-20">
        {/* Painting */}
        <div className="relative order-1 h-[46svh] lg:order-2 lg:col-span-7 lg:h-[86svh]">
          {use3D ? (
            <>
              <Suspense fallback={null}>
                <HeroCanvas art={heroArt} onReady={onReady} />
              </Suspense>
              {/* invisible hit-area so the painting itself is clickable */}
              <button
                className="absolute inset-[18%] cursor-zoom-in"
                aria-label={`View ${heroArt.title}`}
                onClick={() => open(heroArt)}
              />
              {!ready && <div className="absolute inset-0 grid place-items-center"><span className="eyebrow animate-pulse">Hanging the work…</span></div>}
            </>
          ) : (
            <motion.button
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => open(heroArt, fallbackImg.current)}
              aria-label={`View ${heroArt.title}`}
              initial={{ opacity: 0, scale: 0.94, rotateY: -12 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200 }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[86%] max-w-[560px]"
              >
                <FramedArtwork art={heroArt} size="lg" frameWidth={16} imgRef={fallbackImg} priority />
              </motion.div>
            </motion.button>
          )}

          {/* Wall label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="absolute right-0 bottom-0 hidden max-w-[220px] border-l border-ink/15 pl-4 text-[0.75rem] leading-relaxed text-ink-soft lg:block"
          >
            <p className="font-display text-base text-ink italic">{heroArt.title}</p>
            <p>
              {heroArt.medium}, {heroArt.year}
            </p>
            <p>{dims(heroArt.widthCm, heroArt.heightCm).cm}</p>
            <button onClick={() => open(heroArt)} className="link-line mt-2 inline-flex items-center gap-1 text-ink">
              View the work <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        </div>

        {/* Text */}
        <motion.div style={{ y: textY, opacity: textOpacity }} className="relative order-2 lg:order-1 lg:col-span-5 lg:pr-10">
          <motion.p
            className="eyebrow mb-6 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <span className="h-px w-8 bg-ink/30" /> Original paintings · {artist.based}
          </motion.p>
          <h1 className="display text-[clamp(3.6rem,9vw,8.75rem)]">
            <MaskLines lines={[artist.firstName, <span className="italic">{artist.lastName}</span>]} delay={0.2} />
          </h1>
          <motion.p
            className="mt-8 max-w-[34ch] font-display text-[1.375rem] leading-snug text-ink-soft md:text-[1.6rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {artist.tagline} Each work is made slowly, in layers, so it keeps changing with the light in your room.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button onClick={() => goToSection('collection')}>
              Explore Collection <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Button>
            <button onClick={() => goToSection('about')} className="link-line pb-1 text-[0.8125rem] tracking-[0.06em]">
              Meet the Artist
            </button>
          </motion.div>
        </motion.div>
      </div>

      <motion.button
        onClick={() => goToSection('gallery')}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-mute md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        aria-label="Scroll to the gallery"
      >
        <span className="eyebrow">Enter the gallery</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown className="h-4 w-4" strokeWidth={1.3} />
        </motion.span>
      </motion.button>
    </section>
  )
}
