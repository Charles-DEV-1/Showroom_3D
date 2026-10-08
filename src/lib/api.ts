import { getBrowserSupabase } from './supabase'
import type { Product, ProductInput, ProductSummary } from '../types/product.ts'
import type { ArtisanProfile, ProfileInput } from '../types/profile.ts'
import { IMAGE_BUCKET, validateImageFile } from './uploadRules.ts'
import { prepareFinishTexture } from './finishTexture.ts'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

async function request<T>(url: string, options: RequestInit = {}, privateRequest = false): Promise<T> {
  if (privateRequest) {
    const { data, error } = await getBrowserSupabase().auth.getSession()
    if (error || !data.session) throw new ApiError('Sign in again to continue. Your draft has not been submitted.', 401)
    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${data.session.access_token}`)
    options = { ...options, headers }
  }
  const response = await fetch(url, options)
  let body: unknown
  try { body = await response.json() } catch {
    throw new Error('The product API did not return JSON. Run the app with npm run dev for local testing.')
  }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error : 'The request failed. Please try again.'
    throw new ApiError(message, response.status)
  }
  return body as T
}

export function createProduct(product: ProductInput) {
  return request<Product>('/api/products', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
  }, true)
}

export function getProduct(id: string, signal?: AbortSignal) {
  return request<Product>(`/api/products/${encodeURIComponent(id)}`, { signal })
}

export async function getMyProducts(signal?: AbortSignal) {
  const result = await request<{ products: ProductSummary[] }>('/api/me/products', { signal }, true)
  return result.products
}

export async function getProfile(signal?: AbortSignal) {
  const result = await request<{ profile: ArtisanProfile | null }>('/api/profile', { signal }, true)
  return result.profile
}

export async function updateProfile(profile: ProfileInput) {
  const result = await request<{ profile: ArtisanProfile }>('/api/profile', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile),
  }, true)
  return result.profile
}

export async function uploadReferencePhoto(file: File): Promise<string> {
  validateImageFile(file)
  const upload = await request<{ path: string; token: string; publicUrl: string }>('/api/uploads', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, size: file.size, type: file.type }),
  }, true)
  const client = getBrowserSupabase()
  const { error } = await client.storage.from(IMAGE_BUCKET).uploadToSignedUrl(upload.path, upload.token, file, {
    contentType: file.type, cacheControl: '31536000',
  })
  if (error) throw new Error('Image upload failed. Check the connection and try again.')
  return upload.publicUrl
}

export async function uploadFinishTexture(file: File): Promise<string> {
  return uploadReferencePhoto(await prepareFinishTexture(file))
}
