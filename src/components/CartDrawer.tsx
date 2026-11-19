import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Minus, Plus, X } from 'lucide-react'
import { useCallback } from 'react'
import { money } from '../lib/format'
import { useEscape, useScrollLock } from '../lib/hooks'
import { navigate, workHref } from '../lib/router'
import { maxQty, useShop } from '../store/cart'
import { Button } from './ui'

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, lines, subtotal, remove, setQty, count, openInquiry } = useShop()
  const close = useCallback(() => setDrawerOpen(false), [setDrawerOpen])
  useScrollLock(drawerOpen)
  useEscape(close, drawerOpen)

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
          <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            className="absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col bg-ivory shadow-[-30px_0_80px_-30px_rgba(31,29,26,.35)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="font-display text-2xl">
                Your selection <span className="text-base text-mute">({count})</span>
              </p>
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-ink/5" aria-label="Close cart" autoFocus>
                <X className="h-4 w-4" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                <div className="frame frame--oak mb-8 w-28" style={{ '--frame-w': '6px' } as React.CSSProperties}>
                  <div className="aspect-[4/5] bg-paper" />
                </div>
                <p className="display text-3xl italic">An empty wall</p>
                <p className="mt-3 text-sm text-ink-soft">Nothing in your selection yet. The collection is a good place to start.</p>
                <button
                  onClick={() => {
                    close()
                    setTimeout(() => navigate('collection'), 300)
                  }}
                  className="link-line mt-6 inline-flex items-center gap-2 text-sm"
                >
                  Browse the collection <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => {
                      const cap = maxQty(l.art, l.variant)
                      return (
                        <motion.li
                          key={l.art.id + l.variant}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="flex gap-5 overflow-hidden py-6"
                        >
                          <a
                            href={workHref(l.art.slug)}
                            onClick={close}
                            className={`frame frame--${l.art.frame} block w-24 shrink-0 self-start`}
                            style={{ '--frame-w': '5px' } as React.CSSProperties}
                          >
                            <img src={l.art.thumb} alt={l.art.title} className="w-full object-cover" style={{ aspectRatio: l.art.aspect }} />
                          </a>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-display text-xl leading-tight italic">{l.art.title}</p>
                                <p className="mt-1 text-[0.75rem] text-ink-soft">
                                  {l.variant === 'original' ? `Original · ${l.art.medium}` : `Giclée print · ${l.art.print?.size}`}
                                </p>
                              </div>
                              <button onClick={() => remove(l.art.id, l.variant)} className="-mt-1 -mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-ink/5 hover:text-ink" aria-label={`Remove ${l.art.title}`}>
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-4">
                              {l.variant === 'print' ? (
                                <div className="flex items-center rounded-full border border-ink/15">
                                  <button onClick={() => setQty(l.art.id, l.variant, l.qty - 1)} disabled={l.qty <= 1} className="grid h-8 w-8 place-items-center disabled:opacity-30" aria-label="Decrease quantity">
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{l.qty}</span>
                                  <button onClick={() => setQty(l.art.id, l.variant, l.qty + 1)} disabled={l.qty >= cap} className="grid h-8 w-8 place-items-center disabled:opacity-30" aria-label="Increase quantity">
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="eyebrow !text-[0.625rem]">One of a kind</span>
                              )}
                              <span className="tabular-nums">{money(l.unit * l.qty)}</span>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>

                <footer className="border-t border-line bg-paper/50 px-6 py-6">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">Subtotal</dt>
                      <dd className="tabular-nums">{money(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">Shipping</dt>
                      <dd className="text-ink-soft">Calculated at checkout</dd>
                    </div>
                  </dl>
                  <Button
                    className="mt-6 w-full"
                    onClick={() => {
                      close()
                      navigate('checkout')
                    }}
                  >
                    Proceed to checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button onClick={() => { close(); openInquiry('general') }} className="link-line mx-auto mt-4 block text-[0.75rem] text-ink-soft">
                    Prefer to talk first? Send a purchase inquiry
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
