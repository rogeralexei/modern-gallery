import { motion, useScroll, useTransform } from 'motion/react'
import { Camera } from 'lucide-react'
import { useRef } from 'react'
import { Reveal, SectionLabel } from '../components/ui'
import { artist } from '../data/artist'
import { artworks } from '../data/artworks'

export function About() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const detailY = useTransform(scrollYProgress, [0, 1], [-30, 90])
  const studio = artworks.find((a) => a.slug === 'ember-tide')!

  return (
    <section id="about" className="relative scroll-mt-16 bg-paper/70 py-24 md:py-40" aria-label="About the artist">
      <div ref={ref} className="mx-auto max-w-[1600px] px-5 md:px-10">
        <Reveal>
          <SectionLabel index="III">The Artist</SectionLabel>
        </Reveal>

        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Portrait column */}
          <div className="relative lg:col-span-5">
            <motion.figure style={{ y: portraitY }} className="relative">
              {/* Portrait placeholder — replace with a studio photograph (4:5) */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-bone via-paper to-[#d9cdb9]">
                <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_35%_20%,rgba(255,250,240,.9),transparent_60%)]" />
                <div className="absolute inset-x-[22%] top-[18%] bottom-0">
                  {/* soft, abstract silhouette — intentionally not a face */}
                  <div className="mx-auto aspect-square w-[46%] rounded-full bg-ink/[0.07]" />
                  <div className="mx-auto mt-[6%] h-full w-full rounded-t-[45%] bg-ink/[0.07]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-5 text-[0.75rem] text-ink-soft">
                  <Camera className="h-3.5 w-3.5" strokeWidth={1.4} /> Portrait placeholder — studio photograph, 4:5
                </div>
              </div>
              <figcaption className="mt-4 flex justify-between text-[0.75rem] text-mute">
                <span>{artist.name} in the studio</span>
                <span>{artist.based}</span>
              </figcaption>
            </motion.figure>
            <motion.div
              style={{ y: detailY }}
              className="absolute -right-4 -bottom-20 hidden w-[42%] shadow-[0_30px_60px_-25px_rgba(40,30,20,.55)] md:block lg:-right-16"
            >
              <img src={studio.thumb} alt={`Detail of ${studio.title}`} className="aspect-square w-full scale-100 object-cover" loading="lazy" />
            </motion.div>
          </div>

          {/* Text column */}
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <h2 className="display text-[clamp(2.75rem,5.4vw,5.25rem)]">
                Painting <span className="italic">the colour</span> of air
              </h2>
            </Reveal>
            <div className="mt-10 space-y-5 text-[1.0625rem] leading-[1.75] text-ink-soft">
              {artist.bio.map((p, i) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p className={i === 0 ? 'first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-ink' : ''}>{p}</p>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-14 border-l-2 border-clay/60 pl-6">
              <p className="eyebrow">Philosophy</p>
              <p className="mt-4 font-display text-[1.75rem] leading-snug italic">“{artist.philosophy}”</p>
            </Reveal>
          </div>
        </div>

        {/* Process */}
        <div className="mt-32 md:mt-44">
          <Reveal className="flex items-end justify-between gap-6 border-b border-line pb-6">
            <h3 className="display text-[clamp(2rem,3.6vw,3.25rem)]">
              The <span className="italic">process</span>
            </h3>
            <p className="hidden max-w-[36ch] text-sm text-ink-soft md:block">Most paintings take between two and five months, from first sketch to varnish.</p>
          </Reveal>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
            {artist.process.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 0.08} className="group border-b border-line py-8 sm:pr-8 lg:border-r lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                <span className="font-display text-sm text-clay italic">{s.step}</span>
                <h4 className="mt-6 font-display text-[1.75rem] transition-transform duration-500 group-hover:translate-x-1">{s.title}</h4>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Exhibitions */}
        <div className="mt-28 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <h3 className="display text-[clamp(2rem,3.6vw,3.25rem)]">
              Selected <span className="italic">exhibitions</span>
            </h3>
          </Reveal>
          <ul className="lg:col-span-8">
            {artist.exhibitions.map((e, i) => (
              <Reveal as="li" key={i} delay={i * 0.04} className="group grid grid-cols-[4rem_1fr] items-baseline gap-4 border-t border-line py-5 last:border-b sm:grid-cols-[5rem_1fr_auto]">
                <span className="font-display text-lg text-mute tabular-nums">{e.year}</span>
                <span>
                  <span className="font-display text-[1.375rem] italic transition-colors group-hover:text-clay">{e.title}</span>
                  <span className="block text-sm text-ink-soft">{e.venue}</span>
                </span>
                <span className="eyebrow hidden sm:block">{e.kind}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
