import { z } from 'zod'

/**
 * Validación de formularios en el SERVIDOR.
 * El navegador también valida (atributos `required`, `type="email"`), pero eso se puede
 * saltar fácilmente; esta es la validación que realmente protege la base de datos.
 */

const email = z.string().trim().toLowerCase().pipe(z.email('Escribe un correo válido.').max(254))

export const registerSchema = z.object({
  email,
  name: z
    .string()
    .trim()
    .max(80, 'El nombre es demasiado largo.')
    .optional()
    .transform((v) => v || null),
  consent: z.literal('on', { error: 'Debes aceptar la política de tratamiento de datos.' }),
})

export const accessSchema = z.object({
  email,
  code: z.string().trim().min(1, 'Escribe tu código.').max(40),
})

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))

export const dropSchema = z.object({
  name: z.string().trim().min(2, 'Ponle nombre al drop.').max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede tener minúsculas, números y guiones.')
    .max(60),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || null),
  launchAt: z.string().min(1, 'Indica la fecha de lanzamiento.'),
  endsAt: optionalDate,
})

export const productSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => v || null),
  priceCop: z.coerce.number().int().min(0, 'El precio no puede ser negativo.').max(100_000_000),
  tag: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || null),
  imageKey: z
    .string()
    .regex(/^[\w-]+\.(png|jpe?g|webp|avif)$/i, 'Elige una imagen válida de la carpeta del drop.'),
  sortOrder: z.coerce.number().int().default(0),
  showInTeaser: z
    .string()
    .optional()
    .transform((v) => v === 'on'),
})

/** Convierte los errores de Zod en un mensaje corto para mostrar en el formulario. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos.'
}
