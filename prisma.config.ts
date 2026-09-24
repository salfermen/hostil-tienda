// Configuración del CLI de Prisma (migraciones, generate, studio).
// Desde Prisma 7 la URL de conexión del CLI vive aquí y no en schema.prisma.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Para migraciones conviene la conexión directa (sin pooler). Si no existe, usamos DATABASE_URL.
    // `prisma generate` no necesita base de datos, por eso no forzamos que exista la variable.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
