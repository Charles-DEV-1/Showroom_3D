import test from 'node:test'
import assert from 'node:assert/strict'
import createEndpoint from '../api/products/index.ts'
import getEndpoint from '../api/products/[id].ts'
import uploadEndpoint from '../api/uploads.ts'
import { HttpError, readJson } from '../server/http.ts'
import { imagePath, validateProduct, validateUpload } from '../server/validation.ts'
import { tablePreview } from '../src/data/tablePreview.ts'
import { tableParts } from '../src/data/templates.ts'
import { calculatePrice, configurationUrl, selectionFromSearch } from '../src/lib/configuration.ts'
import { sanitizeWhatsApp, whatsappOrderUrl } from '../src/lib/whatsapp.ts'
import type { Product, ProductInput } from '../src/types/product.ts'

const projectUrl = 'https://unit-test-project.supabase.co'
const productId = 'de1e92dd-278f-4c8e-9918-3620e2eb184f'
// Isolated fixtures only. These tests never contact a database or WhatsApp.
const validProduct = (): ProductInput => ({ ...structuredClone(tablePreview), whatsapp: '+234 (801) 234-5678' })
const invalid = (input: unknown) => assert.throws(() => validateProduct(input, projectUrl), (error) => error instanceof HttpError && error.status === 400)
const postRequest = (body: unknown) => new Request('https://app.test/api/products', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

test('valid JSON is normalized without mutating its shapes or trusting its dimension label', () => {
  const input = validProduct()
  input.name = '  Dining table  '
  input.dimensions = 'forged dimensions'
  const result = validateProduct(input, projectUrl)
  assert.equal(result.name, 'Dining table')
  assert.equal(result.whatsapp, '2348012345678')
  assert.equal(result.dimensions, '180cm x 90cm x 75cm')
  assert.deepEqual(result.parts, input.parts)
  assert.equal(input.dimensions, 'forged dimensions')
})

test('table dimensions produce positive parts with grounded legs and the declared overall bounds', () => {
  for (const dimensions of [[200, 80, 100], [48, 22, 70], [10, 10, 10]] as ProductInput['dimensionsCm'][]) {
    const [width, height, depth] = dimensions
    const parts = tableParts(dimensions)
    const input = { ...validProduct(), dimensionsCm: dimensions, parts }
    assert.equal(validateProduct(input, projectUrl).parts.length, 5)
    const top = parts.find((part) => part.shape === 'box')!
    assert.equal(top.shape, 'box')
    if (top.shape !== 'box') throw new Error('Tabletop missing')
    assert.equal(top.size[0], width)
    assert.equal(top.size[2], depth)
    assert.equal(top.position[1] + top.size[1] / 2, height)
    for (const leg of parts.filter((part) => part.shape === 'cylinder')) {
      if (leg.shape !== 'cylinder') throw new Error('Table leg missing')
      assert.equal(leg.position[1] - leg.size[1] / 2, 0)
      assert.equal(leg.position[1] + leg.size[1] / 2, top.position[1] - top.size[1] / 2)
      assert.ok(Math.abs(leg.position[0]) + leg.size[0] <= width / 2)
      assert.ok(Math.abs(leg.position[2]) + leg.size[0] <= depth / 2)
    }
  }
})

test('all three shapes validate with their distinct tuples', () => {
  const input = validProduct()
  input.parts.push({ id: 'sphere', shape: 'sphere', size: [5], position: [0, 82, 0], slot: 'primary' })
  assert.equal(validateProduct(input, projectUrl).parts.at(-1)?.shape, 'sphere')
  const malformed = structuredClone(input) as unknown as { parts: Record<string, unknown>[] }
  malformed.parts.at(-1)!.size = [5, 5]
  invalid(malformed)
})

test('rejects impossible sizes, positions, dimensions and malformed shape data', () => {
  for (const size of [[0, 4, 90], [-180, 4, 90], [1001, 4, 90], [Infinity, 4, 90], [180, 4]]) {
    const input = validProduct() as unknown as { parts: Record<string, unknown>[] }
    input.parts[0].size = size
    invalid(input)
  }
  const input = validProduct()
  input.parts[0].position[0] = NaN
  invalid(input)
  input.parts[0].position[0] = 0
  input.dimensionsCm[0] = 0
  invalid(input)
  invalid({ ...validProduct(), parts: [{ ...validProduct().parts[0], shape: 'cone' }] })
  invalid({ ...validProduct(), parts: [] })
})

test('rejects duplicate IDs, unsafe prices, colors, slots and unsupported GLB data', () => {
  const input = validProduct()
  input.parts[1].id = input.parts[0].id
  invalid(input)
  for (const value of [-1, 1.5, '150000', 1000000001]) invalid({ ...validProduct(), price: value })
  invalid({ ...validProduct(), finishes: [{ ...input.finishes[0], color: 'red' }] })
  invalid({ ...validProduct(), finishes: [{ ...input.finishes[0], slot: 'unknown' }] })
  invalid({ ...validProduct(), finishes: [{ ...input.finishes[0], priceModifier: -1 }] })
  invalid({ ...validProduct(), finishes: [input.finishes[0], input.finishes[0]] })
  invalid({ ...validProduct(), modelUrl: 'https://example.com/model.glb' })
})

test('only accepts upload endpoint image paths in the configured bucket', () => {
  const url = `${projectUrl}/storage/v1/object/public/product-images/images/${productId}.png`
  assert.equal(imagePath(url, projectUrl), `images/${productId}.png`)
  for (const bad of [
    url.replace(projectUrl, 'https://attacker.test'), `${url}?download=1`,
    url.replace('product-images', 'other-bucket'), url.replace(`${productId}.png`, '../file.png'),
    'javascript:alert(1)',
  ]) invalid({ ...validProduct(), photoUrl: bad })
})

test('image validation rejects unsupported MIME, oversize, empty and mismatched extensions', () => {
  assert.deepEqual(validateUpload({ name: 'photo.JPG', type: 'image/jpeg', size: 2097152 }), { extension: 'jpg' })
  for (const image of [
    { name: 'image.svg', type: 'image/svg+xml', size: 100 },
    { name: 'photo.png', type: 'image/png', size: 2097153 },
    { name: 'photo.png', type: 'image/png', size: 0 },
    { name: 'photo.png', type: 'image/jpeg', size: 100 },
    { name: 'photo.png', type: '__proto__', size: 100 },
  ]) assert.throws(() => validateUpload(image), HttpError)
})

test('texture finishes retain their uploaded image, selection and price without accepting external image URLs', () => {
  const textureUrl = `${projectUrl}/storage/v1/object/public/product-images/images/${productId}.jpg`
  const input = validProduct()
  input.finishes.push({ id: 'marble', slot: 'primary', name: 'Marble', color: '#F0F0F0', textureUrl, priceModifier: 25000 })
  const result = validateProduct(input, projectUrl)
  assert.equal(result.finishes.at(-1)?.textureUrl, textureUrl)
  const selection = selectionFromSearch(result, '?finish=marble&secondary=charcoal')
  assert.equal(calculatePrice(result, selection), 175000)
  for (const invalidUrl of ['https://example.com/texture.jpg', `${textureUrl}?download=1`, 'javascript:alert(1)']) {
    invalid({ ...input, finishes: [{ ...input.finishes.at(-1), textureUrl: invalidUrl }] })
  }
  assert.equal(validateProduct({ ...input, finishes: [{ ...input.finishes[0], textureUrl: null }] }, projectUrl).finishes[0].textureUrl, null)
})

test('phone sanitization retains country codes and rejects local/invalid numbers', () => {
  assert.equal(sanitizeWhatsApp('+234 (801) 234-5678'), '2348012345678')
  for (const phone of ['08012345678', '234letters1234', '123', '234+8012345678', '1234567890123456']) {
    assert.throws(() => sanitizeWhatsApp(phone))
    invalid({ ...validProduct(), whatsapp: phone })
  }
})

test('multi-slot pricing counts each chosen finish once and ignores unused slots', () => {
  const input = validProduct()
  input.finishes[0].priceModifier = 25000
  input.finishes[1].priceModifier = 10000
  assert.equal(calculatePrice(input, { primary: 'walnut', secondary: 'charcoal' }), 185000)
  input.parts = input.parts.filter((part) => part.slot === 'primary')
  assert.equal(calculatePrice(input, { primary: 'walnut', secondary: 'charcoal' }), 175000)
})

test('configuration IDs survive a shared URL and invalid/wrong-slot IDs fall back', () => {
  const product: Product = { ...validProduct(), id: productId, createdAt: new Date().toISOString() }
  product.finishes.push({ id: 'marble', slot: 'primary', name: 'Carrara Marble', color: '#F0F0F0', priceModifier: 25000 })
  const selection = { primary: 'marble', secondary: 'charcoal' } as const
  const url = new URL(configurationUrl(product, selection, 'https://showroom.test'))
  assert.equal(url.searchParams.get('finish'), 'marble')
  assert.deepEqual(selectionFromSearch(product, url.search), selection)
  assert.deepEqual(selectionFromSearch(product, '?finish=charcoal&secondary=unknown'), { primary: 'walnut', secondary: 'charcoal' })
})

test('WhatsApp message encoding preserves special characters and every selected finish', () => {
  const product: Product = { ...validProduct(), name: 'Table & chairs #1', id: productId, createdAt: new Date().toISOString() }
  const url = new URL(whatsappOrderUrl(product, { primary: 'walnut', secondary: 'charcoal' }, 'https://showroom.test'))
  assert.equal(url.hostname, 'wa.me')
  assert.equal(url.pathname, '/2348012345678')
  const message = url.searchParams.get('text')!
  for (const content of ['Table & chairs #1', 'Primary finish: Walnut', 'Secondary finish: Charcoal', '150,000', product.dimensions, `https://showroom.test/product/${productId}?finish=walnut&secondary=charcoal`]) {
    assert.ok(message.includes(content))
  }
  assert.ok(message.includes('\n'))
})

test('API handlers reject wrong methods, invalid public IDs and unsigned writes before any database request', async () => {
  const wrongMethod = await createEndpoint.fetch(new Request('https://app.test/api/products'))
  assert.equal(wrongMethod.status, 405)
  assert.equal(wrongMethod.headers.get('Allow'), 'POST')
  assert.equal((await getEndpoint.fetch(new Request('https://app.test/api/products/bad-id'))).status, 400)
  assert.equal((await getEndpoint.fetch(new Request(`https://app.test/api/products/${productId}`, { method: 'DELETE' }))).status, 405)
  assert.equal((await createEndpoint.fetch(postRequest(validProduct()))).status, 401)
  assert.equal((await uploadEndpoint.fetch(postRequest({ name: 'photo.jpg', size: 100, type: 'image/jpeg' }))).status, 401)
})

test('authenticated request body validation rejects invalid content type, JSON and oversize bodies', async () => {
  const status = (expected: number) => (error: unknown) => error instanceof HttpError && error.status === expected
  await assert.rejects(readJson(new Request('https://app.test/api/products', { method: 'POST', body: '{}' })), status(415))
  await assert.rejects(readJson(new Request('https://app.test/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })), status(400))
  await assert.rejects(readJson(postRequest({ oversized: 'x'.repeat(128 * 1024) })), status(413))
})

test('missing server configuration returns a safe 503 without leaking details', async () => {
  const oldUrl = process.env.SUPABASE_URL
  const oldKey = process.env.SUPABASE_SECRET_KEY
  const oldPublicUrl = process.env.VITE_SUPABASE_URL
  process.env.SUPABASE_URL = projectUrl
  delete process.env.SUPABASE_SECRET_KEY
  delete process.env.VITE_SUPABASE_URL
  try {
    const request = postRequest(validProduct())
    request.headers.set('Authorization', 'Bearer test-only-invalid-token')
    const response = await createEndpoint.fetch(request)
    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), { error: 'Configure the server-only Supabase secret key.' })
  } finally {
    for (const [name, value] of [['SUPABASE_URL', oldUrl], ['SUPABASE_SECRET_KEY', oldKey], ['VITE_SUPABASE_URL', oldPublicUrl]]) {
      if (value === undefined) delete process.env[name!]
      else process.env[name!] = value
    }
  }
})
