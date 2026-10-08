import { errorResponse, json, methodNotAllowed, readJson } from '../../server/http.ts'
import { saveProduct } from '../../server/products.ts'
import { supabaseUrl } from '../../server/supabase.ts'
import { validateProduct } from '../../server/validation.ts'
import { requireArtisan } from '../../server/auth.ts'

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return methodNotAllowed('POST')
    try {
      const ownerId = await requireArtisan(request)
      const product = validateProduct(await readJson(request), supabaseUrl(), ownerId)
      return json(await saveProduct(product, ownerId), 201)
    } catch (error) { return errorResponse(error) }
  },
}
