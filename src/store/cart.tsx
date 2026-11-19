import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { artworks, type Artwork } from '../data/artworks'

export type Variant = 'original' | 'print'

export interface CartLine {
  artworkId: string
  variant: Variant
  qty: number
}

type Action =
  | { type: 'add'; artworkId: string; variant: Variant; qty?: number }
  | { type: 'remove'; artworkId: string; variant: Variant }
  | { type: 'setQty'; artworkId: string; variant: Variant; qty: number }
  | { type: 'clear' }

const STORAGE_KEY = 'er-cart-v1'

/** Originals are one-of-a-kind; prints are capped by remaining edition. */
export const maxQty = (art: Artwork, variant: Variant) =>
  variant === 'original' ? 1 : Math.min(art.print?.remaining ?? 0, 5)

const find = (id: string) => artworks.find((a) => a.id === id)

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const art = find(action.artworkId)
      if (!art) return state
      const cap = maxQty(art, action.variant)
      const existing = state.find((l) => l.artworkId === action.artworkId && l.variant === action.variant)
      if (existing) {
        return state.map((l) =>
          l === existing ? { ...l, qty: Math.min(cap, l.qty + (action.qty ?? 1)) } : l,
        )
      }
      return [...state, { artworkId: action.artworkId, variant: action.variant, qty: Math.min(cap, action.qty ?? 1) }]
    }
    case 'remove':
      return state.filter((l) => !(l.artworkId === action.artworkId && l.variant === action.variant))
    case 'setQty': {
      const art = find(action.artworkId)
      if (!art) return state
      const qty = Math.max(1, Math.min(maxQty(art, action.variant), action.qty))
      return state.map((l) => (l.artworkId === action.artworkId && l.variant === action.variant ? { ...l, qty } : l))
    }
    case 'clear':
      return []
  }
}

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    return parsed.filter((l) => {
      const art = find(l.artworkId)
      return art && art.availability === 'available' ? true : art && l.variant === 'print'
    })
  } catch {
    return []
  }
}

export const unitPrice = (art: Artwork, variant: Variant) =>
  variant === 'original' ? art.price : (art.print?.price ?? 0)

interface Toast {
  id: number
  message: string
}

interface ShopContext {
  lines: (CartLine & { art: Artwork; unit: number })[]
  count: number
  subtotal: number
  add: (artworkId: string, variant: Variant) => void
  remove: (artworkId: string, variant: Variant) => void
  setQty: (artworkId: string, variant: Variant, qty: number) => void
  clear: () => void
  inCart: (artworkId: string, variant: Variant) => boolean
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
  inquiry: Artwork | null | 'general'
  openInquiry: (art: Artwork | 'general') => void
  closeInquiry: () => void
  toast: Toast | null
  notify: (message: string) => void
}

const Ctx = createContext<ShopContext | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inquiry, setInquiry] = useState<Artwork | null | 'general'>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable — cart still works in memory */
    }
  }, [state])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const notify = useCallback((message: string) => setToast({ id: Date.now(), message }), [])

  const value = useMemo<ShopContext>(() => {
    const lines = state
      .map((l) => {
        const art = find(l.artworkId)
        return art ? { ...l, art, unit: unitPrice(art, l.variant) } : null
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.unit, 0),
      add: (artworkId, variant) => dispatch({ type: 'add', artworkId, variant }),
      remove: (artworkId, variant) => dispatch({ type: 'remove', artworkId, variant }),
      setQty: (artworkId, variant, qty) => dispatch({ type: 'setQty', artworkId, variant, qty }),
      clear: () => dispatch({ type: 'clear' }),
      inCart: (artworkId, variant) => state.some((l) => l.artworkId === artworkId && l.variant === variant),
      drawerOpen,
      setDrawerOpen,
      inquiry,
      openInquiry: (a) => setInquiry(a),
      closeInquiry: () => setInquiry(null),
      toast,
      notify,
    }
  }, [state, drawerOpen, inquiry, toast, notify])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>')
  return ctx
}
