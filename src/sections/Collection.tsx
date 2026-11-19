import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { ChevronDown, Grid2x2, Orbit } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ArtworkCard } from '../components/ArtworkCard'
import { Coverflow } from '../components/Coverflow'
import { Reveal, SectionLabel } from '../components/ui'
import { artworks, categories, type Category } from '../data/artworks'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'size'
const sorts: { id: Sort; label: string }[] = [
  { id: 'featured', label: 'Curated order' },
  { id: 'newest', label: 'Newest first' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'size', label: 'Size: largest first' },
]

export function Collection() {
  const [cat, setCat] = useState<Category | 'All'>('All')
  const [sort, setSort] = useState<Sort>('featured')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [view, setView] = useState<'grid' | 'immersive'>('grid')

  const list = useMemo(() => {
    let l = artworks.filter((a) => (cat === 'All' || a.category === cat) && (!availableOnly || a.availability === 'available'))
    const rank = { available: 0, reserved: 1, sold: 2 }
    l = [...l].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'newest':
          return b.year - a.year
        case 'size':
          return b.widthCm * b.heightCm - a.widthCm * a.heightCm
        default:
          return rank[a.availability] - rank[b.availability] || Number(!!b.featured) - Number(!!a.featured)
      }
    })
    return l
  }, [cat, sort, availableOnly])

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: artworks.length }
    categories.forEach((c) => (m[c] = artworks.filter((a) => a.category === c).length))
    return m
  }, [])

  return (
    <section id="collection" className="relative scroll-mt-16 py-24 md:py-36" aria-label="Collection">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-7">
            <SectionLabel index="II">The Collection</SectionLabel>
            <h2 className="display mt-8 text-[clamp(3rem,7vw,6.5rem)]">
              Works <span className="italic">for</span> collecting
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
            <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
              Every original is unique, signed and shipped with a certificate of authenticity. Selected works are
              also available as numbered giclée editions on cotton rag paper.
            </p>
          </Reveal>
        </div>

        {/* Toolbar */}
        <div className="relative z-30 -mx-5 mt-14 md:sticky border-y border-line bg-ivory/85 px-5 backdrop-blur-xl md:top-20 md:-mx-10 md:px-10">
          <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
            <LayoutGroup id="cats">
              <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by category">
                {(['All', ...categories] as const).map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cat === c}
                    onClick={() => setCat(c)}
                    className={`relative shrink-0 rounded-full px-4 py-2 text-[0.8125rem] transition-colors duration-300 ${cat === c ? 'text-ivory' : 'text-ink-soft hover:text-ink'}`}
                  >
                    {cat === c && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">
                      {c} <sup className="ml-0.5 text-[0.625rem] opacity-60">{counts[c]}</sup>
                    </span>
                  </button>
                ))}
              </div>
            </LayoutGroup>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-soft">
                <span className={`relative h-5 w-9 rounded-full transition-colors ${availableOnly ? 'bg-sage' : 'bg-ink/15'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-ivory shadow transition-transform duration-300 ${availableOnly ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </span>
                <input type="checkbox" className="sr-only" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                Available only
              </label>

              <label className="relative flex items-center text-[0.8125rem]">
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="cursor-pointer appearance-none bg-transparent py-2 pr-6 pl-0 text-ink focus:outline-none"
                >
                  {sorts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-mute" />
              </label>

              <div className="flex rounded-full border border-ink/15 p-0.5" role="group" aria-label="View mode">
                {[
                  { id: 'grid' as const, icon: Grid2x2, label: 'Grid' },
                  { id: 'immersive' as const, icon: Orbit, label: 'Immersive' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    aria-pressed={view === id}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.75rem] transition-colors duration-300 ${view === id ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[0.75rem] text-mute" aria-live="polite">
          Showing {list.length} {list.length === 1 ? 'work' : 'works'}
        </p>

        <AnimatePresence mode="wait">
          {list.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-32 text-center">
              <p className="display text-4xl italic">Nothing on this wall yet.</p>
              <button onClick={() => { setCat('All'); setAvailableOnly(false) }} className="link-line mt-6 text-sm">
                Reset filters
              </button>
            </motion.div>
          ) : view === 'grid' ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-12">
                <AnimatePresence mode="popLayout">
                  {list.map((a, i) => (
                    <ArtworkCard key={a.id} art={a} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="immersive" className="-mx-5 mt-4 md:-mx-10" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Coverflow works={list} />
              <p className="eyebrow mt-8 text-center">Drag, swipe or use ← → keys</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
