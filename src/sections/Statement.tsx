import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { artist } from '../data/artist'
import { artworks } from '../data/artworks'

/** A quiet editorial interlude: the artist's statement over drifting details. */
export function Statement() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -120])
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 140])
  const words = artist.statement.split(' ')
  const a = artworks.find((x) => x.slug === 'parnassus-light')!
  const b = artworks.find((x) => x.slug === 'birch-silence')!

  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48" aria-label="Artist statement">
      <motion.div style={{ y: y1 }} className="absolute top-16 -left-10 hidden w-[18vw] max-w-[260px] opacity-90 md:block" aria-hidden>
        <div className="aspect-[3/4] overflow-hidden shadow-[0_30px_60px_-30px_rgba(40,30,20,.5)]">
          <img src={a.thumb} alt="" className="h-full w-full scale-150 object-cover" loading="lazy" />
        </div>
        <p className="eyebrow mt-3 !text-[0.625rem]">Detail — {a.title}</p>
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-[-3vw] bottom-10 hidden w-[16vw] max-w-[230px] md:block" aria-hidden>
        <div className="aspect-square overflow-hidden shadow-[0_30px_60px_-30px_rgba(40,30,20,.5)]">
          <img src={b.thumb} alt="" className="h-full w-full scale-[1.8] object-cover object-bottom" loading="lazy" />
        </div>
        <p className="eyebrow mt-3 !text-[0.625rem]">Detail — {b.title}</p>
      </motion.div>

      <div className="relative mx-auto max-w-[1100px] px-6 text-center">
        <p className="eyebrow">Statement</p>
        <blockquote className="display mt-10 text-[clamp(2rem,4.4vw,3.9rem)] !leading-[1.08]">
          {words.map((w, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0.12 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -25% 0px' }}
              transition={{ duration: 0.6, delay: i * 0.025 }}
            >
              {i === 3 || i === 4 || i === 5 ? <em>{w}</em> : w}&nbsp;
            </motion.span>
          ))}
        </blockquote>
        <p className="mt-10 font-display text-xl italic text-ink-soft">— {artist.name}</p>
      </div>
    </section>
  )
}
