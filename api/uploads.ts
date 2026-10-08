import { randomUUID } from 'node:crypto'
import { IMAGE_BUCKET } from '../src/lib/uploadRules.ts'
import { errorResponse, HttpError, json, methodNotAllowed, readJson } from '../server/http.ts'
import { getSupabase } from '../server/supabase.ts'
import { validateUpload } from '../server/validation.ts'
import { requireArtisan } from '../server/auth.ts'

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    try {
      const ownerId = await requireArtisan(request)
      const { extension } = validateUpload(await readJson(request))
      const path = `images/${ownerId}/${randomUUID()}.${extension}`
      const bucket = getSupabase().storage.from(IMAGE_BUCKET)
      const { data, error } = await bucket.createSignedUploadUrl(path, { upsert: false })
      if (error) throw new HttpError(503, 'Image storage is unavailable. Check the image bucket and server credentials.')
      return json({ path: data.path, token: data.token, publicUrl: bucket.getPublicUrl(path).data.publicUrl }, 201)
    } catch (error) { return errorResponse(error) }
  },
}
