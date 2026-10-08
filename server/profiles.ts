import type { ArtisanProfile, ProfileInput } from '../src/types/profile.ts'
import { sanitizeWhatsApp } from '../src/lib/whatsapp.ts'
import { HttpError } from './http.ts'
import { getSupabase } from './supabase.ts'

export function validateProfile(value: unknown): ProfileInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Profile must be an object.')
  const data = value as Record<string, unknown>
  if (Object.keys(data).some(key => key !== 'displayName' && key !== 'whatsapp')) throw new HttpError(400, 'Only display name and WhatsApp number can be changed.')
  if (typeof data.displayName !== 'string' || !data.displayName.trim() || data.displayName.trim().length > 80) throw new HttpError(400, 'Display name must be 1–80 characters.')
  if (typeof data.whatsapp !== 'string' || data.whatsapp.length > 40) throw new HttpError(400, 'Enter your WhatsApp number including country code.')
  let whatsapp: string
  try { whatsapp = sanitizeWhatsApp(data.whatsapp) }
  catch { throw new HttpError(400, 'Enter a valid WhatsApp number including country code, for example +234.') }
  return { displayName: data.displayName.trim(), whatsapp }
}

type ProfileRow = { display_name: string; whatsapp: string; updated_at: string }
const columns = 'display_name,whatsapp,updated_at'
const fromRow = (row: ProfileRow): ArtisanProfile => ({ displayName: row.display_name, whatsapp: row.whatsapp, updatedAt: row.updated_at })
function unavailable(code?: string): never {
  if (code === 'PGRST205' || code === '42P01') throw new HttpError(503, 'Profile services are not ready. Please try again later.')
  throw new HttpError(503, 'Your profile could not be stored or loaded. Please try again shortly.')
}

export async function fetchProfile(userId: string): Promise<ArtisanProfile | null> {
  const { data, error } = await getSupabase().from('profiles').select(columns).eq('id', userId).maybeSingle()
  if (error) unavailable(error.code)
  return data ? fromRow(data as ProfileRow) : null
}

export async function saveProfile(userId: string, input: ProfileInput): Promise<ArtisanProfile> {
  const { data, error } = await getSupabase().from('profiles').upsert({ id: userId,
    display_name: input.displayName, whatsapp: input.whatsapp, updated_at: new Date().toISOString(),
  }, { onConflict: 'id' }).select(columns).single()
  if (error) unavailable(error.code)
  return fromRow(data as ProfileRow)
}
