/** Everything about the artist lives here — edit freely. */
export const artist = {
  name: 'Elena Ravel',
  firstName: 'Elena',
  lastName: 'Ravel',
  monogram: 'ER',
  based: 'Lisbon, Portugal',
  tagline: 'Paintings of light, water and quiet places.',
  statement:
    'I paint the moments just before a place changes — the last minute of blue on a river, the hour a hill turns gold. Each work is made slowly, in layers, so that it keeps changing as the light in your room does.',
  bio: [
    'Elena Ravel (b. 1988) is a painter working between Lisbon and the Alentejo coast. Trained in printmaking before turning to oil, she builds her paintings in thin, translucent layers over weeks or months, often returning to the same view across a full season.',
    'Her work moves freely between observed landscape and abstraction, held together by an obsession with atmosphere — fog, glare, reflected light and the colour of air.',
  ],
  philosophy:
    'A painting should be quieter than the room it hangs in, and then, slowly, louder. I want people to discover something new in a work after a year of living with it.',
  process: [
    {
      step: '01',
      title: 'Looking',
      text: 'Every painting starts on site, with small oil sketches and notes on colour taken over many visits.',
    },
    {
      step: '02',
      title: 'Grounding',
      text: 'Linen is stretched and primed by hand. Some pigments are ground in the studio from collected earth.',
    },
    {
      step: '03',
      title: 'Layering',
      text: 'Thin glazes, scraped back and rebuilt, sometimes dozens of times, until the light feels inevitable.',
    },
    {
      step: '04',
      title: 'Resting',
      text: 'Finished works rest for months before varnishing, then are framed in solid hardwood made locally.',
    },
  ],
  exhibitions: [
    { year: 2025, title: 'The Colour of Air', venue: 'Galeria Maré, Lisbon', kind: 'Solo' },
    { year: 2025, title: 'Atlantic Light', venue: 'Maison Lumen, Biarritz', kind: 'Group' },
    { year: 2024, title: 'Slow Water', venue: 'Casa do Rio, Almada', kind: 'Solo' },
    { year: 2024, title: 'Young Painters Prize', venue: 'Prémio Nova Pintura, Porto', kind: 'Shortlist' },
    { year: 2023, title: 'Landscapes After', venue: 'Hafenhalle, Hamburg', kind: 'Group' },
    { year: 2022, title: 'Residency', venue: 'Atelier Résidence, Paris', kind: 'Residency' },
  ],
  contact: {
    email: 'studio@elenaravel.art',
    phone: '+351 912 345 678',
    studio: 'Rua das Flores 42, 1200-195 Lisboa',
    instagram: 'https://instagram.com/',
    instagramHandle: '@elenaravel.studio',
  },
} as const
