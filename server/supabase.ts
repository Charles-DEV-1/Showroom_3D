import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { HttpError } from './http.ts'

let client: SupabaseClient | undefined

export function supabaseUrl() {
  const value = process.env.SUPABASE_URL?.trim()
  if (!value) throw new HttpError(503, 'Server Supabase URL is not configured.')
  let url: URL
  try { url = new URL(value) } catch { throw new HttpError(503, 'Server Supabase URL is invalid.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new HttpError(503, 'Configure the HTTPS Supabase project URL, without extra paths.')
  }
  if (process.env.VITE_SUPABASE_URL && new URL(process.env.VITE_SUPABASE_URL).origin !== url.origin) {
    throw new HttpError(503, 'Browser and server Supabase URLs must point to the same project.')
  }
  return url.origin
}

export function getSupabase() {
  if (client) return client
  const key = process.env.SUPABASE_SECRET_KEY?.trim()
  if (!key || key.startsWith('sb_publishable_')) {
    throw new HttpError(503, 'Configure the server-only Supabase secret key.')
  }
  client = createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(12000) }),
    },
  })
  return client
}
