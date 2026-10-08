import type { Product, ProductInput, ProductSummary } from '../src/types/product.ts'
import { IMAGE_BUCKET, MAX_IMAGE_BYTES, validateImageFile } from '../src/lib/uploadRules.ts'
import { HttpError } from './http.ts'
import { getSupabase, supabaseUrl } from './supabase.ts'
import { imagePath } from './validation.ts'

type ProductRow = {
  id: string; name: string; photo_url: string | null; model_url: string | null
  parts: ProductInput['parts']; finishes: ProductInput['finishes']; price: number
  dimensions_cm: ProductInput['dimensionsCm']; dimensions: string; whatsapp: string; created_at: string
}

const columns = 'id,name,photo_url,model_url,parts,finishes,price,dimensions_cm,dimensions,whatsapp,created_at'

function fromRow(row: ProductRow): Product {
  return {
    id: row.id, name: row.name, photoUrl: row.photo_url, modelUrl: row.model_url,
    parts: row.parts, finishes: row.finishes, price: Number(row.price),
    dimensionsCm: row.dimensions_cm, dimensions: row.dimensions,
    whatsapp: row.whatsapp, createdAt: row.created_at,
  }
}

function databaseError(code: string | undefined): never {
  if (code === 'PGRST204' || code === '42703') {
    throw new HttpError(503, 'Product ownership setup is missing. Run the Milestone 12 migration in Supabase SQL Editor.')
  }
  if (code === 'PGRST205' || code === '42P01') {
    throw new HttpError(503, 'The products table is missing. Run the setup migration in Supabase SQL Editor.')
  }
  throw new HttpError(503, 'Product storage is unavailable. Check server credentials and database setup.')
}

async function verifyImages(product: ProductInput, ownerId: string) {
  const urls = [product.photoUrl, ...product.finishes.map((finish) => finish.textureUrl)]
  const paths = [...new Set(urls.flatMap((url) => {
    const path = imagePath(url, supabaseUrl(), ownerId)
    return path ? [path] : []
  }))]
  await Promise.all(paths.map(async (path) => {
    const { data, error } = await getSupabase().storage.from(IMAGE_BUCKET).info(path)
    if (error || !data) throw new HttpError(400, 'An image is unavailable. Upload it again before saving.')
    try {
      validateImageFile({ name: path, size: data.size ?? 0, type: data.contentType ?? '' })
    } catch {
      throw new HttpError(400, `Uploaded images must be JPEG, PNG or WebP and no larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MiB.`)
    }
  }))
}

export async function saveProduct(product: ProductInput, ownerId: string): Promise<Product> {
  await verifyImages(product, ownerId)
  const { data, error } = await getSupabase().from('products').insert({
    name: product.name, photo_url: product.photoUrl, model_url: product.modelUrl,
    parts: product.parts, finishes: product.finishes, price: product.price,
    dimensions_cm: product.dimensionsCm, dimensions: product.dimensions, whatsapp: product.whatsapp, owner_id: ownerId,
  }).select(columns).single()
  if (error) databaseError(error.code)
  return fromRow(data as ProductRow)
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data, error } = await getSupabase().from('products').select(columns).eq('id', id).maybeSingle()
  if (error) databaseError(error.code)
  if (!data) throw new HttpError(404, 'Product not found.')
  return fromRow(data as ProductRow)
}

export async function fetchMyProducts(ownerId: string): Promise<ProductSummary[]> {
  // The service role bypasses RLS: this verified-owner filter is mandatory.
  const { data, error } = await getSupabase().from('products')
    .select('id,name,photo_url,price,dimensions,created_at')
    .eq('owner_id', ownerId).order('created_at', { ascending: false }).limit(100)
  if (error) databaseError(error.code)
  return (data ?? []).map(row => ({ id: row.id, name: row.name, photoUrl: row.photo_url,
    price: Number(row.price), dimensions: row.dimensions, createdAt: row.created_at }))
}
