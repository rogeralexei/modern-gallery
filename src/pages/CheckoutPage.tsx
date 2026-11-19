import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Check, CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui'
import { money } from '../lib/format'
import { payments, shippingMethods, type CustomerDetails, type ShippingMethod } from '../lib/payments'
import { navigate } from '../lib/router'
import { useShop, type CartLine } from '../store/cart'

type Step = 0 | 1 | 2
const steps = ['Details', 'Delivery', 'Payment']

const emptyCustomer: CustomerDetails = { email: '', firstName: '', lastName: '', address: '', city: '', postcode: '', country: 'Portugal', phone: '', notes: '' }

export function CheckoutPage() {
  const { lines, subtotal, clear } = useShop()
  const [step, setStep] = useState<Step>(0)
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer)
  const [shipping, setShipping] = useState<ShippingMethod['id']>('courier')
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvc: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'paying' | 'done' | 'failed'>('idle')
  const [order, setOrder] = useState<{ id: string; lines: typeof lines; total: number } | null>(null)

  useEffect(() => window.scrollTo(0, 0), [step])
  useEffect(() => {
    document.title = 'Checkout — Elena Ravel'
  }, [])

  const hasOriginal = lines.some((l) => l.variant === 'original')
  const ship = shippingMethods.find((s) => s.id === shipping)!
  const shippingCost = hasOriginal ? ship.price : ship.id === 'collect' ? 0 : 35
  const total = subtotal + shippingCost

  const validate = (s: Step) => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!/^\S+@\S+\.\S+$/.test(customer.email)) e.email = 'Enter a valid email'
      if (!customer.firstName.trim()) e.firstName = 'Required'
      if (!customer.lastName.trim()) e.lastName = 'Required'
    }
    if (s === 1 && shipping !== 'collect') {
      if (!customer.address.trim()) e.address = 'Required'
      if (!customer.city.trim()) e.city = 'Required'
      if (!customer.postcode.trim()) e.postcode = 'Required'
    }
    if (s === 2) {
      if (!card.name.trim()) e.cardName = 'Required'
      if (card.number.replace(/\s/g, '').length < 15) e.number = 'Card number looks short'
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(card.exp)) e.exp = 'MM / YY'
      if (card.cvc.length < 3) e.cvc = '3–4 digits'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = async () => {
    if (!validate(step)) return
    if (step < 2) {
      setStep((step + 1) as Step)
      return
    }
    setStatus('paying')
    const res = await payments.createCheckout({
      lines: lines.map(({ artworkId, variant, qty }): CartLine => ({ artworkId, variant, qty })),
      customer,
      shippingMethod: shipping,
      totals: { subtotal, shipping: shippingCost, total },
    })
    if (res.ok && res.orderId) {
      setOrder({ id: res.orderId, lines, total })
      setStatus('done')
      clear()
    } else {
      setStatus('failed')
    }
  }

  if (status === 'done' && order) return <Confirmation order={order} email={customer.email} />

  if (!lines.length) {
    return (
      <div className="flex min-h-[80svh] flex-col items-center justify-center px-6 pt-24 text-center">
        <p className="display text-5xl italic">Your selection is empty.</p>
        <p className="mt-4 text-ink-soft">Add a painting or print to begin checkout.</p>
        <Button className="mt-8" onClick={() => navigate('collection')}>
          Browse the collection
        </Button>
      </div>
    )
  }

  const input = (key: keyof CustomerDetails, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label} error={errors[key]}>
      <input
        className={fieldCls(!!errors[key])}
        value={customer[key] ?? ''}
        onChange={(e) => setCustomer({ ...customer, [key]: e.target.value })}
        aria-invalid={!!errors[key]}
        {...props}
      />
    </Field>
  )

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-24 pb-24 md:px-10 md:pt-32">
      <button onClick={() => (step ? setStep((step - 1) as Step) : history.back())} className="group flex items-center gap-2 text-[0.8125rem] text-ink-soft hover:text-ink">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.4} /> {step ? `Back to ${steps[step - 1].toLowerCase()}` : 'Continue browsing'}
      </button>

      <div className="mt-8 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="display text-[clamp(2.75rem,5vw,4.5rem)]">
            Check<span className="italic">out</span>
          </h1>

          {/* Stepper */}
          <ol className="mt-10 flex items-center gap-3" aria-label="Checkout progress">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[0.75rem] transition-colors ${i < step ? 'border-sage bg-sage text-ivory' : i === step ? 'border-ink bg-ink text-ivory' : 'border-ink/20 text-mute'}`} aria-current={i === step ? 'step' : undefined}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`text-[0.8125rem] ${i === step ? 'text-ink' : 'text-mute'}`}>{s}</span>
                {i < steps.length - 1 && <span className="h-px flex-1 bg-ink/12" />}
              </li>
            ))}
          </ol>

          <form
            className="mt-12"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              next()
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                {step === 0 && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">{input('email', 'Email', { type: 'email', autoComplete: 'email' })}</div>
                    {input('firstName', 'First name', { autoComplete: 'given-name' })}
                    {input('lastName', 'Last name', { autoComplete: 'family-name' })}
                    <div className="sm:col-span-2">{input('phone', 'Phone (for the courier)', { type: 'tel', autoComplete: 'tel' })}</div>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <fieldset>
                      <legend className="eyebrow mb-4">Delivery method</legend>
                      <div className="space-y-3">
                        {shippingMethods.map((m) => {
                          const cost = hasOriginal ? m.price : m.id === 'collect' ? 0 : 35
                          return (
                            <label key={m.id} className={`flex cursor-pointer items-center justify-between gap-4 border p-5 transition-colors ${shipping === m.id ? 'border-ink bg-paper/60' : 'border-ink/15 hover:border-ink/40'}`}>
                              <span className="flex items-center gap-4">
                                <span className={`grid h-4 w-4 place-items-center rounded-full border ${shipping === m.id ? 'border-ink' : 'border-ink/30'}`}>
                                  {shipping === m.id && <span className="h-2 w-2 rounded-full bg-ink" />}
                                </span>
                                <input type="radio" className="sr-only" checked={shipping === m.id} onChange={() => setShipping(m.id)} name="ship" />
                                <span>
                                  <span className="block text-sm font-medium">{m.label}</span>
                                  <span className="block text-[0.75rem] text-ink-soft">{hasOriginal || m.id === 'collect' ? m.detail : 'Prints ship flat, tracked, 3–6 days'}</span>
                                </span>
                              </span>
                              <span className="text-sm tabular-nums">{cost ? money(cost) : 'Free'}</span>
                            </label>
                          )
                        })}
                      </div>
                    </fieldset>
                    {shipping !== 'collect' && (
                      <div className="mt-10 grid gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">{input('address', 'Street address', { autoComplete: 'street-address' })}</div>
                        {input('city', 'City', { autoComplete: 'address-level2' })}
                        {input('postcode', 'Postcode', { autoComplete: 'postal-code' })}
                        <div className="sm:col-span-2">
                          <Field label="Country">
                            <select className={fieldCls(false)} value={customer.country} onChange={(e) => setCustomer({ ...customer, country: e.target.value })} autoComplete="country-name">
                              {['Portugal', 'Spain', 'France', 'United Kingdom', 'Germany', 'Netherlands', 'Italy', 'United States', 'Canada', 'Panama', 'Other'].map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    )}
                    <div className="mt-6">
                      <Field label="Notes for the studio (optional)">
                        <textarea rows={2} className={`${fieldCls(false)} resize-none`} value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} placeholder="Gift message, delivery access, framing questions…" />
                      </Field>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <div className="flex items-center gap-3 bg-paper p-4 text-[0.8125rem] text-ink-soft">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-sage" />
                      Demo checkout — no card is charged and nothing is stored. Use any test number, e.g. 4242 4242 4242 4242.
                    </div>
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field label="Name on card" error={errors.cardName}>
                          <input className={fieldCls(!!errors.cardName)} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="cc-name" />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Card number" error={errors.number}>
                          <div className="relative">
                            <input
                              className={`${fieldCls(!!errors.number)} pr-10 tabular-nums`}
                              inputMode="numeric"
                              autoComplete="cc-number"
                              value={card.number}
                              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() })}
                              placeholder="1234 1234 1234 1234"
                            />
                            <CreditCard className="absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 text-mute" strokeWidth={1.4} />
                          </div>
                        </Field>
                      </div>
                      <Field label="Expiry" error={errors.exp}>
                        <input
                          className={fieldCls(!!errors.exp)}
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM / YY"
                          value={card.exp}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                            setCard({ ...card, exp: v.length > 2 ? `${v.slice(0, 2)} / ${v.slice(2)}` : v })
                          }}
                        />
                      </Field>
                      <Field label="CVC" error={errors.cvc}>
                        <input className={fieldCls(!!errors.cvc)} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                      </Field>
                    </div>
                    {status === 'failed' && <p className="mt-6 text-sm text-clay">Payment could not be completed. Please try again.</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-[0.75rem] text-mute">
                <Lock className="h-3.5 w-3.5" /> Secured checkout · {payments.name}
              </p>
              <Button type="submit" disabled={status === 'paying'} className="sm:min-w-[260px]">
                {status === 'paying' ? (
                  <span className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" /> Processing…
                  </span>
                ) : step < 2 ? (
                  `Continue to ${steps[step + 1].toLowerCase()}`
                ) : (
                  `Pay ${money(total)}`
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5">
          <div className="sticky top-28 bg-paper/70 p-6 md:p-8">
            <p className="font-display text-2xl">Order summary</p>
            <ul className="mt-6 divide-y divide-line">
              {lines.map((l) => (
                <li key={l.art.id + l.variant} className="flex items-center gap-4 py-4">
                  <div className={`frame frame--${l.art.frame} w-16 shrink-0`} style={{ '--frame-w': '4px' } as React.CSSProperties}>
                    <img src={l.art.thumb} alt="" className="w-full object-cover" style={{ aspectRatio: l.art.aspect }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg italic">{l.art.title}</p>
                    <p className="text-[0.75rem] text-ink-soft">
                      {l.variant === 'original' ? 'Original' : `Print · ${l.art.print?.size}`}
                      {l.qty > 1 && ` × ${l.qty}`}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">{money(l.unit * l.qty)}</span>
                </li>
              ))}
            </ul>
            <Totals subtotal={subtotal} shipping={step >= 1 ? shippingCost : null} total={step >= 1 ? total : subtotal} />
            <ul className="mt-8 space-y-2 border-t border-line pt-6 text-[0.75rem] text-ink-soft">
              <li>✓ Certificate of authenticity with every original</li>
              <li>✓ 14-day returns on all works</li>
              <li>✓ Fully insured, door-to-door</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Totals({ subtotal, shipping, total }: { subtotal: number; shipping: number | null; total: number }) {
  return (
    <dl className="mt-4 space-y-2 border-t border-line pt-5 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="tabular-nums">{money(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Delivery</dt>
        <dd className="tabular-nums">{shipping === null ? 'Next step' : shipping ? money(shipping) : 'Free'}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Taxes</dt>
        <dd className="text-ink-soft">Included where applicable</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <dt className="font-display text-xl">Total</dt>
        <dd className="text-xl tabular-nums">{money(total)}</dd>
      </div>
    </dl>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 block text-[0.75rem] text-clay">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}

const fieldCls = (err: boolean) =>
  `w-full border-b bg-transparent py-3 text-[1rem] transition-colors placeholder:text-mute/70 focus:outline-none ${err ? 'border-clay' : 'border-ink/20 focus:border-ink'}`

function Confirmation({ order, email }: { order: { id: string; lines: { art: { id: string; title: string; thumb: string; frame: string; aspect: number }; variant: string }[]; total: number }; email: string }) {
  const first = useMemo(() => order.lines[0]?.art, [order])
  return (
    <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      {first && (
        <motion.div initial={{ opacity: 0, y: 30, rotateX: 20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className={`frame frame--${first.frame} w-48`} style={{ '--frame-w': '8px', transformPerspective: 800 } as React.CSSProperties}>
          <img src={first.thumb} alt="" className="w-full object-cover" style={{ aspectRatio: first.aspect }} />
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }}>
        <p className="eyebrow mt-12">Order {order.id}</p>
        <h1 className="display mt-4 text-[clamp(2.75rem,6vw,5rem)]">
          It’s <span className="italic">yours.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-ink-soft">
          Thank you for collecting. A confirmation would be sent to <span className="text-ink">{email}</span>, and Elena will be in touch personally about delivery.
        </p>
        <p className="mt-3 text-[0.75rem] text-mute">Demo mode: no payment was taken and no email was sent.</p>
        <p className="mt-8 text-lg tabular-nums">Total {money(order.total)}</p>
        <Button className="mt-10" onClick={() => navigate('')}>
          Return to the gallery
        </Button>
      </motion.div>
    </div>
  )
}
