export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(data, {
    status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders },
  })
}

export function methodNotAllowed(method: string) {
  return json({ error: `Use ${method} for this endpoint.` }, 405, { Allow: method })
}

export async function readJson(request: Request): Promise<unknown> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'Send the request as application/json.')
  }
  const body = await request.text()
  if (Buffer.byteLength(body, 'utf8') > 128 * 1024) throw new HttpError(413, 'JSON request is too large.')
  try { return JSON.parse(body) } catch { throw new HttpError(400, 'Request body must contain valid JSON.') }
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status)
  // Never return raw Supabase errors, stack traces or credentials to a browser.
  return json({ error: 'The request could not be completed. Try again shortly.' }, 500)
}
