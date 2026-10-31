/**
 * Shrink a phone photo before upload: longest side 1600px, WebP ~80%.
 * A 4 MB camera photo usually ends up around 150–300 KB, so uploads stay fast
 * on 4G and the site stays light for customers.
 */
export async function compressPhoto(file: File, maxSide = 1600, quality = 0.8): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo (JPG, PNG or WebP).')
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) throw new Error('This photo could not be opened. Try another one.')
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser cannot process photos.')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', quality))
  if (!blob) throw new Error('Could not compress the photo.')
  return blob
}
