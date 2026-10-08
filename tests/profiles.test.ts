import test from 'node:test'
import assert from 'node:assert/strict'
import { validateProfile } from '../server/profiles.ts'
import profileEndpoint from '../api/profile.ts'
import { HttpError } from '../server/http.ts'

test('profile contact validation normalizes valid values and rejects local numbers or missing data', () => {
  assert.deepEqual(validateProfile({ displayName: '  Furniture studio  ', whatsapp: '+234 (801) 234-5678' }), { displayName: 'Furniture studio', whatsapp: '2348012345678' })
  for (const input of [null, [], {}, {displayName:' ',whatsapp:'2348012345678'}, {displayName:'x'.repeat(81),whatsapp:'2348012345678'}, {displayName:'Studio',whatsapp:'08012345678'}, {displayName:'Studio',whatsapp:123}]) {
    assert.throws(() => validateProfile(input), (error: unknown) => error instanceof HttpError && error.status === 400)
  }
})

test('profile inputs cannot choose identity or overwrite server timestamps', () => {
  for (const field of ['id','userId','owner_id','updatedAt','email']) {
    assert.throws(() => validateProfile({ displayName:'Studio', whatsapp:'2348012345678', [field]:'forged' }))
  }
})

test('profile reads and writes require authentication and unsupported methods are rejected', async () => {
  for (const method of ['GET','PUT']) {
    const request = new Request('https://app.test/api/profile', { method })
    assert.equal((await profileEndpoint.fetch(request)).status, 401)
  }
  const response = await profileEndpoint.fetch(new Request('https://app.test/api/profile', { method:'DELETE' }))
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('Allow'), 'GET, PUT')
})
