import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import createEndpoint from '../api/products/index.ts'
import getEndpoint from '../api/products/[id].ts'
import uploadEndpoint from '../api/uploads.ts'
import { tablePreview } from '../src/data/tablePreview.ts'
import { IMAGE_BUCKET } from '../src/lib/uploadRules.ts'
import { calculatePrice, configurationUrl, selectionFromSearch } from '../src/lib/configuration.ts'
import { whatsappOrderUrl } from '../src/lib/whatsapp.ts'
import type { Product } from '../src/types/product.ts'
import { getSupabase, supabaseUrl } from '../server/supabase.ts'

const args = process.argv.slice(2)
function argument(name: string) {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

async function responseJson<T>(response: Response, expected: number): Promise<T> {
  let body: T & { error?: string }
  try { body = await response.json() as T & { error?: string } } catch {
    throw new Error('API did not return JSON. Start npm run dev and use its local URL with --base-url.')
  }
  if (response.status !== expected) throw new Error(body.error ?? `Unexpected API status ${response.status}.`)
  return body
}

function post(url: string, body: unknown) {
  return new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SHOWROOM_TEST_ACCESS_TOKEN}` }, body: JSON.stringify(body) })
}

// This script calls the SAME Web handlers as Vercel against your real Supabase
// project. It does not prove Vercel routing/deployment or browser UI behavior.
// A successful run leaves one real table product in the database; no dummy phone.
const phone = argument('--phone')
const imageFile = argument('--image')
const baseUrl = argument('--base-url')

async function callEndpoint(handler: { fetch(request: Request): Promise<Response> }, request: Request) {
  if (!baseUrl) return handler.fetch(request)
  const target = new URL(new URL(request.url).pathname, baseUrl)
  return fetch(target, {
    method: request.method, headers: request.headers,
    body: request.method === 'GET' ? undefined : await request.text(),
    signal: AbortSignal.timeout(30000),
  })
}

let uploadedPath: string | undefined
let saved = false

try {
  if (!phone || !imageFile) {
    throw new Error('Usage: npm run verify:backend -- --phone YOUR_COUNTRY_CODE_NUMBER --image PATH_TO_REAL_JPEG_PNG_OR_WEBP')
  }
  if (!process.env.SHOWROOM_TEST_ACCESS_TOKEN) throw new Error('Set SHOWROOM_TEST_ACCESS_TOKEN locally to a real signed-in test session before running this write check. Never paste tokens into chat or source files.')
  const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!publicKey || publicKey.startsWith('sb_secret_')) throw new Error('Configure the browser publishable key correctly.')
  const publicClient = createClient(supabaseUrl(), publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(12000) }) },
  })

  const image = await readFile(imageFile)
  const extension = extname(imageFile).toLowerCase()
  const type = ({ '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' } as Record<string, string>)[extension] ?? ''
  const uploadResponse = await callEndpoint(uploadEndpoint, post('http://localhost:3000/api/uploads', {
    name: basename(imageFile), size: image.length, type,
  }))
  const upload = await responseJson<{ path: string; token: string; publicUrl: string }>(uploadResponse, 201)
  const uploadResult = await publicClient.storage.from(IMAGE_BUCKET).uploadToSignedUrl(upload.path, upload.token, image, { contentType: type })
  if (uploadResult.error) throw new Error('Signed image upload failed. Check keys, bucket limits and network access.')
  uploadedPath = upload.path
  const publicImage = await fetch(upload.publicUrl, { signal: AbortSignal.timeout(12000) })
  assert.equal(publicImage.status, 200, 'Uploaded photo must be publicly readable.')
  await publicImage.body?.cancel()
  console.log('Signed image upload and public photo URL: passed.')

  const input = { ...structuredClone(tablePreview), photoUrl: upload.publicUrl, whatsapp: phone }
  input.finishes.push({ id: 'marble', slot: 'primary', name: 'Carrara Marble', color: '#F0F0F0', priceModifier: 25000 })
  const product = await responseJson<Product>(await callEndpoint(createEndpoint, post('http://localhost:3000/api/products', input)), 201)
  saved = true
  const fetched = await responseJson<Product>(await callEndpoint(getEndpoint, new Request(`http://localhost:3000/api/products/${product.id}`)), 200)
  assert.deepEqual(fetched, product)
  assert.deepEqual(fetched.parts, input.parts)
  assert.equal(fetched.photoUrl, upload.publicUrl)
  console.log('Product POST -> real database -> GET: passed.')

  const selection = { primary: 'marble', secondary: 'charcoal' } as const
  const config = new URL(configurationUrl(product, selection, baseUrl ?? 'http://localhost:3000'))
  assert.deepEqual(selectionFromSearch(product, config.search), selection)
  assert.equal(calculatePrice(product, selection), 175000)
  const message = new URL(whatsappOrderUrl(product, selection, baseUrl ?? 'http://localhost:3000')).searchParams.get('text')!
  assert.ok(message.includes(config.toString()))
  assert.ok(message.includes('Carrara Marble'))
  console.log('Configuration round trip, price and WhatsApp message: passed. No message was sent.')

  const denied = await publicClient.from('products').select('id').eq('id', product.id)
  assert.equal(denied.error?.code, '42501', 'Anonymous clients must be denied direct table access.')
  console.log('Anonymous direct product access: denied as expected.')
  console.log(`Saved product ID: ${product.id}`)
  console.log('This record and photo remain available for later builder/buyer integration.')
  console.log(baseUrl ? 'HTTP API routing: verified.' : 'Next: run npm run dev and verify HTTP with --base-url http://localhost:5173.')
} catch (error) {
  if (uploadedPath && !saved) {
    await getSupabase().storage.from(IMAGE_BUCKET).remove([uploadedPath])
  }
  console.error(error instanceof Error ? error.message : 'Backend verification failed.')
  process.exitCode = 1
}
