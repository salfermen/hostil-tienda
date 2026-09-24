import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Firma y verificación de datos pequeños (sesiones en cookies) con HMAC-SHA256.
 *
 * Formato: base64url(JSON) + "." + base64url(firma)
 * El contenido NO está cifrado (se puede leer), pero no se puede modificar sin la clave:
 * cualquier cambio invalida la firma. Por eso solo guardamos IDs, nunca datos sensibles.
 */

type WithExpiry = { exp: number } // segundos desde epoch

function sign(data: string, secret: string) {
  return createHmac('sha256', secret).update(data).digest('base64url')
}

export function signPayload<T extends WithExpiry>(payload: T, secret: string): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${data}.${sign(data, secret)}`
}

export function verifyPayload<T extends WithExpiry>(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): T | null {
  if (!token) return null
  const [data, signature] = token.split('.')
  if (!data || !signature) return null

  const expected = Buffer.from(sign(data, secret))
  const received = Buffer.from(signature)
  // timingSafeEqual evita que un atacante adivine la firma midiendo tiempos de respuesta.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as T
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < now) return null
    return payload
  } catch {
    return null
  }
}
