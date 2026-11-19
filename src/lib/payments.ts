/**
 * Payment provider abstraction.
 *
 * The UI only talks to `PaymentProvider`. Today `mockProvider` simulates a
 * successful charge. To go live with Stripe, implement `createCheckout` by
 * POSTing the cart to your backend (which creates a Stripe Checkout Session
 * or PaymentIntent) and either redirect to `session.url` or confirm with
 * Stripe Elements. No component needs to change.
 */
import type { CartLine } from '../store/cart'

export interface CustomerDetails {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  postcode: string
  country: string
  phone?: string
  notes?: string
}

export interface OrderRequest {
  lines: CartLine[]
  customer: CustomerDetails
  shippingMethod: ShippingMethod['id']
  totals: { subtotal: number; shipping: number; total: number }
}

export interface OrderResult {
  ok: boolean
  orderId?: string
  error?: string
}

export interface PaymentProvider {
  name: string
  createCheckout(order: OrderRequest): Promise<OrderResult>
}

export interface ShippingMethod {
  id: 'courier' | 'white-glove' | 'collect'
  label: string
  detail: string
  price: number
}

export const shippingMethods: ShippingMethod[] = [
  { id: 'courier', label: 'Insured fine-art courier', detail: 'Crated, tracked, 5–9 working days', price: 180 },
  { id: 'white-glove', label: 'White-glove delivery & hanging', detail: 'Selected cities, scheduled with you', price: 650 },
  { id: 'collect', label: 'Collect from the studio', detail: 'Lisbon, by appointment', price: 0 },
]

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const mockProvider: PaymentProvider = {
  name: 'Demo (no charge)',
  async createCheckout(order) {
    await wait(1600)
    if (!order.lines.length) return { ok: false, error: 'Your cart is empty.' }
    const id = 'ER-' + Math.random().toString(36).slice(2, 8).toUpperCase()
    return { ok: true, orderId: id }
  },
}

/** The active provider — swap for `stripeProvider` when ready. */
export const payments: PaymentProvider = mockProvider
