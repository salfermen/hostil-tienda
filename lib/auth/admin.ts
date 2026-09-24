import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { redirect } from 'next/navigation'
import { env } from '@/lib/env'
import { isAdmin } from '@/lib/auth/session'

/**
 * Autenticación del panel de admin con una sola contraseña (ADMIN_PASSWORD).
 * Es suficiente mientras el equipo sea pequeño. Si más personas administran la tienda,
 * el siguiente paso es tener cuentas de admin individuales (con su propio registro de acciones).
 */

export function isValidAdminPassword(input: string): boolean {
  // Comparamos hashes de igual longitud con timingSafeEqual (no con ===) para no filtrar
  // información por el tiempo que tarda la comparación.
  const a = createHash('sha256').update(input).digest()
  const b = createHash('sha256').update(env().ADMIN_PASSWORD).digest()
  return timingSafeEqual(a, b)
}

/** Llamar al inicio de CADA página y CADA Server Action del admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}
