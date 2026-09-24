import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

/**
 * Cliente único de Prisma.
 *
 * En desarrollo, Next recarga los módulos en cada cambio; sin este truco de `globalThis`
 * abriríamos una conexión nueva a PostgreSQL en cada recarga hasta agotar el límite.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  // Leemos process.env directamente (y no env()) para que importar este archivo durante
  // `next build` no falle si no hay base de datos: la conexión se abre en la primera consulta.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
