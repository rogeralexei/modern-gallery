import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import type { Artwork } from '../data/artworks'
import { dims, money } from '../lib/format'
import { useOpenArtwork } from '../lib/transition'
import { FramedArtwork } from './FramedArtwork'
import { AvailabilityDot } from './ui'

export function ArtworkCard({ art, index = 0 }: { art: Artwork; index?: number }) {
  const img = useRef<HTMLImageElement>(null)
  const open = useOpenArtwork()
  const d = dims(art.widthCm, art.heightCm)
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <button
        onClick={() => open(art, img.current)}
        className="relative block w-full cursor-zoom-in"
        aria-label={`View ${art.title}`}
      >
        {/* light wall the work hangs on */}
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-paper transition-colors duration-700 group-hover:bg-bone/80">
          <div className="wall-light absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div
            className="relative transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1.5 group-hover:scale-[1.03]"
            style={art.aspect >= 1 ? { width: '74%' } : { height: '74%', aspectRatio: art.aspect }}
          >
            <FramedArtwork
              art={art}
              imgRef={img}
              tilt
              tiltMax={6}
              frameWidth={art.frame === 'white' ? 8 : 9}
              matWidth={art.frame === 'white' ? 14 : 0}
              fill={art.aspect < 1}
            />
          </div>
          <span className="absolute top-4 left-4 eyebrow !text-[0.625rem]">{art.category}</span>
          <span className="absolute top-3 right-3 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-ivory/80 opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.4} />
          </span>
        </div>
      </button>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.5rem] leading-tight">
            <span className="italic">{art.title}</span>
          </h3>
          <p className="mt-1 text-[0.8125rem] text-ink-soft">
            {art.medium}, {art.year}
          </p>
          <p className="text-[0.8125rem] text-mute">
            {d.cm} <span className="text-ink/25">/</span> {d.in}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[0.9375rem] tabular-nums">{art.availability === 'sold' ? '—' : money(art.price)}</p>
          <AvailabilityDot status={art.availability} className="mt-1.5" />
        </div>
      </div>
      {art.print && (
        <p className="mt-3 border-t border-line pt-3 text-[0.75rem] text-mute">
          Limited print from {money(art.print.price)} · {art.print.remaining} of {art.print.editionSize} left
        </p>
      )}
    </motion.article>
  )
}
