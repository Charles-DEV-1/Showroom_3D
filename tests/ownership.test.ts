import test from 'node:test'
import assert from 'node:assert/strict'
import { HttpError } from '../server/http.ts'
import { imagePath, validateProduct } from '../server/validation.ts'
import { tablePreview } from '../src/data/tablePreview.ts'
import { requireArtisan } from '../server/auth.ts'
import myProducts from '../api/me/products.ts'

const project = 'https://ownership-test.supabase.co'
const userA = '00000000-0000-4000-8000-000000000001'
const userB = '00000000-0000-4000-8000-000000000002'
const object = '00000000-0000-4000-8000-000000000003'
const image = (path: string) => `${project}/storage/v1/object/public/product-images/${path}`

test('legacy image URLs still validate for reads, but new saves require the verified owner folder', () => {
  const legacy = image(`images/${object}.jpg`)
  const own = image(`images/${userA}/${object}.jpg`)
  const other = image(`images/${userB}/${object}.jpg`)
  assert.equal(imagePath(legacy, project), `images/${object}.jpg`)
  assert.equal(imagePath(own, project, userA), `images/${userA}/${object}.jpg`)
  for (const url of [legacy, other, image(`images/${userA}/../${object}.jpg`)]) {
    assert.throws(() => imagePath(url, project, userA), (error: unknown) => error instanceof HttpError && error.status === 400)
  }
  const product = { ...structuredClone(tablePreview), whatsapp: '2348012345678', photoUrl: own }
  assert.equal(validateProduct(product, project, userA).photoUrl, own)
  product.finishes[0].textureUrl = other
  assert.throws(() => validateProduct(product, project, userA))
})

test('client-supplied product identity and ownership are rejected rather than trusted', () => {
  for (const field of ['owner_id', 'ownerId', 'userId', 'user_id', 'id', 'createdAt', 'created_at']) {
    assert.throws(() => validateProduct({ ...structuredClone(tablePreview), whatsapp: '2348012345678', [field]: userB }, project, userA))
  }
})

test('server verifies identity remotely, scopes private reads, and keeps the service database credential separate', async () => {
  const originalFetch = globalThis.fetch
  const oldEnv = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY, publicUrl: process.env.VITE_SUPABASE_URL }
  process.env.SUPABASE_URL = project
  process.env.SUPABASE_SECRET_KEY = 'test-only-service-credential'
  delete process.env.VITE_SUPABASE_URL
  const queries: URL[] = []
  let authRequests = 0
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input))
    const headers = new Headers(init?.headers)
    if (url.pathname === '/auth/v1/user') {
      authRequests++
      const token = headers.get('Authorization')
      if (token === 'Bearer outage') return Response.json({ code: 'unexpected_failure', msg: 'private detail' }, { status: 503 })
      if (token === 'Bearer anon') return Response.json({ id: userA, is_anonymous: true })
      if (token !== 'Bearer account-a' && token !== 'Bearer account-b') return Response.json({ error_code: 'bad_jwt', msg: 'private detail' }, { status: 401 })
      return Response.json({ id: token === 'Bearer account-a' ? userA : userB, is_anonymous: false })
    }
    assert.equal(url.pathname, '/rest/v1/products')
    assert.equal(headers.get('Authorization'), 'Bearer test-only-service-credential')
    queries.push(url)
    return Response.json([])
  }
  const request = (token?: string) => new Request('https://app.test/api/me/products?userId='+userB, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  try {
    assert.equal((await myProducts.fetch(request())).status, 401)
    assert.equal(authRequests, 0)
    assert.equal((await myProducts.fetch(request('forged-or-foreign-token'))).status, 401)
    assert.equal((await myProducts.fetch(request('anon'))).status, 401)
    const unavailable = await myProducts.fetch(request('outage'))
    assert.equal(unavailable.status, 503)
    assert.doesNotMatch(JSON.stringify(await unavailable.json()), /private detail/)
    assert.equal((await myProducts.fetch(request('account-a'))).status, 200)
    assert.equal((await myProducts.fetch(request('account-b'))).status, 200)
    assert.equal(queries.length, 2)
    assert.equal(queries[0].searchParams.get('owner_id'), 'eq.'+userA)
    assert.equal(queries[1].searchParams.get('owner_id'), 'eq.'+userB)
    for (const query of queries) {
      assert.equal(query.searchParams.get('limit'), '100')
      assert.equal(query.searchParams.get('order'), 'created_at.desc')
    }
    await assert.rejects(requireArtisan(new Request('https://app.test', { headers: {Authorization:'Basic account-a'} })), (error: unknown) => error instanceof HttpError && error.status === 401)
  } finally {
    globalThis.fetch = originalFetch
    for (const [name,value] of [['SUPABASE_URL',oldEnv.url],['SUPABASE_SECRET_KEY',oldEnv.key],['VITE_SUPABASE_URL',oldEnv.publicUrl]]) {
      if (value === undefined) delete process.env[name!]
      else process.env[name!] = value
    }
  }
})
