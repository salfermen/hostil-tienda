import 'server-only'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { generateAccessCode, hashAccessCode } from '@/lib/auth/codes'
import { accessCodeEmail, type EmailMessage } from '@/lib/email/templates'
import { sendEmails } from '@/lib/email/send'

/**
 * Emisión de códigos personales y envío por correo.
 *
 * Como solo guardamos el hash, un código no se puede "reenviar": se genera uno NUEVO
 * (y el anterior deja de funcionar). A eso le llamamos "rotar" el código.
 */

/** Máximo de correos por ejecución, para no pasarnos del tiempo límite de una función en Vercel. */
const MAX_PER_RUN = 300
/** Tiempo mínimo entre dos reenvíos al mismo usuario. */
const RESEND_COOLDOWN_MS = 2 * 60 * 1000

type DropInfo = { id: string; name: string; description: string | null }
type Recipient = { id: string; email: string; name: string | null }

function accessUrl(email: string, code: string) {
  const url = new URL('/acceso', env().APP_URL)
  url.searchParams.set('email', email)
  url.searchParams.set('code', code)
  return url.toString()
}

/** Crea (o rota) el código de cada usuario, envía los correos y marca los enviados. */
async function issueAndSend(drop: DropInfo, users: Recipient[]) {
  const secret = env().AUTH_SECRET
  const messages: EmailMessage[] = []
  const tokenIdByEmail = new Map<string, string>()

  for (const user of users) {
    const code = generateAccessCode()
    const token = await db.accessToken.upsert({
      where: { userId_dropId: { userId: user.id, dropId: drop.id } },
      create: { userId: user.id, dropId: drop.id, tokenHash: hashAccessCode(code, secret) },
      update: { tokenHash: hashAccessCode(code, secret), sentAt: null },
      select: { id: true },
    })
    tokenIdByEmail.set(user.email, token.id)
    messages.push(
      accessCodeEmail({
        to: user.email,
        name: user.name,
        dropName: drop.name,
        dropDescription: drop.description,
        code,
        accessUrl: accessUrl(user.email, code),
      }),
    )
  }

  const { sent, failed } = await sendEmails(messages)
  const sentIds = sent.map((email) => tokenIdByEmail.get(email)!).filter(Boolean)
  if (sentIds.length > 0) {
    await db.accessToken.updateMany({
      where: { id: { in: sentIds } },
      data: { sentAt: new Date() },
    })
  }
  return { sent: sent.length, failed: failed.length }
}

/** Registrados activos que todavía no tienen su código enviado (y no fueron revocados). */
function pendingUsersWhere(dropId: string) {
  return {
    status: 'ACTIVE' as const,
    accessTokens: {
      none: { dropId, OR: [{ sentAt: { not: null } }, { revokedAt: { not: null } }] },
    },
  }
}

export function countPendingUsers(dropId: string) {
  return db.user.count({ where: pendingUsersWhere(dropId) })
}

/**
 * Envía el código a todos los registrados activos que aún no lo tienen (o cuyo envío falló).
 * Si hay más de MAX_PER_RUN, devuelve `remaining` > 0 y el admin vuelve a pulsar el botón.
 */
export async function sendPendingCodes(dropId: string) {
  const drop = await db.drop.findUniqueOrThrow({
    where: { id: dropId },
    select: { id: true, name: true, description: true },
  })

  const users = await db.user.findMany({
    where: pendingUsersWhere(dropId),
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
    take: MAX_PER_RUN,
  })
  const result = await issueAndSend(drop, users)
  const remaining = await countPendingUsers(dropId)
  return { ...result, remaining }
}

export type RequestCodeOutcome = 'sent' | 'throttled' | 'blocked' | 'failed'

/** Un usuario pide (o vuelve a pedir) su código para el drop en vivo. */
export async function sendCodeToUser(userId: string, drop: DropInfo): Promise<RequestCodeOutcome> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      accessTokens: { where: { dropId: drop.id }, select: { sentAt: true, revokedAt: true } },
    },
  })
  if (user.status !== 'ACTIVE') return 'blocked'

  const existing = user.accessTokens[0]
  if (existing?.revokedAt) return 'blocked'
  if (existing?.sentAt && Date.now() - existing.sentAt.getTime() < RESEND_COOLDOWN_MS)
    return 'throttled'

  const { sent } = await issueAndSend(drop, [user])
  return sent > 0 ? 'sent' : 'failed'
}
