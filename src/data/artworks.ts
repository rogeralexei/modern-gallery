/**
 * ─────────────────────────────────────────────────────────────────────
 *  ARTWORK CATALOGUE — the single source of truth for every painting.
 *
 *  To swap in real work: drop images into /public/artworks/ (a large
 *  ~1800px `slug.webp` and a ~720px `slug-sm.webp`), then edit the
 *  entries below. Nothing else in the codebase hard-codes artwork data.
 *
 *  Demo images are public-domain paintings used as placeholders only;
 *  `imageCredit` records the source so it can be removed with the demo.
 * ─────────────────────────────────────────────────────────────────────
 */

export type Category = 'Landscapes' | 'Seascapes' | 'Abstractions' | 'Botanicals'
export type Availability = 'available' | 'reserved' | 'sold'
export type FrameStyle = 'oak' | 'walnut' | 'black' | 'white' | 'gilt'

export interface PrintEdition {
  price: number
  size: string
  editionSize: number
  remaining: number
}

export interface Artwork {
  id: string
  slug: string
  title: string
  year: number
  category: Category
  medium: string
  materials: string
  /** Width × height in centimetres (unframed) */
  widthCm: number
  heightCm: number
  price: number
  currency: 'USD'
  availability: Availability
  frame: FrameStyle
  /** Short line used on cards and the gallery */
  excerpt: string
  /** Long-form story behind the painting (paragraphs) */
  story: string[]
  /** Dominant tone, used for ambient backgrounds behind the work */
  tone: string
  image: string
  thumb: string
  /** Natural aspect ratio of the image file (width / height) */
  aspect: number
  featured?: boolean
  print?: PrintEdition
  imageCredit?: string
}

const img = (slug: string) => ({
  image: `artworks/${slug}.webp`,
  thumb: `artworks/${slug}-sm.webp`,
})

