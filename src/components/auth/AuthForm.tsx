import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../../auth/useAuth'
import { authDestination, authErrorMessage, navigate } from '../../auth/navigation'
import { getBrowserSupabase } from '../../lib/supabase'
import './AuthForm.css'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const busy = useRef(false)
  const signup = mode === 'signup'
  const destination = authDestination(window.location.search)
  const reauthenticate = !signup && new URLSearchParams(window.location.search).get('reauth') === '1'

  useEffect(() => {
    if (!auth.loading && auth.session && !reauthenticate) navigate(destination, true)
  }, [auth.loading, auth.session, destination, reauthenticate])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    setError(''); setMessage('')
    if (signup && password !== confirmation) { setError('The passwords do not match.'); return }
    busy.current = true; setPending(true)
    try {
      const client = getBrowserSupabase()
      if (signup) {
        const { data, error } = await client.auth.signUp({ email: email.trim(), password,
          options: { emailRedirectTo: window.location.origin + '/auth/callback' } })
        if (error) throw error
        setPassword(''); setConfirmation('')
        if (data.session) navigate(destination, true)
        else setMessage('Check your email for a confirmation link before signing in. If you already have an account, sign in instead.')
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        setPassword('')
        navigate(destination, true)
      }
    } catch (failure) { setError(authErrorMessage(failure)) }
    finally { busy.current = false; setPending(false) }
  }

  if (auth.loading) return <main className="page-message" role="status">Checking your account...</main>
  if (auth.error) return <main className="page-message"><h1>Account service unavailable.</h1><p role="alert">{auth.error}</p><button className="button-primary" onClick={() => window.location.reload()}>Retry</button></main>

  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title">
    <p className="eyebrow">YOUR ARTISAN WORKSPACE</p><h1 id="auth-title">{signup ? 'Create your artisan account.' : 'Welcome back.'}</h1><p className="auth-intro">{signup ? 'Start with your email and a password.' : 'Sign in to your artisan account.'}</p>
    <form onSubmit={submit}>
      <fieldset disabled={pending} className="form-fields">
        <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setMessage('') }} /></label>
        <label className="field"><span>Password</span><input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} value={password} onChange={event => setPassword(event.target.value)} /></label>
        {signup && <label className="field"><span>Confirm password</span><input name="confirmation" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {message && <p className="auth-success" role="status">{message}</p>}
        <button className="button-primary auth-submit" type="submit" disabled={pending || (signup && !!message)}>{pending ? 'Please wait...' : signup ? 'Create account' : 'Sign in'}</button>
      </fieldset>
    </form>
    <div className="auth-links">
      {signup ? <span>Already have an account? <a href="/login">Sign in</a></span> : <span>New here? <a href="/signup">Create an account</a></span>}
    </div>
    <a className="auth-return" href="/">Back to ShowRoom 3D</a>
  </section></main>
}
