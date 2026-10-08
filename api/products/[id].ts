import { errorResponse, HttpError, json, methodNotAllowed } from '../../server/http.ts'
import { fetchProduct } from '../../server/products.ts'
import { UUID_PATTERN } from '../../server/validation.ts'

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    try {
      const id = new URL(request.url).pathname.split('/').filter(Boolean).at(-1) ?? ''
      if (!UUID_PATTERN.test(id)) throw new HttpError(400, 'Product ID must be a valid UUID.')
      return json(await fetchProduct(id))
    } catch (error) { return errorResponse(error) }
  },
}
