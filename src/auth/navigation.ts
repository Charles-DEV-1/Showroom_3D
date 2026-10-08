const credentialKeys = ['access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type',
  'provider_token', 'provider_refresh_token', 'type', 'error', 'error_code', 'error_description', 'code', 'token_hash']

export function authRedirectInfo(href: string) {
  const url = new URL(href)
  const params = new URLSearchParams(url.hash.slice(1))
  url.searchParams.forEach((value, key) => params.set(key, value))
  return {
    received: credentialKeys.some(key => params.has(key)),
    failed: ['error', 'error_code', 'error_description'].some(key => params.has(key)),
  }
}

export function cleanAuthUrl(href: string) {
  const url = new URL(href)
  credentialKeys.forEach(key => url.searchParams.delete(key))
  const hash = new URLSearchParams(url.hash.slice(1))
  if (credentialKeys.some(key => hash.has(key))) url.hash = ''
  return `${url.pathname}${url.search}${url.hash}`
}

export function authDestination(search: string) {
  const next = new URLSearchParams(search).get('next')
  // Only known workspace routes, never an arbitrary redirect supplied by a link.
  return next === '/builder' || next === '/my-products' || next === '/profile' ? next : '/builder'
}

export function navigate(path: string, replace = false) {
  if (replace) window.history.replaceState(null, '', path)
  else window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function authErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
  if (code === 'invalid_credentials') return 'Email or password is incorrect.'
  if (code === 'email_not_confirmed') return 'Confirm your email before signing in. Check your inbox and spam folder.'
  if (code === 'weak_password') return 'Choose a stronger password with at least 8 characters.'
  if (code === 'signup_disabled') return 'New accounts are temporarily unavailable.'
  if (code === 'user_already_exists') return 'You may already have an account. Try signing in.'
  if (code === 'email_address_invalid') return 'Enter a valid email address.'
  if (typeof code === 'string' && (code.includes('rate_limit') || code === 'over_request_rate_limit')) {
    return 'Too many attempts. Wait a little before trying again.'
  }
  if (code === 'email_address_not_authorized' || code === 'unexpected_failure' || code === 'email_provider_disabled') {
    return 'Email delivery is unavailable. Please try again later.'
  }
  return 'The account request could not complete. Check your connection and try again.'
}
