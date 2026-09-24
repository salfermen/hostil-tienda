import { db } from '@/lib/db'
import { getCurrentDrop, getDropAccess } from '@/lib/drops/queries'
import { isAdmin } from '@/lib/auth/session'
import { readProductImage, readSpoilerImage } from '@/lib/images'

/**
 * GET /api/imagenes/:productId            → imagen real (solo con acceso al drop)
 * GET /api/imagenes/:productId?v=spoiler  → versión difuminada (pública mientras el drop está activo)
 */
export async function GET(request: Request, context: RouteContext<'/api/imagenes/[productId]'>) {
  const { productId } = await context.params
  const wantsSpoiler = new URL(request.url).searchParams.get('v') === 'spoiler'

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { imageKey: true, showInTeaser: true, drop: { select: { id: true, slug: true } } },
  })
  if (!product) return notFound()

  const admin = await isAdmin()
  const current = await getCurrentDrop()
  const belongsToCurrentDrop = current?.id === product.drop.id

  try {
    if (wantsSpoiler) {
      const isPublicSpoiler = belongsToCurrentDrop && product.showInTeaser
      if (!admin && !isPublicSpoiler) return notFound()
      const image = await readSpoilerImage(product.drop.slug, product.imageKey)
      // Un spoiler público es igual para todos: el CDN de Vercel lo puede guardar en caché.
      // Si solo lo ve el admin (drop en borrador), no debe quedar en ningún caché compartido.
      const cache = isPublicSpoiler ? 'public, max-age=300, s-maxage=3600' : 'private, no-store'
      return imageResponse(image, cache)
    }

    const allowed = admin || (current && belongsToCurrentDrop && (await getDropAccess(current)))
    if (!allowed) return new Response('Acceso restringido', { status: 403 })
    const image = await readProductImage(product.drop.slug, product.imageKey)
    // La imagen real es privada: el navegador puede guardarla, pero nunca un caché compartido.
    return imageResponse(image, 'private, max-age=600')
  } catch (error) {
    console.error('[imagenes] No se pudo leer la imagen', productId, error)
    return notFound()
  }
}

function imageResponse(body: Buffer, cacheControl: string) {
  return new Response(new Uint8Array(body), {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': cacheControl },
  })
}

function notFound() {
  return new Response('No encontrado', { status: 404 })
}
