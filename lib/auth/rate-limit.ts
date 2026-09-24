import 'server-only'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

/**
 * Límite de intentos fallidos, guardado en PostgreSQL.
 *
 * Por qué en la base de datos y no en memoria: en Vercel cada petición puede caer en una
 * instancia distinta del servidor, así que un contador en memoria no serviría.
 * Para volúmenes grandes se podría pasar a Redis (Upstash), pero para un MVP esto basta.
 */

const WINDOW_MINUTES = 15
const MAX_FAILURES_PER_SCOPE = 5 // p. ej. 5 códigos erróneos para el mismo correo
const MAX_FAILURES_PER_IP = 20

export async function getClientIp(): Promise<string> {
  const h = await headers()
  // Vercel pone la IP real del visitante como primer valor de x-forwarded-for.
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'desconocida'
}

export async function isRateLimited(scope: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)
  const [byScope, byIp] = await Promise.all([
    db.loginAttempt.count({ where: { scope, createdAt: { gte: since } } }),
    db.loginAttempt.count({ where: { ip, createdAt: { gte: since } } }),
  ])
  return byScope >= MAX_FAILURES_PER_SCOPE || byIp >= MAX_FAILURES_PER_IP
}

export async function recordFailure(scope: string, ip: string) {
  await db.loginAttempt.create({ data: { scope, ip } })
}

export async function clearFailures(scope: string) {
  await db.loginAttempt.deleteMany({ where: { scope } })
}

/** Limpieza opcional: borra intentos viejos (se llama al lanzar un drop). */
export async function pruneOldAttempts() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  await db.loginAttempt.deleteMany({ where: { createdAt: { lt: cutoff } } })
}
