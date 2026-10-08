import type { Finish, MaterialSlot, Part, ProductInput, Vector3Cm } from '../src/types/product.ts'
import { formatDimensions } from '../src/lib/configuration.ts'
import { sanitizeWhatsApp } from '../src/lib/whatsapp.ts'
import { IMAGE_BUCKET, validateImageFile } from '../src/lib/uploadRules.ts'
import { HttpError } from './http.ts'

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const itemIdPattern = /^[A-Za-z0-9_-]{1,64}$/

function invalid(message: string): never { throw new HttpError(400, message) }

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(`${label} must be an object.`)
  return value as Record<string, unknown>
}

function text(value: unknown, label: string, max: number) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) invalid(`${label} must be 1–${max} characters.`)
  return value.trim()
}

function identifier(value: unknown, label: string) {
  const id = text(value, label, 64)
  if (!itemIdPattern.test(id)) invalid(`${label} may contain only letters, numbers, hyphens and underscores.`)
  return id
}

function slot(value: unknown): MaterialSlot {
  if (value !== 'primary' && value !== 'secondary') invalid('Material slot must be primary or secondary.')
  return value
}

function price(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 1000000000) {
    invalid(`${label} must be a whole number from 0 to 1,000,000,000 naira.`)
  }
  return value
}

function tuple(value: unknown, length: number, label: string, positive: boolean): number[] {
  if (!Array.isArray(value) || value.length !== length || value.some((item) => (
    typeof item !== 'number' || !Number.isFinite(item) || Math.abs(item) > 1000 || (positive && item <= 0)
  ))) invalid(`${label} must have ${length} finite numbers ${positive ? 'greater than 0 and no larger than 1000' : 'between -1000 and 1000'} cm.`)
  return [...value] as number[]
}

export function imagePath(value: unknown, projectUrl: string, ownerId?: string): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string' || value.length > 2048) invalid('Image URL is invalid.')
  let url: URL
  try { url = new URL(value) } catch { invalid('Image URL is invalid.') }
  const prefix = `/storage/v1/object/public/${IMAGE_BUCKET}/`
  if (url.origin !== new URL(projectUrl).origin || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(prefix)) {
    invalid('Upload images to this project’s product-images bucket.')
  }
  const path = url.pathname.slice(prefix.length)
  const match = /^images\/(?:([0-9a-f-]+)\/)?([0-9a-f-]+)\.(jpg|jpeg|png|webp)$/i.exec(path)
  if (!match || !UUID_PATTERN.test(match[2]) || (match[1] && !UUID_PATTERN.test(match[1]))) invalid('Use an image URL returned by the upload endpoint.')
  if (ownerId && match[1] !== ownerId) invalid('Use an image uploaded by your own artisan account.')
  return path
}

function imageUrl(value: unknown, projectUrl: string, ownerId?: string) {
  const path = imagePath(value, projectUrl, ownerId)
  return path ? `${new URL(projectUrl).origin}/storage/v1/object/public/${IMAGE_BUCKET}/${path}` : null
}

function part(value: unknown): Part {
  const data = object(value, 'Part')
  const base = {
    id: identifier(data.id, 'Part ID'),
    position: tuple(data.position, 3, 'Position', false) as Vector3Cm,
    slot: slot(data.slot),
  }
  switch (data.shape) {
    case 'box': return { ...base, shape: 'box', size: tuple(data.size, 3, 'Box size', true) as [number, number, number] }
    case 'cylinder': return { ...base, shape: 'cylinder', size: tuple(data.size, 2, 'Cylinder size', true) as [number, number] }
    case 'sphere': return { ...base, shape: 'sphere', size: tuple(data.size, 1, 'Sphere size', true) as [number] }
    default: return invalid('Shape must be box, cylinder or sphere.')
  }
}

function finish(value: unknown, projectUrl: string, ownerId?: string): Finish {
  const data = object(value, 'Finish')
  const color = text(data.color, 'Finish color', 7)
  if (!/^#[0-9a-f]{6}$/i.test(color)) invalid('Finish color must use #RRGGBB format.')
  return {
    id: identifier(data.id, 'Finish ID'), slot: slot(data.slot),
    name: text(data.name, 'Finish name', 80), color,
    textureUrl: imageUrl(data.textureUrl, projectUrl, ownerId),
    priceModifier: price(data.priceModifier, 'Finish modifier'),
  }
}

function uniqueIds(items: { id: string }[], label: string) {
  if (new Set(items.map((item) => item.id)).size !== items.length) invalid(`${label} IDs must be unique.`)
}

export function validateProduct(value: unknown, projectUrl: string, ownerId?: string): ProductInput {
  const data = object(value, 'Product')
  if (['owner_id', 'ownerId', 'user_id', 'userId', 'id', 'created_at', 'createdAt'].some(key => Object.hasOwn(data, key))) {
    invalid('Product identity and ownership are assigned by the server.')
  }
  if (!Array.isArray(data.parts) || data.parts.length < 1 || data.parts.length > 100) invalid('Provide 1–100 parts.')
  if (!Array.isArray(data.finishes) || data.finishes.length > 24) invalid('Provide at most 24 finishes.')
  if (data.modelUrl !== null && data.modelUrl !== undefined && data.modelUrl !== '') invalid('GLB upload is not enabled in this milestone.')
  const parts = data.parts.map(part)
  const finishes = data.finishes.map((value) => finish(value, projectUrl, ownerId))
  uniqueIds(parts, 'Part')
  uniqueIds(finishes, 'Finish')
  const dimensionsCm = tuple(data.dimensionsCm, 3, 'Dimensions', true) as Vector3Cm
  let whatsapp: string
  try { whatsapp = sanitizeWhatsApp(text(data.whatsapp, 'WhatsApp number', 40)) } catch (error) {
    invalid(error instanceof Error ? error.message : 'WhatsApp number is invalid.')
  }
  return {
    name: text(data.name, 'Product name', 120),
    photoUrl: imageUrl(data.photoUrl, projectUrl, ownerId), modelUrl: null,
    parts, finishes, price: price(data.price, 'Base price'),
    dimensionsCm, dimensions: formatDimensions(dimensionsCm), whatsapp,
  }
}

export function validateUpload(value: unknown) {
  const data = object(value, 'Upload')
  const name = text(data.name, 'Image filename', 160)
  const type = text(data.type, 'Image content type', 40)
  if (typeof data.size !== 'number') invalid('Image size must be a number.')
  try {
    return { extension: validateImageFile({ name, type, size: data.size }) }
  } catch (error) {
    return invalid(error instanceof Error ? error.message : 'Image is invalid.')
  }
}
