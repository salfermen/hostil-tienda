'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { isValidAdminPassword, requireAdmin } from '@/lib/auth/admin'
import { clearAdminSession, createAdminSession } from '@/lib/auth/session'
import {
  clearFailures,
  getClientIp,
  isRateLimited,
  pruneOldAttempts,
  recordFailure,
} from '@/lib/auth/rate-limit'
import { canTransition, statusLabels } from '@/lib/drops/status'
import { sendPendingCodes } from '@/lib/drops/access-codes'
import { parseBogotaDateTime } from '@/lib/format'
import { dropSchema, firstError, productSchema } from '@/lib/validation'
import type { DropStatus } from '@/lib/generated/prisma/enums'
import type { FormState } from '@/app/actions/access'

/**
 * Acciones del panel de admin. TODAS empiezan con `requireAdmin()`:
 * que un botón solo aparezca en el panel no impide que alguien llame a la acción directamente.
 */

const dropUrl = (id: string, msg?: string) =>
  `/admin/drops/${id}${msg ? `?msg=${encodeURIComponent(msg)}` : ''}`

// ---------- Sesión ----------

export async function adminLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await getClientIp()
  if (await isRateLimited('admin', ip)) {
    return { ok: false, message: 'Demasiados intentos. Espera 15 minutos.' }
  }
  const password = String(formData.get('password') ?? '')
  if (!isValidAdminPassword(password)) {
    await recordFailure('admin', ip)
    return { ok: false, message: 'Contraseña incorrecta.' }
  }
  await clearFailures('admin')
  await createAdminSession()
  redirect('/admin')
}

export async function adminLogoutAction() {
  await clearAdminSession()
  redirect('/admin/login')
}

// ---------- Drops ----------

function parseDropForm(formData: FormData) {
  const parsed = dropSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: firstError(parsed.error) } as const
  const launchAt = parseBogotaDateTime(parsed.data.launchAt)
  const endsAt = parsed.data.endsAt ? parseBogotaDateTime(parsed.data.endsAt) : null
  if (!launchAt) return { error: 'La fecha de lanzamiento no es válida.' } as const
  if (parsed.data.endsAt && !endsAt) return { error: 'La fecha de cierre no es válida.' } as const
  if (endsAt && endsAt <= launchAt)
    return { error: 'El cierre debe ser después del lanzamiento.' } as const
  return { data: { ...parsed.data, launchAt, endsAt } } as const
}

export async function createDropAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin()
  const result = parseDropForm(formData)
  if ('error' in result) return { ok: false, message: result.error! }

  const exists = await db.drop.findUnique({
    where: { slug: result.data.slug },
    select: { id: true },
  })
  if (exists) return { ok: false, message: 'Ya existe un drop con ese slug.' }

  const drop = await db.drop.create({ data: result.data, select: { id: true } })
  redirect(dropUrl(drop.id, 'Drop creado en borrador. Agrega productos antes de anunciarlo.'))
}

export async function updateDropAction(
  dropId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()
  const result = parseDropForm(formData)
  if ('error' in result) return { ok: false, message: result.error! }

  const clash = await db.drop.findFirst({
    where: { slug: result.data.slug, NOT: { id: dropId } },
    select: { id: true },
  })
  if (clash) return { ok: false, message: 'Ya existe otro drop con ese slug.' }

  await db.drop.update({ where: { id: dropId }, data: result.data })
  revalidatePath(`/admin/drops/${dropId}`)
  return { ok: true, message: 'Cambios guardados.' }
}

/**
 * Cambia el estado de un drop. Pasar a LIVE también genera y envía los códigos
 * a todos los registrados (esto es "lanzar el drop").
 */
export async function setDropStatusAction(dropId: string, next: DropStatus) {
  await requireAdmin()
  const drop = await db.drop.findUniqueOrThrow({
    where: { id: dropId },
    select: { status: true, _count: { select: { products: true } } },
  })

  if (!canTransition(drop.status, next)) {
    redirect(
      dropUrl(dropId, `No se puede pasar de ${statusLabels[drop.status]} a ${statusLabels[next]}.`),
    )
  }
  if ((next === 'TEASER' || next === 'LIVE') && drop._count.products === 0) {
    redirect(dropUrl(dropId, 'Agrega al menos un producto antes de anunciar o lanzar el drop.'))
  }
  if (next === 'TEASER' || next === 'LIVE') {
    // Regla de negocio: solo un drop activo a la vez (es el que bloquea el sitio).
    const other = await db.drop.findFirst({
      where: { status: { in: ['TEASER', 'LIVE'] }, NOT: { id: dropId } },
      select: { name: true },
    })
    if (other) redirect(dropUrl(dropId, `Primero cierra el drop activo: ${other.name}.`))
  }

  await db.drop.update({ where: { id: dropId }, data: { status: next } })

  let message = `Estado cambiado a ${statusLabels[next]}.`
  if (next === 'LIVE') {
    await pruneOldAttempts()
    const { sent, failed, remaining } = await sendPendingCodes(dropId)
    message = `Drop lanzado. Códigos enviados: ${sent}.`
    if (failed) message += ` Fallidos: ${failed}.`
    if (remaining) message += ` Pendientes: ${remaining} (pulsa "Enviar códigos pendientes").`
  }

  revalidatePath('/', 'layout')
  redirect(dropUrl(dropId, message))
}

export async function sendPendingCodesAction(dropId: string) {
  await requireAdmin()
  const drop = await db.drop.findUniqueOrThrow({ where: { id: dropId }, select: { status: true } })
  if (drop.status !== 'LIVE')
    redirect(dropUrl(dropId, 'Solo se envían códigos con el drop en vivo.'))

  const { sent, failed, remaining } = await sendPendingCodes(dropId)
  redirect(dropUrl(dropId, `Enviados: ${sent}. Fallidos: ${failed}. Pendientes: ${remaining}.`))
}

export async function deleteDropAction(dropId: string) {
  await requireAdmin()
  const drop = await db.drop.findUniqueOrThrow({ where: { id: dropId }, select: { status: true } })
  if (drop.status !== 'DRAFT') redirect(dropUrl(dropId, 'Solo se pueden borrar drops en borrador.'))
  await db.drop.delete({ where: { id: dropId } })
  redirect('/admin')
}

// ---------- Productos ----------

export async function createProductAction(
  dropId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()
  const parsed = productSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) }

  await db.product.create({ data: { ...parsed.data, dropId } })
  revalidatePath(`/admin/drops/${dropId}`)
  return { ok: true, message: `Producto "${parsed.data.name}" agregado.` }
}

export async function deleteProductAction(dropId: string, productId: string) {
  await requireAdmin()
  await db.product.delete({ where: { id: productId, dropId } })
  redirect(dropUrl(dropId, 'Producto eliminado.'))
}

// ---------- Códigos y usuarios ----------

export async function revokeTokenAction(dropId: string, tokenId: string) {
  await requireAdmin()
  await db.accessToken.update({ where: { id: tokenId, dropId }, data: { revokedAt: new Date() } })
  redirect(dropUrl(dropId, 'Código revocado. Esa persona ya no puede entrar a este drop.'))
}

export async function setUserStatusAction(userId: string, status: 'ACTIVE' | 'BLOCKED') {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { status } })
  revalidatePath('/admin')
}
