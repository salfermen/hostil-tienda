import { z } from 'zod'

/**
 * Variables de entorno validadas.
 *
 * Por qué así: si falta una variable, preferimos un error claro ("falta AUTH_SECRET")
 * en vez de un fallo raro a mitad de un pedido. La validación es "perezosa" (se hace la
 * primera vez que se pide `env()`), para que `next build` no exija la base de datos.
 */
const schema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL de PostgreSQL'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET debe tener al menos 32 caracteres'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD debe tener al menos 12 caracteres'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('HOSTIL <onboarding@resend.dev>'),
})

export type Env = z.infer<typeof schema>

let cached: Env | undefined

export function env(): Env {
  if (cached) return cached
  const parsed = schema.safeParse(process.env)
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    throw new Error(
      `Variables de entorno inválidas:\n${problems.join('\n')}\nRevisa tu archivo .env`,
    )
  }
  cached = parsed.data
  return cached
}

export const isProduction = process.env.NODE_ENV === 'production'
