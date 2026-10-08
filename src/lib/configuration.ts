import type { Finish, FinishSelection, MaterialSlot, Product, ProductInput } from '../types/product.ts'

const slots: MaterialSlot[] = ['primary', 'secondary']

export function formatDimensions([width, height, depth]: ProductInput['dimensionsCm']) {
  return `${width}cm x ${depth}cm x ${height}cm`
}

export function selectedFinishes(product: ProductInput, selection: FinishSelection): Finish[] {
  return slots.flatMap((slot) => {
    if (!product.parts.some((part) => part.slot === slot)) return []
    const options = product.finishes.filter((finish) => finish.slot === slot)
    const finish = options.find((option) => option.id === selection[slot]) ?? options[0]
    return finish ? [finish] : []
  })
}

export function selectionFromSearch(product: ProductInput, search: string): FinishSelection {
  const parameters = new URLSearchParams(search)
  const requested: FinishSelection = {
    primary: parameters.get('finish') ?? undefined,
    secondary: parameters.get('secondary') ?? undefined,
  }
  return Object.fromEntries(selectedFinishes(product, requested).map((finish) => [finish.slot, finish.id]))
}

export function calculatePrice(product: ProductInput, selection: FinishSelection) {
  return selectedFinishes(product, selection).reduce((total, finish) => total + finish.priceModifier, product.price)
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(price)
}

export function configurationUrl(product: Product, selection: FinishSelection, origin: string) {
  const url = new URL(`/product/${encodeURIComponent(product.id)}`, origin)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS app URL.')
  for (const finish of selectedFinishes(product, selection)) {
    url.searchParams.set(finish.slot === 'primary' ? 'finish' : 'secondary', finish.id)
  }
  return url.toString()
}
