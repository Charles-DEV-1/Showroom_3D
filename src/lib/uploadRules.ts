export const IMAGE_BUCKET = 'product-images'
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const IMAGE_TYPES = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
} as const

export function validateImageFile(file: { name: string; size: number; type: string }) {
  const extensions = Object.hasOwn(IMAGE_TYPES, file.type)
    ? IMAGE_TYPES[file.type as keyof typeof IMAGE_TYPES] as readonly string[] : undefined
  const extension = file.name.toLowerCase().split('.').at(-1)
  if (!extensions || !extension || !extensions.includes(extension)) {
    throw new Error('Choose a JPEG, PNG, or WebP image with a matching file extension.')
  }
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error('Images must be larger than 0 bytes and no larger than 2 MiB.')
  }
  return extension
}
