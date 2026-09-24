import 'server-only'
import { Resend } from 'resend'
import { env, isProduction } from '@/lib/env'
import type { EmailMessage } from '@/lib/email/templates'

/**
 * Envío de correos con Resend.
 *
 * - Envía en lotes de 100 (el máximo de la API batch de Resend).
 * - En desarrollo, si no hay RESEND_API_KEY, NO envía nada: imprime el correo en la terminal.
 *   Así puedes probar todo el flujo (y ver los códigos) sin configurar Resend.
 */

const BATCH_SIZE = 100

export type SendResult = { sent: string[]; failed: string[] }

export async function sendEmails(messages: EmailMessage[]): Promise<SendResult> {
  const { RESEND_API_KEY, EMAIL_FROM } = env()
  const result: SendResult = { sent: [], failed: [] }
  if (messages.length === 0) return result

  if (!RESEND_API_KEY) {
    if (isProduction)
      throw new Error('Falta RESEND_API_KEY: no se pueden enviar correos en producción.')
    for (const m of messages) {
      console.info(`\n[correo de desarrollo] Para: ${m.to}\nAsunto: ${m.subject}\n${m.text}\n`)
      result.sent.push(m.to)
    }
    return result
  }

  const resend = new Resend(RESEND_API_KEY)
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const chunk = messages.slice(i, i + BATCH_SIZE)
    const { error } = await resend.batch.send(
      chunk.map((m) => ({
        from: EMAIL_FROM,
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
      })),
    )
    const recipients = chunk.map((m) => m.to)
    if (error) {
      console.error('[email] Falló un lote de Resend:', error.message)
      result.failed.push(...recipients)
    } else {
      result.sent.push(...recipients)
    }
  }
  return result
}