export const artworks: Artwork[] = [
  {
    id: 'os-001',
    slug: 'blue-hour',
    title: 'Blue Hour, Upriver',
    year: 2025,
    category: 'Landscapes',
    medium: 'Oil on linen',
    materials: 'Belgian linen, lead-white ground, cold-pressed linseed oil, matte varnish',
    widthCm: 100,
    heightCm: 80,
    price: 6800,
    currency: 'USD',
    availability: 'available',
    frame: 'gilt',
    excerpt: 'The river in the ten minutes before the light gives up.',
    story: [
      'I painted this over eleven evenings from the same bend in the river, arriving each night twenty minutes before dusk. The water only held this colour for a few minutes at a time, so the painting was built in thin, quick layers — each one a single evening.',
      'What interested me was how the trees stop being trees and become reflections of themselves. By the last session I was painting the reflection first and letting the bank find its own edge.',
    ],
    tone: '#5c7aa8',
    ...img('blue-hour'),
    aspect: 1004 / 765,
    featured: true,
    print: { price: 420, size: '60 × 48 cm', editionSize: 50, remaining: 31 },
    imageCredit: 'Placeholder: Claude Monet, public domain',
  },
  {
    id: 'os-002',
    slug: 'ember-tide',
    title: 'Ember Tide',
    year: 2025,
    category: 'Seascapes',
    medium: 'Oil on canvas',
    materials: 'Cotton duck canvas, oil, cold wax, gloss varnish',
    widthCm: 120,
    heightCm: 82,
    price: 8400,
    currency: 'USD',
    availability: 'available',
    frame: 'walnut',
    excerpt: 'A low sun dissolving into the harbour haze.',
    story: [
      'Ember Tide began as a ten-minute sketch on the back of a ferry ticket. The sun was sitting so low over the harbour that the boats looked like they were burning at the edges.',
      'In the studio I kept scraping the sky back with a palette knife until only the warm undertone survived. The vessel is barely there on purpose — it should feel like something remembered rather than seen.',
    ],
    tone: '#b4672f',
    ...img('ember-tide'),
    aspect: 800 / 549,
    featured: true,
    print: { price: 480, size: '70 × 48 cm', editionSize: 50, remaining: 12 },
    imageCredit: 'Placeholder: J. M. W. Turner, public domain',
  },
  {
    id: 'os-003',
    slug: 'weather-study',
    title: 'Weather Study No. 4',
    year: 2024,
    category: 'Seascapes',
    medium: 'Oil on canvas',
    materials: 'Primed linen, oil, turpentine washes, satin varnish',
    widthCm: 92,
    heightCm: 70,
    price: 5600,
    currency: 'USD',
    availability: 'reserved',
    frame: 'black',
    excerpt: 'Snow, smoke and a ship holding its course.',
    story: [
      'The fourth in a series of weather studies painted after a winter crossing. I wanted to paint the feeling of not knowing where the horizon is.',
      'Most of the surface was laid down wet-into-wet in a single afternoon, then left alone. The restraint is the hardest part of these paintings.',
    ],
    tone: '#6e6a5e',
    ...img('weather-study'),
    aspect: 1000 / 762,
    imageCredit: 'Placeholder: J. M. W. Turner, public domain',
  },
  {
    id: 'os-004',
    slug: 'parnassus-light',
    title: 'Parnassus Light',
    year: 2024,
    category: 'Abstractions',
    medium: 'Oil and tempera on board',
    materials: 'Gessoed birch panel, egg tempera, oil glazes',
    widthCm: 80,
    heightCm: 65,
    price: 5200,
    currency: 'USD',
    availability: 'available',
    frame: 'oak',
    excerpt: 'A mountain built from ten thousand points of warmth.',
    story: [
      'I placed every mark in this painting by hand with the tip of a small round brush — a slow, meditative process that took most of a spring.',
      'The structure comes from an old photograph of a doorway in the Peloponnese; the colour comes from the walk up to it.',
    ],
    tone: '#c08a4f',
    ...img('parnassus-light'),
    aspect: 800 / 650,
    featured: true,
    print: { price: 360, size: '50 × 40 cm', editionSize: 75, remaining: 48 },
    imageCredit: 'Placeholder: Paul Klee, public domain',
  },
  {
    id: 'os-005',
    slug: 'quiet-city',
    title: 'Quiet City in Red',
    year: 2023,
    category: 'Abstractions',
    medium: 'Gouache and oil on paper, mounted',
    materials: 'Hot-pressed cotton rag paper, gouache, oil pastel, archival mount',
    widthCm: 56,
    heightCm: 63,
    price: 3400,
    currency: 'USD',
    availability: 'available',
    frame: 'white',
    excerpt: 'Rooftops reduced to a chord of colour.',
    story: [
      'A city seen from a hill at midday, when the light flattens everything into blocks. I cut and reassembled the composition three times before painting it.',
      'It is one of the smaller works in the studio, and one of the loudest.',
    ],
    tone: '#a7493a',
    ...img('quiet-city'),
    aspect: 700 / 788,
    imageCredit: 'Placeholder: Paul Klee, public domain',
  },
  {
    id: 'os-006',
    slug: 'yellow-hill',
    title: 'The Yellow Hill',
    year: 2025,
    category: 'Landscapes',
    medium: 'Oil on board',
    materials: 'Cradled poplar panel, oil, alkyd medium',
    widthCm: 96,
    heightCm: 70,
    price: 6200,
    currency: 'USD',
    availability: 'available',
    frame: 'black',
    excerpt: 'A village holding on to a hill of pure cadmium.',
    story: [
      'This one was painted fast and loud after a long winter. I gave myself one rule: no colour could be mixed more than twice.',
      'The houses are almost an afterthought. The painting is really about the hill, and about how much yellow a person can look at.',
    ],
    tone: '#d1a12d',
    ...img('yellow-hill'),
    aspect: 1000 / 725,
    featured: true,
    print: { price: 390, size: '66 × 48 cm', editionSize: 50, remaining: 22 },
    imageCredit: 'Placeholder: Wassily Kandinsky, public domain',
  },
  {
    id: 'os-007',
    slug: 'grid-for-a-morning',
    title: 'Grid for a Morning',
    year: 2023,
    category: 'Abstractions',
    medium: 'Oil on canvas',
    materials: 'Linen canvas, oil, hand-ruled graphite, matte varnish',
    widthCm: 60,
    heightCm: 70,
    price: 4100,
    currency: 'USD',
    availability: 'sold',
    frame: 'white',
    excerpt: 'Order, quiet, and two small decisions in blue and yellow.',
    story: [
      'An exercise in leaving things out. Every line was ruled by hand and painted over several times until its edge felt alive rather than mechanical.',
      'Now in a private collection in Lisbon. A limited print edition remains available.',
    ],
    tone: '#3d5ea8',
    ...img('grid-for-a-morning'),
    aspect: 684 / 800,
    print: { price: 320, size: '42 × 49 cm', editionSize: 75, remaining: 9 },
    imageCredit: 'Placeholder: Piet Mondrian, public domain',
  },
  {
    id: 'os-008',
    slug: 'birch-silence',
    title: 'Birch Silence',
    year: 2025,
    category: 'Landscapes',
    medium: 'Oil on canvas',
    materials: 'Square linen canvas, oil, beeswax medium',
    widthCm: 110,
    heightCm: 110,
    price: 9200,
    currency: 'USD',
    availability: 'available',
    frame: 'walnut',
    excerpt: 'An autumn floor, a hundred pale trunks, no sky.',
    story: [
      'The largest painting of the year. I removed the sky entirely so the forest would close in around the viewer — there is nowhere for the eye to escape.',
      'The floor is built from thousands of small strokes of rust, umber and violet, applied over five weeks.',
    ],
    tone: '#8b5a37',
    ...img('birch-silence'),
    aspect: 1800 / 1779,
    featured: true,
    imageCredit: 'Placeholder: Gustav Klimt, public domain',
  },
  {
    id: 'os-009',
    slug: 'villas-at-the-water',
    title: 'Villas at the Water',
    year: 2024,
    category: 'Landscapes',
    medium: 'Oil on canvas',
    materials: 'Fine-weave linen, oil, cold wax',
    widthCm: 100,
    heightCm: 97,
    price: 7400,
    currency: 'USD',
    availability: 'available',
    frame: 'gilt',
    excerpt: 'Cypress, plaster and a lake that doubles everything.',
    story: [
      'Painted from a rented rowing boat, which explains the slightly unstable horizon.',
      'I was drawn to the way the villas stack up the hillside like a tapestry, every window a small, flat note of colour.',
    ],
    tone: '#6f8a6b',
    ...img('villas-at-the-water'),
    aspect: 1024 / 992,
    print: { price: 410, size: '55 × 53 cm', editionSize: 50, remaining: 40 },
    imageCredit: 'Placeholder: Gustav Klimt, public domain',
  },
  {
    id: 'os-010',
    slug: 'afternoon-meadow',
    title: 'Afternoon by the Seine',
    year: 2024,
    category: 'Landscapes',
    medium: 'Oil on canvas',
    materials: 'Cotton canvas, oil, retouch varnish',
    widthCm: 81,
    heightCm: 60,
    price: 4800,
    currency: 'USD',
    availability: 'available',
    frame: 'oak',
    excerpt: 'Horses, a wide river, and an unhurried sky.',
    story: [
      'A plein-air painting completed in two sittings. The horses wandered into the composition on the second day and refused to leave, so they stayed.',
      'I love how ordinary this view is. Most of my favourite places are.',
    ],
    tone: '#7fa0b5',
    ...img('afternoon-meadow'),
    aspect: 1800 / 1332,
    imageCredit: 'Placeholder: Alfred Sisley, public domain',
  },
  {
    id: 'os-011',
    slug: 'red-amaryllis',
    title: 'Red Amaryllis',
    year: 2025,
    category: 'Botanicals',
    medium: 'Watercolour and gouache on paper',
    materials: '640gsm cotton rag paper, watercolour, gouache, museum glazing',
    widthCm: 45,
    heightCm: 72,
    price: 2900,
    currency: 'USD',
    availability: 'available',
    frame: 'black',
    excerpt: 'A single flower against a field of cobalt.',
    story: [
      'A gift from a neighbour, painted in the three days it was in bloom. The blue ground went down first in one breath; the flower was the easy part.',
    ],
    tone: '#2f5fa8',
    ...img('red-amaryllis'),
    aspect: 755 / 1200,
    print: { price: 260, size: '35 × 56 cm', editionSize: 100, remaining: 64 },
    imageCredit: 'Placeholder: Piet Mondrian, public domain',
  },
  {
    id: 'os-012',
    slug: 'ochre-quarry',
    title: 'Ochre Quarry',
    year: 2023,
    category: 'Landscapes',
    medium: 'Oil on canvas',
    materials: 'Linen canvas, earth pigments ground in the studio, oil',
    widthCm: 81,
    heightCm: 65,
    price: 5100,
    currency: 'USD',
    availability: 'sold',
    frame: 'walnut',
    excerpt: 'Painted with pigment dug from the same hillside.',
    story: [
      'I collected ochre from the quarry itself and ground it into oil in the studio. The painting is, quite literally, made of the place.',
      'Now in a private collection.',
    ],
    tone: '#b0743b',
    ...img('ochre-quarry'),
    aspect: 800 / 640,
    imageCredit: 'Placeholder: Paul Cézanne, public domain',
  },
]

export const categories: Category[] = ['Landscapes', 'Seascapes', 'Abstractions', 'Botanicals']

export const getArtwork = (slug: string) => artworks.find((a) => a.slug === slug)

export const relatedTo = (art: Artwork, n = 3) => {
  const same = artworks.filter((a) => a.id !== art.id && a.category === art.category)
  const rest = artworks.filter((a) => a.id !== art.id && a.category !== art.category)
  return [...same, ...rest].slice(0, n)
}
