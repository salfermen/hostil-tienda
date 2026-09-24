import { describe, expect, it } from 'vitest'
import { signPayload, verifyPayload } from '@/lib/auth/signed'

const SECRET = 'secreto-de-prueba-de-al-menos-32-caracteres'
const future = () => Math.floor(Date.now() / 1000) + 60

describe('cookies firmadas', () => {
  it('verifica un payload válido', () => {
    const token = signPayload({ kind: 'access', tokenId: 't1', exp: future() }, SECRET)
    expect(verifyPayload(token, SECRET)).toMatchObject({ kind: 'access', tokenId: 't1' })
  })

  it('rechaza si alguien modifica el contenido', () => {
    const token = signPayload({ kind: 'access', tokenId: 't1', exp: future() }, SECRET)
    const [, sig] = token.split('.')
    const forged = Buffer.from(JSON.stringify({ kind: 'admin', exp: future() })).toString(
      'base64url',
    )
    expect(verifyPayload(`${forged}.${sig}`, SECRET)).toBeNull()
  })

  it('rechaza con otro secreto', () => {
    const token = signPayload({ exp: future() }, SECRET)
    expect(verifyPayload(token, `${SECRET}x`)).toBeNull()
  })

  it('rechaza payloads vencidos', () => {
    const token = signPayload({ exp: Math.floor(Date.now() / 1000) - 1 }, SECRET)
    expect(verifyPayload(token, SECRET)).toBeNull()
  })

  it('rechaza basura', () => {
    expect(verifyPayload(undefined, SECRET)).toBeNull()
    expect(verifyPayload('nada', SECRET)).toBeNull()
    expect(verifyPayload('a.b.c', SECRET)).toBeNull()
  })
})
