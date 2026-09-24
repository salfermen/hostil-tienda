import 'server-only'
import { cookies } from 'next/headers'
import { env, isProduction } from '@/lib/env'
import { signPayload, verifyPayload } from '@/lib/auth/signed'

/**
 * Sesiones guardadas en cookies firmadas (httpOnly: el JavaScript del navegador no las lee).
 *
 * Hay dos tipos:
 *  - Acceso a un drop: se crea al entrar con un código válido. Vale solo para ESE drop.
 *  - Admin: se crea al entrar al panel con ADMIN_PASSWORD.
 */

const ACCESS_COOKIE = 'hostil_access'
const ADMIN_COOKIE = 'hostil_admin'

const ACCESS_MAX_AGE = 60 * 60 * 24 * 7 // 7 días
const ADMIN_MAX_AGE = 60 * 60 * 8 // 8 horas

export type AccessSession = { kind: 'access'; tokenId: string; dropId: string; exp: number }
type AdminSession = { kind: 'admin'; exp: number }

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
})

const nowSeconds = () => Math.floor(Date.now() / 1000)

export async function createAccessSession(tokenId: string, dropId: string) {
  const payload: AccessSession = {
    kind: 'access',
    tokenId,
    dropId,
    exp: nowSeconds() + ACCESS_MAX_AGE,
  }
  const store = await cookies()
  store.set(ACCESS_COOKIE, signPayload(payload, env().AUTH_SECRET), cookieOptions(ACCESS_MAX_AGE))
}

export async function readAccessSession(): Promise<AccessSession | null> {
  const store = await cookies()
  const payload = verifyPayload<AccessSession>(store.get(ACCESS_COOKIE)?.value, env().AUTH_SECRET)
  return payload?.kind === 'access' ? payload : null
}

export async function clearAccessSession() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
}

export async function createAdminSession() {
  const payload: AdminSession = { kind: 'admin', exp: nowSeconds() + ADMIN_MAX_AGE }
  const store = await cookies()
  store.set(ADMIN_COOKIE, signPayload(payload, env().AUTH_SECRET), cookieOptions(ADMIN_MAX_AGE))
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  const payload = verifyPayload<AdminSession>(store.get(ADMIN_COOKIE)?.value, env().AUTH_SECRET)
  return payload?.kind === 'admin'
}

export async function clearAdminSession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}
