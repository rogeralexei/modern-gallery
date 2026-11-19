export const money = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)

export const dims = (w: number, h: number) => {
  const inch = (cm: number) => Math.round((cm / 2.54) * 10) / 10
  return { cm: `${w} × ${h} cm`, in: `${inch(w)} × ${inch(h)} in` }
}

export const availabilityLabel = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
} as const
