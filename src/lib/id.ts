// Stable draft IDs work on both localhost and a phone's HTTP Wi-Fi URL.
export function draftId(prefix: string) {
  const random = Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(36)).join('')
  return `${prefix}-${random}`
}
