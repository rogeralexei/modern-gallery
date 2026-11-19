import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Maximize2, Minus, Plus, Ruler, Sofa, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArtworkCard } from '../components/ArtworkCard'
import { FramedArtwork } from '../components/FramedArtwork'
import { AvailabilityDot, Button } from '../components/ui'
import { artworks, getArtwork, relatedTo, type Artwork } from '../data/artworks'
import { dims, money } from '../lib/format'
import { useEscape, useScrollLock } from '../lib/hooks'
import { navigate, workHref } from '../lib/router'
import { useShop, type Variant } from '../store/cart'

export function ArtworkPage({ slug }: { slug: string }) {
  const art = getArtwork(slug)
  useEffect(() => {
    window.scrollTo(0, 0)
    if (art) document.title = `${art.title} — Elena Ravel`
    return () => {
      document.title = 'Elena Ravel — Original Paintings'
    }
  }, [art])

  if (!art) {
    return (
      <div className="flex min-h-[80svh] flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="display text-5xl italic">This work has left the wall.</p>
        <button onClick={() => navigate('collection')} className="link-line mt-6 text-sm">
          Back to the collection
        </button>
      </div>
    )
  }
  return <Detail key={art.id} art={art} />
}

function Detail({ art }: { art: Artwork }) {
  const { add, inCart, setDrawerOpen, notify, openInquiry } = useShop()
  const [variant, setVariant] = useState<Variant>(art.availability === 'available' || !art.print ? 'original' : 'print')
  const [view, setView] = useState<'wall' | 'room'>('wall')
  const [zoom, setZoom] = useState(false)
  const d = dims(art.widthCm, art.heightCm)
  const idx = artworks.findIndex((a) => a.id === art.id)
  const prev = artworks[(idx - 1 + artworks.length) % artworks.length]
  const next = artworks[(idx + 1) % artworks.length]

  const canBuyOriginal = art.availability === 'available'
  const canBuy = variant === 'original' ? canBuyOriginal : !!art.print && art.print.remaining > 0
  const already = inCart(art.id, variant)
  const price = variant === 'original' ? art.price : (art.print?.price ?? 0)

  const onAdd = () => {
    if (already) {
      setDrawerOpen(true)
      return
    }
    add(art.id, variant)
    notify(`${art.title} ${variant === 'print' ? '(print) ' : ''}added`)
  }

  return (
    <article className="pt-20 md:pt-24">
      {/* Breadcrumb */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
        <button onClick={() => navigate('collection')} className="group flex items-center gap-2 text-[0.8125rem] text-ink-soft hover:text-ink">
          <ArrowLeft className="h-4 w-4 transition-transform duration-500 group-hover:-translate-x-1" strokeWidth={1.4} /> Collection
          <span className="text-ink/25">/</span> <span className="text-ink">{art.category}</span>
        </button>
        <span className="eyebrow hidden sm:block">
          {String(idx + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
        </span>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-14">
        {/* Stage */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div
              className="relative flex aspect-[4/4.2] items-center justify-center overflow-hidden sm:aspect-[4/3.4]"
              style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${art.tone} 7%, #efe9df) 0%, #ebe4d8 78%, #ddd3c3 78.2%, #e6ddd0 100%)` }}
            >
              <div className="wall-light pointer-events-none absolute inset-0" />
              <AnimatePresence mode="wait" initial={false}>
                {view === 'wall' ? (
                  <motion.div
                    key="wall"
                    className="relative"
                    style={art.aspect >= 1 ? { width: '68%' } : { height: '72%', aspectRatio: art.aspect }}
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button onClick={() => setZoom(true)} className="block h-full w-full cursor-zoom-in" aria-label="Zoom into the painting">
                      <FramedArtwork
                        art={art}
                        size="lg"
                        tilt
                        tiltMax={5}
                        priority
                        frameWidth={art.frame === 'white' ? 14 : 20}
                        matWidth={art.frame === 'white' ? 34 : 0}
                        fill={art.aspect < 1}
                      />
                    </button>
                  </motion.div>
                ) : (
                  <RoomView key="room" art={art} />
                )}
              </AnimatePresence>

              {/* stage controls */}
              <div className="absolute bottom-4 left-4 flex rounded-full bg-ivory/70 p-1 backdrop-blur-md">
                {[
                  { id: 'wall' as const, label: 'Detail', icon: Maximize2 },
                  { id: 'room' as const, label: 'In a room', icon: Sofa },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    aria-pressed={view === id}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.75rem] transition-colors ${view === id ? 'bg-ink text-ivory' : 'text-ink-soft hover:text-ink'}`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {label}
                  </button>
                ))}
              </div>
              <button onClick={() => setZoom(true)} className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-ivory/70 px-3.5 py-2 text-[0.75rem] backdrop-blur-md hover:bg-ivory" aria-label="Open full-screen view">
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} /> Full view
              </button>
            </div>
            {art.imageCredit && <p className="mt-3 text-[0.6875rem] text-mute">{art.imageCredit}</p>}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow">
              {art.category} · {art.year}
            </p>
            <h1 className="display mt-4 text-[clamp(2.75rem,5vw,4.75rem)] italic">{art.title}</h1>
            <p className="mt-5 font-display text-[1.375rem] leading-snug text-ink-soft">{art.excerpt}</p>

            <div className="mt-8 flex items-center justify-between border-y border-line py-5">
              <div>
                <p className="text-[1.75rem] tabular-nums">{canBuy || variant === 'original' ? money(price) : '—'}</p>
                {variant === 'original' && art.availability === 'sold' && <p className="text-[0.75rem] text-mute">Original in a private collection</p>}
              </div>
              <AvailabilityDot status={variant === 'original' ? art.availability : canBuy ? 'available' : 'sold'} />
            </div>

            {/* Edition selector */}
            {art.print && (
              <fieldset className="mt-6">
                <legend className="eyebrow mb-3">Choose</legend>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'original', title: 'Original', sub: art.availability === 'available' ? `${art.medium} · ${d.cm}` : art.availability === 'reserved' ? 'Reserved' : 'Sold', disabled: false },
                      { id: 'print', title: 'Limited print', sub: `${art.print.size} · ${art.print.remaining}/${art.print.editionSize} left`, disabled: false },
                    ] as const
                  ).map((o) => (
                    <label key={o.id} className={`relative cursor-pointer border p-4 transition-colors ${variant === o.id ? 'border-ink bg-paper/60' : 'border-ink/15 hover:border-ink/40'}`}>
                      <input type="radio" name="variant" className="sr-only" checked={variant === o.id} onChange={() => setVariant(o.id)} />
                      <span className="block text-sm font-medium">{o.title}</span>
                      <span className="mt-1 block text-[0.75rem] text-ink-soft">{o.sub}</span>
                      {variant === o.id && (
                        <motion.span layoutId="variant-check" className="absolute top-3 right-3 grid h-4 w-4 place-items-center rounded-full bg-ink text-ivory">
                          <Check className="h-2.5 w-2.5" />
                        </motion.span>
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {canBuy ? (
                <Button className="flex-1" onClick={onAdd}>
                  {already ? (
                    <>
                      <Check className="h-4 w-4" /> In your cart — view
                    </>
                  ) : (
                    <>Add to cart · {money(price)}</>
                  )}
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => openInquiry(art)}>
                  {art.availability === 'reserved' ? 'Join the waiting list' : 'Commission a similar work'}
                </Button>
              )}
              <Button variant="ghost" onClick={() => openInquiry(art)}>
                Inquire
              </Button>
            </div>
            <p className="mt-4 text-[0.75rem] text-mute">Free returns within 14 days · Certificate of authenticity · Insured shipping worldwide</p>

            {/* Details */}
            <dl className="mt-10 grid grid-cols-[8rem_1fr] gap-y-3 border-t border-line pt-8 text-[0.875rem]">
              <dt className="text-mute">Dimensions</dt>
              <dd>
                {d.cm} <span className="text-mute">({d.in})</span>
              </dd>
              <dt className="text-mute">Medium</dt>
              <dd>{art.medium}</dd>
              <dt className="text-mute">Materials</dt>
              <dd className="text-ink-soft">{art.materials}</dd>
              <dt className="text-mute">Year</dt>
              <dd>{art.year}</dd>
              <dt className="text-mute">Framing</dt>
              <dd>{{ gilt: 'Hand-gilded hardwood', oak: 'Natural oak', walnut: 'Solid walnut', black: 'Black-stained ash', white: 'White-limed ash' }[art.frame]} frame, included</dd>
              <dt className="text-mute">Signed</dt>
              <dd>Signed and dated on reverse</dd>
            </dl>

            <div className="mt-10 border-t border-line">
              <Accordion title="The story" defaultOpen>
                {art.story.map((p, i) => (
                  <p key={i} className="mb-4 leading-[1.75] text-ink-soft last:mb-0">
                    {p}
                  </p>
                ))}
              </Accordion>
              <Accordion title="Shipping & delivery">
                <p className="leading-relaxed text-ink-soft">
                  Originals are crated and shipped by insured fine-art courier, or delivered and hung by white-glove
                  service in selected cities. Prints ship flat in archival packaging within 5 working days.
                </p>
              </Accordion>
              <Accordion title="Care & authenticity">
                <p className="leading-relaxed text-ink-soft">
                  Each original comes with a signed certificate of authenticity and care notes. Hang away from direct
                  sunlight and radiators; dust gently with a soft, dry brush.
                </p>
              </Accordion>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Prev / next */}
      <nav className="mx-auto mt-24 grid max-w-[1600px] grid-cols-2 border-y border-line md:mt-32" aria-label="More works">
        {[
          { a: prev, dir: 'Previous', icon: ArrowLeft },
          { a: next, dir: 'Next', icon: ArrowRight },
        ].map(({ a, dir, icon: Icon }, i) => (
          <a key={dir} href={workHref(a.slug)} className={`group flex items-center gap-5 px-5 py-8 transition-colors hover:bg-paper md:px-10 ${i ? 'flex-row-reverse border-l border-line text-right' : ''}`}>
            <Icon className="h-5 w-5 shrink-0 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.2} />
            <img src={a.thumb} alt="" className="hidden h-16 w-16 object-cover sm:block" loading="lazy" />
            <span className="min-w-0">
              <span className="eyebrow block">{dir}</span>
              <span className="mt-1 block truncate font-display text-xl italic md:text-2xl">{a.title}</span>
            </span>
          </a>
        ))}
      </nav>

      {/* Related */}
      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32" aria-label="Related works">
        <h2 className="display text-[clamp(2.25rem,4vw,3.5rem)]">
          You may <span className="italic">also love</span>
        </h2>
        <div className="mt-12 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {relatedTo(art).map((r, i) => (
            <ArtworkCard key={r.id} art={r} index={i} />
          ))}
        </div>
      </section>

      <Lightbox art={art} open={zoom} onClose={() => setZoom(false)} />
    </article>
  )
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="font-display text-[1.375rem]">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} strokeWidth={1.4} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-6 text-[0.9375rem]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Shows the work at true scale above a 210 cm sofa. */
function RoomView({ art }: { art: Artwork }) {
  const ref = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const WALL_CM = 360
  const px = (cm: number) => (cm / WALL_CM) * W
  const FRAME_CM = 4
  const sofaH = px(80)
  const hangGap = px(22) // gap between sofa back and frame
  return (
    <motion.div
      ref={ref}
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      {W > 0 && (
        <>
          <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: `calc(22% + ${sofaH + hangGap}px)`, width: px(art.widthCm + FRAME_CM * 2) }}>
            <FramedArtwork art={art} frameWidth={Math.max(3, px(FRAME_CM))} matWidth={art.frame === 'white' ? px(6) : 0} />
          </div>
          {/* sofa, drawn to scale (210 cm × 80 cm) */}
          <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2" style={{ width: px(210), height: sofaH }} aria-hidden>
            <div className="absolute inset-x-[2%] top-0 h-[55%] rounded-t-[10px] bg-[#cfc3ae] shadow-[inset_0_-8px_14px_rgba(0,0,0,.06)]" />
            <div className="absolute inset-x-0 top-[42%] h-[38%] rounded-[10px] bg-[#c6b9a2] shadow-[0_18px_30px_-12px_rgba(40,30,20,.35)]" />
            <div className="absolute top-[30%] left-0 h-[50%] w-[7%] rounded-[10px] bg-[#bfb19a]" />
            <div className="absolute top-[30%] right-0 h-[50%] w-[7%] rounded-[10px] bg-[#bfb19a]" />
            <div className="absolute bottom-0 left-[8%] h-[20%] w-[1.5%] bg-[#5a4636]" />
            <div className="absolute right-[8%] bottom-0 h-[20%] w-[1.5%] bg-[#5a4636]" />
          </div>
        </>
      )}
      <p className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-ivory/70 px-3 py-1.5 text-[0.6875rem] text-ink-soft backdrop-blur">
        <Ruler className="h-3 w-3" /> To scale · sofa 210 cm wide
      </p>
    </motion.div>
  )
}

function Lightbox({ art, open, onClose }: { art: Artwork; open: boolean; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState('50% 50%')
  const close = useCallback(() => {
    setScale(1)
    onClose()
  }, [onClose])
  useScrollLock(open)
  useEscape(close, open)
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] flex items-center justify-center bg-[#151412]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`${art.title} full view`}>
          <div
            className={`relative h-full w-full overflow-hidden ${scale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
              setScale((s) => (s > 1 ? 1 : 2.4))
            }}
            onPointerMove={(e) => {
              if (scale === 1 || e.pointerType !== 'mouse') return
              const r = e.currentTarget.getBoundingClientRect()
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
            }}
          >
            <motion.img
              src={art.image}
              alt={art.title}
              className="absolute inset-0 m-auto max-h-[88svh] max-w-[92vw] object-contain"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale, opacity: 1 }}
              style={{ transformOrigin: origin }}
              transition={{ type: 'spring', stiffness: 160, damping: 24 }}
            />
          </div>
          <div className="absolute top-0 inset-x-0 flex items-center justify-between p-5 text-ivory">
            <p className="font-display text-xl italic">{art.title}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setScale((s) => Math.max(1, s - 0.8))} className="grid h-10 w-10 place-items-center rounded-full bg-ivory/10 hover:bg-ivory/20" aria-label="Zoom out">
                <Minus className="h-4 w-4" />
              </button>
              <button onClick={() => setScale((s) => Math.min(4, s + 0.8))} className="grid h-10 w-10 place-items-center rounded-full bg-ivory/10 hover:bg-ivory/20" aria-label="Zoom in">
                <Plus className="h-4 w-4" />
              </button>
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-ivory/10 hover:bg-ivory/20" aria-label="Close full view" autoFocus>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="absolute bottom-5 text-[0.75rem] text-ivory/50">Click to zoom · move to explore · Esc to close</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
