import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Artwork } from '../data/artworks'
import { dims, money } from '../lib/format'
import { useIsDesktop } from '../lib/hooks'
import { useOpenArtwork } from '../lib/transition'
import { FramedArtwork } from './FramedArtwork'
import { AvailabilityDot, Button } from './ui'

/**
 * Infinite 3D carousel. `pos` is a continuous index; each painting is laid
 * out by its wrapped distance from `pos`, so the loop never ends and drag,
 * wheel, keys and buttons all drive the same value.
 */
export function Coverflow({ works }: { works: Artwork[] }) {
  const pos = useMotionValue(0)
  const [active, setActive] = useState(0)
  const desktop = useIsDesktop()
  const open = useOpenArtwork()
  const stage = useRef<HTMLDivElement>(null)
  const imgs = useRef<(HTMLImageElement | null)[]>([])
  const drag = useRef<{ x: number; p: number; moved: boolean; t: number; lastX: number; v: number } | null>(null)
  const n = works.length

  useMotionValueEvent(pos, 'change', (v) => setActive(((Math.round(v) % n) + n) % n))

  // reset when the filtered list changes
  useEffect(() => {
    pos.jump(0)
    setActive(0)
  }, [works, pos])

  const go = (to: number) => animate(pos, to, { type: 'spring', stiffness: 110, damping: 22 })
  const step = (d: number) => go(Math.round(pos.get()) + d)

  // wheel (horizontal or shift+vertical) — only when the stage is hovered
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let timer: number | undefined
    const on = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0
      if (!d) return
      e.preventDefault()
      pos.set(pos.get() + d / 600)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        go(Math.round(pos.get()))
      }, 120)
    }
    el.addEventListener('wheel', on, { passive: false })
    return () => el.removeEventListener('wheel', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const spacing = desktop ? 330 : 190

  const onDown = (e: React.PointerEvent) => {
    pos.stop()
    drag.current = { x: e.clientX, p: pos.get(), moved: false, t: performance.now(), lastX: e.clientX, v: 0 }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    const now = performance.now()
    d.v = (e.clientX - d.lastX) / Math.max(1, now - d.t)
    d.t = now
    d.lastX = e.clientX
    pos.set(d.p - dx / spacing)
  }
  const onUp = () => {
    const d = drag.current
    if (!d) return
    if (!d.moved) {
      drag.current = null
      return
    }
    const fling = -d.v * 2.2
    go(Math.round(pos.get() + fling))
    setTimeout(() => (drag.current = null), 0)
  }

  const art = works[active]
  if (!n) return null

  return (
    <div className="relative">
      <div
        ref={stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Immersive collection view"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(1)
          if (e.key === 'ArrowLeft') step(-1)
          if (e.key === 'Enter') open(art, imgs.current[active])
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-[58svh] min-h-[380px] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing md:h-[64vh]"
        style={{ perspective: desktop ? '1400px' : '900px' }}
      >
        <div className="wall-light pointer-events-none absolute inset-0 opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
          {works.map((a, i) => (
            <Slide
              key={a.id}
              art={a}
              i={i}
              n={n}
              pos={pos}
              spacing={spacing}
              desktop={desktop}
              imgRef={(el) => (imgs.current[i] = el)}
              onClick={() => {
                if (drag.current?.moved) return
                const cur = Math.round(pos.get())
                const off = wrapOffset(i, pos.get(), n)
                if (Math.abs(off) < 0.5) open(a, imgs.current[i])
                else go(cur + Math.round(off))
              }}
            />
          ))}
        </div>
      </div>

      {/* Caption + controls */}
      <div className="mx-auto mt-4 grid max-w-5xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 md:mt-8">
        <button onClick={() => step(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-ivory" aria-label="Previous painting">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.4} />
        </button>
        <motion.div key={art.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="text-center" aria-live="polite">
          <p className="eyebrow">
            {art.category} · {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
          </p>
          <p className="display mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)] italic">{art.title}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[0.8125rem] text-ink-soft">
            <span>{dims(art.widthCm, art.heightCm).cm}</span>
            <span>{art.availability === 'sold' ? 'Private collection' : money(art.price)}</span>
            <AvailabilityDot status={art.availability} />
          </div>
          <Button variant="ghost" className="mt-5 !py-3" onClick={() => open(art, imgs.current[active])}>
            View the work
          </Button>
        </motion.div>
        <button onClick={() => step(1)} className="grid h-12 w-12 place-items-center rounded-full border border-ink/15 transition-colors hover:bg-ink hover:text-ivory" aria-label="Next painting">
          <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>
    </div>
  )
}

function wrapOffset(i: number, p: number, n: number) {
  let off = i - p
  off = ((((off + n / 2) % n) + n) % n) - n / 2
  return off
}

function Slide({
  art,
  i,
  n,
  pos,
  spacing,
  desktop,
  imgRef,
  onClick,
}: {
  art: Artwork
  i: number
  n: number
  pos: MotionValue<number>
  spacing: number
  desktop: boolean
  imgRef: (el: HTMLImageElement | null) => void
  onClick: () => void
}) {
  const off = useTransform(pos, (p) => wrapOffset(i, p, n))
  const x = useTransform(off, (o) => o * spacing + Math.sign(o) * Math.min(Math.abs(o), 1) * (desktop ? 90 : 40))
  const rotateY = useTransform(off, (o) => Math.max(-1, Math.min(1, o)) * -38)
  const z = useTransform(off, (o) => -Math.min(Math.abs(o), 3) * (desktop ? 180 : 140))
  const opacity = useTransform(off, (o) => (Math.abs(o) > 3.2 ? 0 : 1 - Math.max(0, Math.abs(o) - 1.8) * 0.6))
  const zIndex = useTransform(off, (o) => 100 - Math.round(Math.abs(o) * 10))
  const brightness = useTransform(off, (o) => `brightness(${1 - Math.min(Math.abs(o), 2) * 0.12})`)

  const h = desktop ? 'min(42vh, 380px)' : 'min(40svh, 300px)'
  const mw = desktop ? '38vw' : '64vw'
  return (
    <motion.button
      onClick={onClick}
      className="absolute"
      style={{ x, z, rotateY, opacity, zIndex, filter: brightness, width: `min(calc(${h} * ${art.aspect}), ${mw})`, aspectRatio: art.aspect }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      aria-label={`${art.title}, ${art.year}`}
      tabIndex={-1}
    >
      <FramedArtwork art={art} imgRef={imgRef} frameWidth={desktop ? 12 : 8} fill />
      {/* floor reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-full right-0 left-0 mt-2 h-1/3 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{ backgroundImage: `url(${art.thumb})`, backgroundSize: 'cover', backgroundPosition: 'bottom', transform: 'scaleY(-1)', filter: 'blur(2px)' }}
      />
    </motion.button>
  )
}
