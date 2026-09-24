import { createHmac, randomBytes } from 'node:crypto'

/**
 * Códigos de acceso personales ("tokens") para los drops.
 *
 * - Formato: XXXXX-XXXXX (10 caracteres, alfabeto Crockford base32 → ~50 bits de azar).
 *   Sin letras ambiguas (I, L, O, U) para que se puedan dictar o copiar a mano sin errores.
 * - En la base de datos NUNCA se guarda el código, solo su hash HMAC-SHA256 con AUTH_SECRET.
 *   Si alguien roba la base de datos, no puede usar los códigos.
 *
 * Este archivo no depende de Next ni de la base de datos: por eso se puede probar con Vitest.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // 32 símbolos
const CODE_LENGTH = 10

export function generateAccessCode(): string {
  const bytes = randomBytes(CODE_LENGTH)
  let raw = ''
  // 256 es múltiplo de 32, así que `byte % 32` no introduce sesgo.
  for (const byte of bytes) raw += ALPHABET[byte % ALPHABET.length]
  return `${raw.slice(0, 5)}-${raw.slice(5)}`
}

/**
 * Deja el código como lo escribió el usuario en su forma canónica:
 * mayúsculas, sin espacios ni guiones, y corrige confusiones típicas (O→0, I/L→1).
 */
export function normalizeAccessCode(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1')
}

export function isWellFormedCode(normalized: string): boolean {
  return normalized.length === CODE_LENGTH && [...normalized].every((c) => ALPHABET.includes(c))
}

export function hashAccessCode(code: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`access-code:${normalizeAccessCode(code)}`)
    .digest('hex')
}
