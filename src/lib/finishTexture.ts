import { validateImageFile } from './uploadRules.ts'

// One color map per finish. Keep its GPU memory reasonable on phones.
export async function prepareFinishTexture(file: File): Promise<File> {
  validateImageFile(file)
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('This image could not be read. Choose another JPEG, PNG, or WebP.'))
      image.src = objectUrl
    })
    const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight))
    if (scale === 1) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare this texture. Try a smaller image.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not prepare this texture.')), 'image/webp', 0.88)
    })
    const extension = blob.type === 'image/webp' ? 'webp' : 'png'
    const prepared = new File([blob], `finish.${extension}`, { type: blob.type })
    validateImageFile(prepared)
    return prepared
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
