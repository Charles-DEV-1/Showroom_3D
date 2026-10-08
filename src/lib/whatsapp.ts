import type { FinishSelection, Product } from '../types/product.ts'
import { calculatePrice, configurationUrl, formatPrice, selectedFinishes } from './configuration.ts'

export function sanitizeWhatsApp(phone: string) {
  const compact = phone.trim().replace(/[\s()-]/g, '')
  if (!/^\+?[1-9]\d{7,14}$/.test(compact)) {
    throw new Error('Enter a WhatsApp number with its country code, using 8–15 digits, e.g. +234 followed by your number.')
  }
  return compact.replace(/^\+/, '')
}

export function whatsappOrderUrl(product: Product, selection: FinishSelection, origin: string) {
  const finishes = selectedFinishes(product, selection)
  const message = [
    `Hello! I would like to order ${product.name}.`,
    ...finishes.map((finish) => `${finish.slot === 'primary' ? 'Primary' : 'Secondary'} finish: ${finish.name}`),
    `Price: ${formatPrice(calculatePrice(product, selection))}`,
    `Dimensions: ${product.dimensions}`,
    `Configuration: ${configurationUrl(product, selection, origin)}`,
  ].join('\n')
  return `https://wa.me/${sanitizeWhatsApp(product.whatsapp)}?text=${encodeURIComponent(message)}`
}
