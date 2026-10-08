import { requireArtisan } from '../../server/auth.ts'
import { fetchMyProducts } from '../../server/products.ts'
import { errorResponse, json, methodNotAllowed } from '../../server/http.ts'

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    try {
      const ownerId = await requireArtisan(request)
      return json({ products: await fetchMyProducts(ownerId) })
    } catch (error) { return errorResponse(error) }
  },
}
