import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { artist } from '../data/artist'
import { useEscape, useScrollLock } from '../lib/hooks'
import { useShop } from '../store/cart'
import { Button } from './ui'

/** Purchase / commission inquiry. Wire `send` to Formspree, Resend or your API. */
export function InquiryModal() {
  const { inquiry, closeInquiry } = useShop()
  const open = inquiry !== null
  const art = inquiry && inquiry !== 'general' ? inquiry : null
  const [form, setForm] = useState({ name: '', email: '', topic: 'purchase', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const close = useCallback(() => closeInquiry(), [closeInquiry])
  useScrollLock(open)
  useEscape(close, open)

  useEffect(() => {
    if (!open) return
    setState('idle')
    setErrors({})
    setForm((f) => ({
      ...f,
      topic: art ? 'purchase' : 'commission',
      message: art
        ? `Hello ${artist.firstName}, I'm interested in “${art.title}” (${art.year}). Could you tell me more about ${art.availability === 'sold' ? 'similar available works or a commission' : 'shipping and framing'}?`
        : '',
    }))
  }, [open, art])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const err: Record<string, string> = {}
    if (!form.name.trim()) err.name = 'Please add your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Please enter a valid email.'
    if (form.message.trim().length < 10) err.message = 'A few more words, please.'
    setErrors(err)
    if (Object.keys(err).length) return
    setState('sending')
    setTimeout(() => setState('done'), 1100)
  }

  const field = 'w-full border-b border-ink/20 bg-transparent py-3 text-[0.9375rem] transition-colors placeholder:text-mute focus:border-ink focus:outline-none'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="inq-title">
          <motion.div className="absolute inset-0 bg-ink/35 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto bg-ivory p-7 sm:p-10"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <button onClick={close} className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            {state === 'done' ? (
              <div className="py-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-ivory">
                  <Check className="h-6 w-6" />
                </motion.div>
                <p className="display mt-8 text-4xl italic">Thank you, {form.name.split(' ')[0]}.</p>
                <p className="mx-auto mt-4 max-w-sm text-sm text-ink-soft">
                  {artist.firstName} usually replies within two working days.
                  <span className="mt-2 block text-[0.75rem] text-mute">Demo mode: this message was not actually sent.</span>
                </p>
                <Button variant="ghost" className="mt-8" onClick={close}>
                  Back to the gallery
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className="eyebrow">{art ? 'Purchase inquiry' : 'Get in touch'}</p>
                <h2 id="inq-title" className="display mt-3 text-[2.5rem]">
                  {art ? (
                    <>
                      About <span className="italic">{art.title}</span>
                    </>
                  ) : (
                    <>
                      Write to <span className="italic">the studio</span>
                    </>
                  )}
                </h2>
                {art && (
                  <div className="mt-6 flex items-center gap-4 bg-paper p-3">
                    <img src={art.thumb} alt="" className="h-14 w-14 object-cover" />
                    <p className="text-[0.8125rem] text-ink-soft">
                      {art.medium}, {art.year} · {art.widthCm} × {art.heightCm} cm
                    </p>
                  </div>
                )}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Name</span>
                    <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" aria-invalid={!!errors.name} />
                    {errors.name && <span className="mt-1 block text-[0.75rem] text-clay">{errors.name}</span>}
                  </label>
                  <label className="block">
                    <span className="eyebrow">Email</span>
                    <input type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" aria-invalid={!!errors.email} />
                    {errors.email && <span className="mt-1 block text-[0.75rem] text-clay">{errors.email}</span>}
                  </label>
                </div>
                <fieldset className="mt-6">
                  <legend className="eyebrow">I’d like to talk about</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ['purchase', 'Buying a work'],
                      ['commission', 'A commission'],
                      ['visit', 'A studio visit'],
                      ['other', 'Something else'],
                    ].map(([v, l]) => (
                      <label key={v} className={`cursor-pointer rounded-full border px-4 py-2 text-[0.8125rem] transition-colors ${form.topic === v ? 'border-ink bg-ink text-ivory' : 'border-ink/20 hover:border-ink/50'}`}>
                        <input type="radio" name="topic" value={v} checked={form.topic === v} onChange={() => setForm({ ...form, topic: v })} className="sr-only" />
                        {l}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="mt-6 block">
                  <span className="eyebrow">Message</span>
                  <textarea rows={4} className={`${field} resize-none`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errors.message} />
                  {errors.message && <span className="mt-1 block text-[0.75rem] text-clay">{errors.message}</span>}
                </label>
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[0.75rem] text-mute">Or email {artist.contact.email}</p>
                  <Button type="submit" disabled={state === 'sending'}>
                    {state === 'sending' ? 'Sending…' : 'Send inquiry'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function Toast() {
  const { toast, setDrawerOpen } = useShop()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="pointer-events-auto flex items-center gap-4 rounded-full bg-ink/90 py-2 pr-2 pl-5 text-sm text-ivory shadow-xl backdrop-blur-md"
          >
            <Check className="h-4 w-4 text-sage" />
            {toast.message}
            <button onClick={() => setDrawerOpen(true)} className="rounded-full bg-ivory px-4 py-1.5 text-[0.75rem] text-ink">
              View cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Opening curtain — holds until fonts and the hero painting are ready (max 2.2s). */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [out, setOut] = useState(false)
  useEffect(() => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      setOut(true)
      setTimeout(onDone, 900)
    }
    const img = new Image()
    img.src = 'artworks/blue-hour.webp'
    Promise.all([document.fonts?.ready, img.decode?.().catch(() => {})]).then(() => setTimeout(finish, 650))
    const cap = setTimeout(finish, 2200)
    return () => clearTimeout(cap)
  }, [onDone])
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink text-ivory"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={{ clipPath: out ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      aria-hidden
    >
      <div className="overflow-hidden">
        <motion.p
          className="display text-[clamp(2.5rem,7vw,5rem)]"
          initial={{ y: '100%' }}
          animate={{ y: out ? '-100%' : '0%' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {artist.firstName} <span className="italic">{artist.lastName}</span>
        </motion.p>
      </div>
      <motion.div className="absolute bottom-10 h-px w-32 origin-left bg-ivory/40" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
    </motion.div>
  )
}
