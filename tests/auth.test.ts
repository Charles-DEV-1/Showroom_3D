import test from 'node:test'
import assert from 'node:assert/strict'
import { authDestination, authRedirectInfo, cleanAuthUrl, authErrorMessage } from '../src/auth/navigation.ts'

test('confirmation credentials are recognized and scrubbed without retaining their values', () => {
  const href = 'http://localhost:5173/auth/callback?utm_source=demo#access_token=secret-access&refresh_token=secret-refresh&expires_in=3600&type=signup'
  assert.deepEqual(authRedirectInfo(href), { received: true, failed: false })
  assert.equal(cleanAuthUrl(href), '/auth/callback?utm_source=demo')
  assert.equal(cleanAuthUrl('http://localhost:5173/auth/callback?code=sensitive&error_description=private&utm_source=demo'), '/auth/callback?utm_source=demo')
})

test('expired confirmation links stay failures and ordinary buyer configuration is preserved', () => {
  assert.deepEqual(authRedirectInfo('http://localhost:5173/auth/callback#error=access_denied&error_code=otp_expired'), { received: true, failed: true })
  const ordinary = 'http://localhost:5173/product/abc?finish=marble&secondary=charcoal#details'
  assert.deepEqual(authRedirectInfo(ordinary), { received: false, failed: false })
  assert.equal(cleanAuthUrl(ordinary), '/product/abc?finish=marble&secondary=charcoal#details')
})

test('auth navigation cannot redirect to an external or unimplemented route', () => {
  for (const next of ['https://evil.example', '//evil.example', '/api/products', '/unknown', '/builder?next=https://evil.example']) {
    assert.equal(authDestination('?next=' + encodeURIComponent(next)), '/builder')
  }
  assert.equal(authDestination('?next=%2Fbuilder'), '/builder')
  assert.equal(authDestination('?next=%2Fmy-products'), '/my-products')
  assert.equal(authDestination('?next=%2Fprofile'), '/profile')
})

test('auth errors give useful messages without displaying provider internals', () => {
  assert.match(authErrorMessage({ code: 'invalid_credentials' }), /incorrect/)
  assert.match(authErrorMessage({ code: 'email_not_confirmed' }), /Confirm/)
  assert.match(authErrorMessage({ code: 'over_email_send_rate_limit' }), /Wait/)
  assert.match(authErrorMessage({ code: 'email_address_not_authorized' }), /delivery/)
  assert.doesNotMatch(authErrorMessage({ message: 'private provider detail' }), /private/)
})
