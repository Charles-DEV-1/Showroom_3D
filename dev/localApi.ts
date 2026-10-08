import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import createProduct from '../api/products/index.ts'
import getProduct from '../api/products/[id].ts'
import uploadImage from '../api/uploads.ts'
import myProducts from '../api/me/products.ts'
import profile from '../api/profile.ts'
import { errorResponse, HttpError, json } from '../server/http.ts'

async function webRequest(request: IncomingMessage): Promise<Request> {
  const headers = new Headers()
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(name, item))
    else if (value !== undefined) headers.set(name, value)
  }
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += buffer.length
    if (bytes > 128 * 1024) throw new HttpError(413, 'JSON request is too large.')
    chunks.push(buffer)
  }
  const method = request.method ?? 'GET'
  return new Request(new URL(request.url ?? '/', 'http://localhost'), {
    method, headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks).toString('utf8'),
  })
}

async function send(response: Response, target: ServerResponse) {
  target.statusCode = response.status
  response.headers.forEach((value, name) => target.setHeader(name, value))
  target.end(Buffer.from(await response.arrayBuffer()))
}

// Development only: use Vite's existing server to run the exact same handlers
// deployed as Vercel Functions. This is never included in the browser bundle.
export function localApi(env: Record<string, string>): Plugin {
  return {
    name: 'showroom-local-api',
    apply: 'serve',
    configureServer(server) {
      for (const name of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'VITE_SUPABASE_URL']) {
        if (env[name] && !process.env[name]) process.env[name] = env[name]
      }
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(/\/+$/, '')
        if (pathname !== '/api' && !pathname.startsWith('/api/')) return next()
        const handler = pathname === '/api/products' ? createProduct
          : /^\/api\/products\/[^/]+$/.test(pathname) ? getProduct
          : pathname === '/api/uploads' ? uploadImage
          : pathname === '/api/me/products' ? myProducts
          : pathname === '/api/profile' ? profile : undefined

        void (async () => {
          try {
            const result = handler ? await handler.fetch(await webRequest(request))
              : json({ error: 'API endpoint not found.' }, 404)
            await send(result, response)
          } catch (error) { await send(errorResponse(error), response) }
        })()
      })
    },
  }
}
