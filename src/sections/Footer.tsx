import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { goToSection } from '../components/Nav'
import { InstagramIcon } from '../components/ui'
import { artist } from '../data/artist'
import { useShop } from '../store/cart'

export function Footer() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const { openInquiry } = useShop()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setState('error')
      return
    }
    setState('sending')
    // TODO: connect to Mailchimp / Buttondown / ConvertKit
    setTimeout(() => setState('done'), 900)
  }

  return (
    <footer id="contact" className="relative scroll-mt-16 overflow-hidden bg-ink text-ivory" aria-label="Contact and footer">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 pb-10 md:px-10 md:pt-32">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow !text-ivory/50">Studio letters</p>
            <h2 className="display mt-6 text-[clamp(2.6rem,5.6vw,5.5rem)]">
              New work, <span className="italic">first.</span>
            </h2>
            <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ivory/60">
              A short letter, four times a year: new paintings before they’re public, studio notes and exhibition
              openings. Subscribers get a 48-hour preview of every release.
            </p>
            <form onSubmit={submit} className="mt-10 max-w-xl" noValidate>
              <label htmlFor="nl-email" className="sr-only">
                Email address
              </label>
              <div className={`flex items-center border-b transition-colors ${state === 'error' ? 'border-clay-soft' : 'border-ivory/25 focus-within:border-ivory'}`}>
                <input
                  id="nl-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (state !== 'idle') setState('idle')
                  }}
                  placeholder="Your email address"
                  className="w-full bg-transparent py-4 font-display text-2xl text-ivory placeholder:text-ivory/30 focus:outline-none"
                  disabled={state === 'done'}
                  aria-invalid={state === 'error'}
                />
                <button type="submit" disabled={state === 'sending' || state === 'done'} className="group flex shrink-0 items-center gap-2 py-4 pl-4 text-sm" aria-label="Subscribe">
                  <AnimatePresence mode="wait" initial={false}>
                    {state === 'done' ? (
                      <motion.span key="d" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sage">
                        <Check className="h-4 w-4" /> Subscribed
                      </motion.span>
                    ) : (
                      <motion.span key="s" exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                        {state === 'sending' ? 'Joining…' : 'Subscribe'}
                        <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
              <p className="mt-3 h-4 text-[0.75rem] text-ivory/45" role="status">
                {state === 'error' ? 'Please enter a valid email address.' : state === 'done' ? 'Thank you — you’re on the list. (Demo: no email is stored.)' : 'No spam. Unsubscribe any time.'}
              </p>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 text-[0.875rem] lg:col-span-4 lg:col-start-9">
            <div>
              <p className="eyebrow !text-ivory/45">Navigate</p>
              <ul className="mt-5 space-y-3">
                {[
                  ['gallery', 'Gallery'],
                  ['collection', 'Collection'],
                  ['about', 'The Artist'],
                ].map(([id, l]) => (
                  <li key={id}>
                    <button onClick={() => goToSection(id)} className="link-line text-ivory/80 hover:text-ivory">
                      {l}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={() => openInquiry('general')} className="link-line text-ivory/80 hover:text-ivory">
                    Commissions
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow !text-ivory/45">Studio</p>
              <ul className="mt-5 space-y-3 text-ivory/80">
                <li>
                  <a href={`mailto:${artist.contact.email}`} className="link-line flex items-center gap-2 break-all hover:text-ivory">
                    <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.4} /> {artist.contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.4} /> {artist.contact.phone}
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.4} /> {artist.contact.studio}
                </li>
                <li>
                  <a href={artist.contact.instagram} target="_blank" rel="noreferrer" className="link-line flex items-center gap-2 hover:text-ivory">
                    <InstagramIcon className="h-3.5 w-3.5" /> {artist.contact.instagramHandle}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div aria-hidden className="mt-24 select-none overflow-hidden">
          <p className="display text-center text-[clamp(4rem,17vw,17rem)] leading-[0.8] whitespace-nowrap text-ivory/[0.07]">
            {artist.firstName} <span className="italic">{artist.lastName}</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-ivory/10 pt-6 text-[0.75rem] text-ivory/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {artist.name}. All works and images © the artist.</p>
          <p>Demo artwork images are public-domain paintings used as placeholders.</p>
        </div>
      </div>
    </footer>
  )
}
