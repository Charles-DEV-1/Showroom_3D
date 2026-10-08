import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { navigate } from './navigation'

export default function RequireArtisan({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const next = window.location.pathname.replace(/\/+$/, '')
  useEffect(() => {
    if (!auth.loading && !auth.error && !auth.session) navigate(`/login?next=${encodeURIComponent(next)}`, true)
  }, [auth.loading, auth.error, auth.session, next])
  if (auth.error) return <main className="page-message"><p role="alert">{auth.error}</p><button className="button-primary" onClick={() => window.location.reload()}>Retry</button></main>
  if (auth.loading || !auth.session) return <main className="page-message" role="status">Checking your account…</main>
  return children
}
