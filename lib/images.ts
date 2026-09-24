import 'server-only'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

/**
 * Imágenes privadas de los drops.
 *
 * Viven en storage/drops/<slug>/ y NO en public/: todo lo que está en public/ lo puede
 * descargar cualquiera con la URL. Aquí, la única forma de verlas es a través de
 * /api/imagenes/[id], que decide si entregar la imagen real o el spoiler difuminado.
 *
 * El spoiler se genera EN EL SERVIDOR (reducido y difuminado). Si solo pusiéramos un
 * `filter: blur()` en CSS, bastaría con "Inspeccionar elemento" para ver la foto real.
 */

const STORAGE_ROOT = path.join(process.cwd(), 'storage', 'drops')
const IMAGE_FILE = /^[\w-]+\.(png|jpe?g|webp|avif)$/i

function safePath(dropSlug: string, imageKey: string): string {
  if (!/^[a-z0-9-]+$/.test(dropSlug) || !IMAGE_FILE.test(imageKey)) {
    throw new Error('Ruta de imagen inválida')
  }
  const resolved = path.join(STORAGE_ROOT, dropSlug, imageKey)
  // Defensa extra contra "path traversal" (../../etc/passwd).
  if (!resolved.startsWith(STORAGE_ROOT + path.sep)) throw new Error('Ruta de imagen inválida')
  return resolved
}

export async function readProductImage(dropSlug: string, imageKey: string) {
  const source = await readFile(safePath(dropSlug, imageKey))
  // Normalizamos a WebP y limitamos el tamaño: carga más rápido en móviles.
  return sharp(source)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()
}

export async function readSpoilerImage(dropSlug: string, imageKey: string) {
  const source = await readFile(safePath(dropSlug, imageKey))
  // Muy pequeña + difuminado fuerte = imposible recuperar el detalle, aunque se descargue.
  return sharp(source)
    .resize({ width: 360, withoutEnlargement: true })
    .blur(18)
    .modulate({ saturation: 0.6 })
    .webp({ quality: 60 })
    .toBuffer()
}

/** Lista las imágenes disponibles para un drop (para el selector del panel de admin). */
export async function listDropImages(dropSlug: string): Promise<string[]> {
  if (!/^[a-z0-9-]+$/.test(dropSlug)) return []
  try {
    const files = await readdir(path.join(STORAGE_ROOT, dropSlug))
    return files.filter((f) => IMAGE_FILE.test(f)).sort()
  } catch {
    return [] // la carpeta aún no existe
  }
}
