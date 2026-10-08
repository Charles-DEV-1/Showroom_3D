import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth'
import { navigate } from '../auth/navigation'
import '../components/auth/AuthForm.css'

export default function AuthCallbackPage() {
  const auth = useAuth()
  const valid = !auth.loading && !auth.error && !auth.callbackError && auth.redirect.received && !!auth.session
  useEffect(() => { if (valid) navigate('/builder', true) }, [valid])
  if (auth.loading || valid) return <main className="page-message" role="status">Confirming your account…</main>
  return <main className="auth-page"><section className="auth-card"><h1>We couldn’t confirm this link.</h1><p role="alert">{auth.error || 'The link is missing, expired or already used. Sign in if you already confirmed your email, or return to sign-up.'}</p><div className="button-row"><a className="button-primary" href="/login">Sign in</a><a className="button-small" href="/signup">Back to sign-up</a></div></section></main>
}
