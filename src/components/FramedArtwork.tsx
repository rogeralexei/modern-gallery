import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useRef, useState, type CSSProperties } from 'react'
import type { Artwork } from '../data/artworks'

interface Props {
  art: Artwork
  /** Use the small file (cards, rails) or the large one (detail, hero) */
  size?: 'sm' | 'lg'
  /** Pointer-reactive 3D tilt + varnish sheen */
  tilt?: boolean
  /** Max tilt in degrees */
  tiltMax?: number
  frameWidth?: number
  matWidth?: number
  className?: string
  imgRef?: React.Ref<HTMLImageElement>
  priority?: boolean
  style?: CSSProperties
  /** Fill the parent box (parent sets size/aspect) instead of sizing from the image */
  fill?: boolean
}

/**
 * A painting hung in a gallery frame. The frame is pure CSS (see `.frame`
 * in index.css) so it stays crisp at any size; the optional tilt uses
 * springs so it settles naturally when the pointer leaves.
 */
export function FramedArtwork({
  art,
  size = 'sm',
  tilt = false,
  tiltMax = 8,
  frameWidth,
  matWidth,
  className = '',
  imgRef,
  priority,
  style,
  fill = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 140, damping: 18 })
  const sy = useSpring(py, { stiffness: 140, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-tiltMax, tiltMax])
  const rotateX = useTransform(sy, [0, 1], [tiltMax, -tiltMax])
  const sheenX = useTransform(sx, (v) => `${v * 100}%`)
  const sheenY = useTransform(sy, (v) => `${v * 100}%`)

  const onMove = (e: React.PointerEvent) => {
    if (!tilt || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  const fw = frameWidth ?? (size === 'lg' ? 22 : 10)
  const mw = matWidth ?? 0

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`frame frame--${art.frame} ${fill ? 'h-full w-full' : ''} ${className}`}
      style={
        {
          '--frame-w': `${fw}px`,
          '--mat-w': `${mw}px`,
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
          transformPerspective: 900,
          ...style,
        } as unknown as CSSProperties
      }
    >
      <div className={`frame__mat ${fill ? 'h-full' : ''}`}>
        <motion.div
          className={`frame__canvas bg-paper ${fill ? 'h-full' : ''}`}
          style={{ aspectRatio: fill ? undefined : art.aspect, '--sx': sheenX, '--sy': sheenY } as unknown as CSSProperties}
        >
          {!loaded && <div className="absolute inset-0 animate-pulse bg-bone/70" aria-hidden />}
          <img
            ref={imgRef}
            src={size === 'lg' ? art.image : art.thumb}
            alt={`${art.title}, ${art.year} — ${art.medium}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
