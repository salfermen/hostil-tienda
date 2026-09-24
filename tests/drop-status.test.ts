import { describe, expect, it } from 'vitest'
import { canTransition, effectiveStatus, locksSite } from '@/lib/drops/status'

const now = new Date('2026-10-01T12:00:00Z')
const past = new Date('2026-09-30T12:00:00Z')
const future = new Date('2026-10-02T12:00:00Z')

describe('estado de los drops', () => {
  it('un drop LIVE con fecha de cierre vencida se considera cerrado', () => {
    expect(effectiveStatus({ status: 'LIVE', endsAt: past }, now)).toBe('CLOSED')
    expect(locksSite({ status: 'LIVE', endsAt: past }, now)).toBe(false)
  })

  it('TEASER y LIVE bloquean el sitio; DRAFT y CLOSED no', () => {
    expect(locksSite({ status: 'TEASER', endsAt: null }, now)).toBe(true)
    expect(locksSite({ status: 'LIVE', endsAt: future }, now)).toBe(true)
    expect(locksSite({ status: 'DRAFT', endsAt: null }, now)).toBe(false)
    expect(locksSite({ status: 'CLOSED', endsAt: null }, now)).toBe(false)
  })

  it('solo permite transiciones con sentido', () => {
    expect(canTransition('DRAFT', 'TEASER')).toBe(true)
    expect(canTransition('TEASER', 'LIVE')).toBe(true)
    expect(canTransition('LIVE', 'DRAFT')).toBe(false)
    expect(canTransition('CLOSED', 'TEASER')).toBe(false)
  })
})
