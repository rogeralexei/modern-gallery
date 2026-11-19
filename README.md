# Elena Ravel — Original Paintings

An immersive gallery and shop for an independent painter, built with Vite, React, TypeScript, Tailwind CSS v4, Motion and React Three Fiber.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in /dist (relative paths, so any static host works)
```

## Replacing the demo content

| What | Where |
| --- | --- |
| Paintings (title, price, size, story, prints, frame) | `src/data/artworks.ts` |
| Artist name, bio, process, exhibitions, contact | `src/data/artist.ts` |
| Images | `public/artworks/<slug>.webp` (~1800px) and `<slug>-sm.webp` (~720px) |
| Portrait | `src/sections/About.tsx`. Look for "Portrait placeholder" |
| Hero painting | `heroArt` in `src/sections/Hero.tsx` |

Set `aspect` on each artwork to the image's width ÷ height. The demo images are public-domain paintings (Monet, Turner, Klee and others) used only as placeholders. The `imageCredit` field shows where each one came from; delete it when you add real work.

## Architecture

```
src/
  data/        artworks.ts, artist.ts: all content
  store/       cart.tsx: cart reducer, drawer, inquiry and toast state (saved in localStorage)
  lib/         router (flat hash routes), payments (provider interface), transition (camera move into a work), hooks
  components/  FramedArtwork (CSS gallery frame), HeroCanvas (Three.js), Coverflow, CartDrawer, Nav, Overlays
  sections/    Hero, GalleryWalk, Statement, Collection, About, Footer
  pages/       ArtworkPage, CheckoutPage
```

- **3D:** Three.js powers only the hero painting (a real moulding, lighting and a cast shadow). It loads lazily and only on desktop pointers. Touch devices get a lightweight CSS version.
- **Gallery wall:** on desktop, vertical scroll drives a horizontal walk along the wall. On touch devices it becomes a native swipe rail with snap points.
- **Collection:** filter, sort, "available only", and a switch between the grid and the infinite 3D carousel (drag, swipe, wheel, arrow keys).
- **Detail:** a framed work with pointer tilt, an "In a room" view drawn to scale beside a 210 cm sofa, a zoomable lightbox, original or limited-print choice, and related works.
- **Commerce:** originals are capped at quantity 1 and prints at the editions remaining. There's a cart drawer and a three-step checkout (details, delivery, payment) with a simulated payment.

## Going live with payments

`src/lib/payments.ts` defines `PaymentProvider`. To accept real payments, implement `createCheckout` so it posts the order to your backend. The backend creates a Stripe Checkout Session, and you redirect to `session.url`. Then set `payments = stripeProvider`. You don't need to change any UI. The newsletter (`Footer.tsx`) and inquiry form (`Overlays.tsx`) are also simulated, with TODOs where a real service connects.
