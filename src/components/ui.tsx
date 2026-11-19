import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import type { Availability } from '../data/artworks'
import { availabilityLabel } from '../lib/format'

const EASE = [0.22, 1, 0.36, 1] as const

/** Fades & lifts children into view once, when scrolled to. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'p' | 'span'
}) {
  const M = motion[as] as typeof motion.div
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      {children}
    </M>
  )
}

/** Splits a heading into lines that rise from a mask. */
export function MaskLines({ lines, className = '', delay = 0, inView = false }: { lines: ReactNode[]; className?: string; delay?: number; inView?: boolean }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={{ y: '110%' }}
            {...(inView
              ? { whileInView: { y: '0%' }, viewport: { once: true } }
              : { animate: { y: '0%' } })}
            transition={{ duration: 1.1, delay: delay + i * 0.09, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

type BtnProps = HTMLMotionProps<'button'> & { variant?: 'solid' | 'ghost' | 'light'; children: ReactNode; magnetic?: boolean }

/** Primary button with a subtle magnetic pull and fill sweep. */
export function Button({ variant = 'solid', children, className = '', magnetic = true, ...rest }: BtnProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 15 })
  const sy = useSpring(y, { stiffness: 220, damping: 15 })
  const styles = {
    solid: 'bg-ink text-ivory hover:text-ink before:bg-paper',
    ghost: 'border border-ink/25 text-ink hover:text-ivory before:bg-ink',
    light: 'bg-ivory text-ink hover:text-ivory before:bg-clay',
  }[variant]
  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (!magnetic || e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.18)
        y.set((e.clientY - r.top - r.height / 2) * 0.3)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      whileTap={{ scale: 0.97 }}
      className={`group relative isolate inline-flex items-center justify-center gap-3 overflow-hidden px-7 py-4 text-[0.8125rem] font-medium tracking-[0.06em] transition-colors duration-500 before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(.22,1,.36,1)] hover:before:scale-y-100 disabled:pointer-events-none disabled:opacity-40 ${styles} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export function AvailabilityDot({ status, className = '' }: { status: Availability; className?: string }) {
  const color = { available: 'bg-sage', reserved: 'bg-clay-soft', sold: 'bg-clay' }[status]
  return (
    <span className={`inline-flex items-center gap-2 text-[0.75rem] tracking-wide text-ink-soft ${className}`}>
      <span className={`relative h-1.5 w-1.5 rounded-full ${color}`}>
        {status === 'available' && <span className={`absolute inset-0 animate-ping rounded-full ${color} opacity-60`} />}
      </span>
      {availabilityLabel[status]}
    </span>
  )
}

export function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-sm italic text-mute">{index}</span>
      <span className="h-px w-10 bg-ink/20" />
      <span className="eyebrow">{children}</span>
    </div>
  )
}
