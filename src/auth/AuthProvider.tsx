import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { getBrowserSupabase } from '../lib/supabase'
import { authRedirectInfo, cleanAuthUrl } from './navigation'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [redirect] = useState(() => authRedirectInfo(window.location.href))
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [callbackError, setCallbackError] = useState(redirect.failed)

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}
    void (async () => {
      try {
        const client = getBrowserSupabase()
        const { data } = client.auth.onAuthStateChange((_event, next) => {
          // Keep this callback synchronous: another SDK auth call here can deadlock.
          if (active) setSession(next)
        })
        unsubscribe = () => data.subscription.unsubscribe()
        const initialized = await client.auth.initialize()
        if (!active) return
        if (initialized.error && redirect.received) setCallbackError(true)
        else if (initialized.error) setError('Could not restore your account. Check your connection and reload.')
        const result = await client.auth.getSession()
        if (!active) return
        if (result.error) setError('Could not restore your account. Check your connection and reload.')
        setSession(result.data.session)
      } catch {
        if (active) setError('Account services are unavailable. Check your connection and configuration, then reload.')
      } finally {
        if (active) {
          // Let the SDK process confirmation credentials before cleaning the address.
          if (redirect.received) window.history.replaceState(null, '', cleanAuthUrl(window.location.href))
          setLoading(false)
        }
      }
    })()
    return () => { active = false; unsubscribe() }
  }, [redirect])

  async function signOut() {
    const { error } = await getBrowserSupabase().auth.signOut({ scope: 'local' })
    if (error) throw new Error('Could not sign out. Check your connection and try again.')
    setSession(null)
  }

  return <AuthContext.Provider value={{ session, loading, error, redirect, callbackError, signOut }}>{children}</AuthContext.Provider>
}
