import { requireArtisan } from '../server/auth.ts'
import { errorResponse, json, methodNotAllowed, readJson } from '../server/http.ts'
import { fetchProfile, saveProfile, validateProfile } from '../server/profiles.ts'

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET' && request.method !== 'PUT') return methodNotAllowed('GET, PUT')
    try {
      const userId = await requireArtisan(request)
      const profile = request.method === 'GET' ? await fetchProfile(userId)
        : await saveProfile(userId, validateProfile(await readJson(request)))
      return json({ profile })
    } catch (error) { return errorResponse(error) }
  },
}
