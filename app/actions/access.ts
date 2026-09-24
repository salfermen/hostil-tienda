'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { hashAccessCode, isWellFormedCode, normalizeAccessCode } from '@/lib/auth/codes'
import { clearAccessSession, createAccessSession } from '@/lib/auth/session'
import { clearFailures, getClientIp, isRateLimited, recordFailure } from '@/lib/auth/rate-limit'
import { getCurrentDrop } from '@/lib/drops/queries'
import { sendCodeToUser } from '@/lib/drops/access-codes'
import { accessSchema, firstError, registerSchema } from '@/lib/validation'

/**
 * Server Actions públicas: registro, entrada con código y salida.
 *
 * Importante: una Server Action es un endpoint HTTP público. Cualquiera puede llamarla
 * con datos inventados, por eso validamos todo aquí aunque el formulario ya valide.
 */

export type FormState = { ok: boolean; message: string } | null

/**
 * Registro (o "reenviarme el código" si ya estaba registrado).
 * La respuesta es la misma exista o no el correo: así nadie puede averiguar quién está registrado.
 */
export async function requestAccessAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name') ?? undefined,
    consent: formData.get('consent'),
  })
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) }
  const { email, name } = parsed.data

  const user = await db.user.upsert({
    where: { email },
    create: { email, name, consentAt: new Date() },
    // Si ya existía, solo completamos el nombre si antes no lo tenía.
    update: name ? { name } : {},
    select: { id: true },
  })

  const drop = await getCurrentDrop()
  if (drop?.status === 'LIVE') {
    const outcome = await sendCodeToUser(user.id, drop)
    if (outcome === 'throttled') {
      return {
        ok: true,
        message:
          'Ya te enviamos un código hace un momento. Revisa tu correo (y la carpeta de spam).',
      }
    }
    if (outcome === 'failed') {
      return {
        ok: false,
        message: 'No pudimos enviar el correo. Intenta de nuevo en unos minutos.',
      }
    }
    return {
      ok: true,
      message:
        'Listo. Si tu correo está habilitado, te llegó tu código personal para entrar al drop.',
    }
  }

  return {
    ok: true,
    message: 'Listo. Bienvenido a la resistencia: el día del drop te llega tu código al correo.',
  }
}

/** Entrada al drop con correo + código personal. */
export async function enterWithCodeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = accessSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
  })
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) }
  const { email } = parsed.data
  const code = normalizeAccessCode(parsed.data.code)

  const ip = await getClientIp()
  const scope = `code:${email}`
  if (await isRateLimited(scope, ip)) {
    return { ok: false, message: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' }
  }

  const drop = await getCurrentDrop()
  if (!drop || drop.status !== 'LIVE') {
    return { ok: false, message: 'No hay un drop abierto en este momento.' }
  }

  const token = isWellFormedCode(code)
    ? await db.accessToken.findUnique({
        where: { tokenHash: hashAccessCode(code, env().AUTH_SECRET) },
        select: {
          id: true,
          dropId: true,
          revokedAt: true,
          firstUsedAt: true,
          user: { select: { email: true, status: true } },
        },
      })
    : null

  const valid =
    token &&
    token.dropId === drop.id &&
    !token.revokedAt &&
    token.user.email === email &&
    token.user.status === 'ACTIVE'

  if (!valid) {
    await recordFailure(scope, ip)
    return { ok: false, message: 'El correo o el código no coinciden con este drop.' }
  }

  const now = new Date()
  await db.accessToken.update({
    where: { id: token.id },
    data: { firstUsedAt: token.firstUsedAt ?? now, lastUsedAt: now, useCount: { increment: 1 } },
  })
  await clearFailures(scope)
  await createAccessSession(token.id, drop.id)
  redirect('/')
}

export async function logoutAction() {
  await clearAccessSession()
  redirect('/drop')
}
