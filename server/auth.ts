import { HttpError } from './http.ts'
import { getSupabase } from './supabase.ts'
import { UUID_PATTERN } from './validation.ts'

export async function requireArtisan(request: Request): Promise<string> {
  const header = request.headers.get('authorization')
  const match = header && /^Bearer ([^\s]+)$/i.exec(header)
  if (!match || match[1].length > 8192) throw new HttpError(401, 'Sign in to your artisan account to continue.')
  try {
    // getUser(token) checks with THIS project's Auth server and does not install
    // a user session on the service client or change its database Authorization.
    const { data, error } = await getSupabase().auth.getUser(match[1])
    if (error) {
      if (!error.status || error.status >= 500 || error.status === 429) {
        throw new HttpError(503, 'Account verification is unavailable. Please try again shortly.')
      }
      throw new HttpError(401, 'Your session is no longer valid. Sign in again to continue.')
    }
    if (!data.user || data.user.is_anonymous || !UUID_PATTERN.test(data.user.id)) {
      throw new HttpError(401, 'Sign in to a registered artisan account to continue.')
    }
    return data.user.id
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(503, 'Account verification is unavailable. Please try again shortly.')
  }
}
