import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { authRedirectInfo } from './navigation'

export type AuthState = {
  session: Session | null; loading: boolean; error: string;
  redirect: ReturnType<typeof authRedirectInfo>; callbackError: boolean;
  signOut: () => Promise<void>;
}
export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside AuthProvider.')
  return auth
}
