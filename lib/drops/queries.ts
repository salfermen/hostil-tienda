import 'server-only'
import { cache } from 'react'
import { connection } from 'next/server'
import { db } from '@/lib/db'
import { effectiveStatus, locksSite } from '@/lib/drops/status'
import { isAdmin, readAccessSession } from '@/lib/auth/session'

/**
 * Capa de acceso a datos (DAL) de los drops.
 *
 * Toda decisión de "¿puede esta persona ver esto?" pasa por aquí, en el servidor.
 * `cache()` de React evita repetir la misma consulta varias veces en una misma petición.
 */

/** El drop que bloquea el sitio ahora mismo (TEASER o LIVE), o null si no hay ninguno. */
export const getCurrentDrop = cache(async () => {
  // Sin esto, Next podría "congelar" la página en el build (HTML estático) y el bloqueo
  // no reaccionaría al lanzar un drop. connection() obliga a decidir en cada visita.
  await connection()
  const drop = await db.drop.findFirst({
    where: { status: { in: ['TEASER', 'LIVE'] } },
    orderBy: { launchAt: 'desc' },
  })
  if (!drop || !locksSite(drop)) return null
  return { ...drop, status: effectiveStatus(drop) }
})

export type CurrentDrop = NonNullable<Awaited<ReturnType<typeof getCurrentDrop>>>

export type DropAccess =
  { via: 'code'; tokenId: string; userName: string | null } | { via: 'admin' }

/**
 * ¿El visitante puede entrar al drop? Verifica la cookie Y la base de datos
 * (así, si revocas un código desde el admin, la persona pierde el acceso de inmediato).
 */
export const getDropAccess = cache(async (drop: CurrentDrop): Promise<DropAccess | null> => {
  if (await isAdmin()) return { via: 'admin' }
  if (drop.status !== 'LIVE') return null

  const session = await readAccessSession()
  if (!session || session.dropId !== drop.id) return null

  const token = await db.accessToken.findUnique({
    where: { id: session.tokenId },
    select: {
      id: true,
      dropId: true,
      revokedAt: true,
      user: { select: { name: true, status: true } },
    },
  })
  if (!token || token.dropId !== drop.id || token.revokedAt || token.user.status !== 'ACTIVE') {
    return null
  }
  return { via: 'code', tokenId: token.id, userName: token.user.name }
})

/** Productos que se muestran difuminados en la pantalla de spoilers. */
export async function getTeaserProducts(dropId: string) {
  return db.product.findMany({
    where: { dropId, showInTeaser: true },
    orderBy: { sortOrder: 'asc' },
    // Solo el id: ni el nombre ni el precio deben filtrarse antes del lanzamiento.
    select: { id: true },
  })
}

/** Productos completos: solo llamar después de comprobar el acceso. */
export async function getDropProducts(dropId: string) {
  return db.product.findMany({
    where: { dropId },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, description: true, priceCop: true, tag: true },
  })
}
