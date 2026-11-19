import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { ArrowRight, MoveHorizontal } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { FramedArtwork } from '../components/FramedArtwork'
import { goToSection } from '../components/Nav'
import { AvailabilityDot, SectionLabel } from '../components/ui'
import { artworks, type Artwork } from '../data/artworks'
import { dims, money } from '../lib/format'
import { useIsDesktop } from '../lib/hooks'
import { useOpenArtwork } from '../lib/transition'

/**
 * The signature interaction: a gallery wall you walk along.
 * Desktop — vertical scroll drives a horizontal camera dolly; every
 * painting turns subtly toward you as it passes centre.
 * Touch — a native swipe rail with snap points and a depth falloff.
 */
export function GalleryWalk() {
  const desktop = useIsDesktop()
  return (
    <section id="gallery" aria-label="Gallery" className="relative bg-paper/60">
      {desktop ? <WallDesktop works={artworks} /> : <RailTouch works={artworks} />}
    </section>
  )
}

const HANG = [0.6, 0.5, 0.56, 0.46, 0.62, 0.5, 0.54, 0.6, 0.48, 0.56, 0.64, 0.5]

function WallDesktop({ works }: { works: Artwork[] }) {
  const section = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const [vw, setVw] = useState(() => window.innerWidth)

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return
      setVw(window.innerWidth)
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const raw = useTransform(scrollYProgress, [0, 1], [0, -dist])
  const x = useSpring(raw, { stiffness: 120, damping: 28, mass: 0.6 })
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setIdx(Math.min(works.length - 1, Math.round(p * (works.length - 1)))))

  return (
    <div ref={section} style={{ height: `calc(${dist}px + 100vh)` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ perspective: '1800px' }}>
        {/* wall lighting rhythm */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-b from-transparent to-bone/60" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[14%] h-px bg-ink/[0.07]" />

        <motion.div ref={track} style={{ x }} className="relative flex h-full items-center will-change-transform">
          {/* Intro panel */}
          <div className="flex h-full w-[42vw] shrink-0 flex-col justify-center pr-[6vw] pl-[6vw]">
            <SectionLabel index="I">The Gallery</SectionLabel>
            <h2 className="display mt-8 text-[clamp(3rem,6vw,6.5rem)]">
              Walk <span className="italic">the</span>
              <br /> wall
            </h2>
            <p className="mt-6 max-w-[36ch] text-[0.9375rem] leading-relaxed text-ink-soft">
              Twelve paintings, hung as they would be in the studio. Keep scrolling to move along the wall —
              select any work to step closer.
            </p>
            <p className="eyebrow mt-10 flex items-center gap-3">
              <MoveHorizontal className="h-4 w-4" strokeWidth={1.2} /> Scroll to explore
            </p>
          </div>

          {works.map((art, i) => (
            <WallPiece key={art.id} art={art} index={i} x={x} vw={vw} hang={HANG[i % HANG.length]} />
          ))}

          {/* Outro */}
          <div className="flex h-full w-[46vw] shrink-0 flex-col items-start justify-center pl-[8vw]">
            <p className="eyebrow">End of the wall</p>
            <p className="display mt-6 text-[clamp(2.5rem,4.4vw,4.5rem)]">
              See every work, <span className="italic">side by side.</span>
            </p>
            <button onClick={() => goToSection('collection')} className="link-line mt-8 inline-flex items-center gap-2 pb-1 text-sm">
              Browse the collection <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* HUD */}
        <div className="absolute inset-x-[6vw] bottom-8 flex items-center gap-6">
          <span className="font-display text-sm tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
          <div className="relative h-px flex-1 bg-ink/12">
            <motion.div style={{ width: bar }} className="absolute inset-y-0 left-0 bg-ink" />
          </div>
          <span className="font-display text-sm text-mute tabular-nums">{String(works.length).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}

function WallPiece({ art, index, x, vw, hang }: { art: Artwork; index: number; x: MotionValue<number>; vw: number; hang: number }) {
  const el = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const [center, setCenter] = useState(0)
  const open = useOpenArtwork()

  useLayoutEffect(() => {
    const m = () => el.current && setCenter(el.current.offsetLeft + el.current.offsetWidth / 2)
    m()
    window.addEventListener('resize', m)
    return () => window.removeEventListener('resize', m)
  }, [])

  // -1 (left of screen) … 0 (centre) … 1 (right of screen)
  const rel = useTransform(x, (v) => (center + v - vw / 2) / vw)
  const rotateY = useTransform(rel, [-1, 0, 1], [24, 0, -24])
  const z = useTransform(rel, [-1, 0, 1], [-160, 0, -160])
  const labelOpacity = useTransform(rel, [-0.35, -0.12, 0.12, 0.35], [0, 1, 1, 0])

  const maxW = art.aspect > 1.2 ? '34vw' : '26vw'

  return (
    <div ref={el} className="relative flex h-full shrink-0 items-center px-[4.5vw]" style={{ marginTop: index % 2 ? '-4vh' : '2vh' }}>
      <motion.div style={{ rotateY, z, transformStyle: 'preserve-3d' }} className="relative">
        <motion.button
          onClick={() => open(art, img.current)}
          className="group block cursor-zoom-in"
          style={{ width: `min(${hang * 100 * art.aspect}vh, ${maxW})`, aspectRatio: art.aspect }}
          whileHover={{ z: 60, scale: 1.025 }}
          transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          aria-label={`${art.title}, ${art.year}. ${money(art.price)}. ${art.availability}. View details`}
        >
          <FramedArtwork art={art} imgRef={img} frameWidth={art.frame === 'white' ? 10 : 12} matWidth={art.frame === 'white' ? 18 : 0} fill />
        </motion.button>
        {/* museum wall label */}
        <motion.div style={{ opacity: labelOpacity }} className="absolute top-full left-0 mt-6 w-[260px] text-[0.75rem] leading-relaxed text-ink-soft">
          <p className="font-display text-[1.125rem] text-ink italic">{art.title}</p>
          <p>
            {art.medium}, {art.year} · {dims(art.widthCm, art.heightCm).cm}
          </p>
          <div className="mt-1.5 flex items-center gap-4">
            <span className="text-ink">{art.availability === 'sold' ? 'Private collection' : money(art.price)}</span>
            <AvailabilityDot status={art.availability} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function RailTouch({ works }: { works: Artwork[] }) {
  const rail = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const open = useOpenArtwork()
  const imgs = useRef<(HTMLImageElement | null)[]>([])

  const onScroll = () => {
    const r = rail.current
    if (!r) return
    const mid = r.scrollLeft + r.clientWidth / 2
    let best = 0
    let bestD = Infinity
    Array.from(r.children).forEach((c, i) => {
      const el = c as HTMLElement
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
      const t = Math.min(1, d / r.clientWidth)
      el.style.setProperty('--t', String(t))
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    setActive(best)
  }

  useLayoutEffect(onScroll, [])

  const art = works[active]

  return (
    <div className="py-20">
      <div className="px-5">
        <SectionLabel index="I">The Gallery</SectionLabel>
        <h2 className="display mt-6 text-[3.25rem]">
          Walk <span className="italic">the</span> wall
        </h2>
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
          <MoveHorizontal className="h-4 w-4" strokeWidth={1.2} /> Swipe to browse · tap to view
        </p>
      </div>
      <div
        ref={rail}
        onScroll={onScroll}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[14vw] pb-6"
        style={{ scrollPaddingInline: '14vw' }}
      >
        {works.map((a, i) => (
          <button
            key={a.id}
            onClick={() => open(a, imgs.current[i])}
            className="w-[72vw] shrink-0 snap-center transition-[transform,opacity] duration-300 ease-out"
            style={{
              transform: 'scale(calc(1 - var(--t, 1) * 0.14)) translateY(calc(var(--t, 1) * 12px))',
              opacity: 'calc(1 - var(--t, 1) * 0.5)',
            }}
            aria-label={`${a.title}, ${a.year}. View details`}
          >
            <div className="mx-auto" style={{ maxHeight: '58svh', aspectRatio: a.aspect, maxWidth: '100%' }}>
              <FramedArtwork art={a} imgRef={(n) => { imgs.current[i] = n }} frameWidth={9} />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 px-5 text-center">
        <motion.div key={art.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-display text-2xl italic">{art.title}</p>
          <p className="mt-1 text-[0.8125rem] text-ink-soft">
            {art.medium}, {art.year} · {art.availability === 'sold' ? 'Private collection' : money(art.price)}
          </p>
        </motion.div>
        <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
          {works.map((w, i) => (
            <span key={w.id} className={`h-px transition-all duration-500 ${i === active ? 'w-6 bg-ink' : 'w-2 bg-ink/25'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
