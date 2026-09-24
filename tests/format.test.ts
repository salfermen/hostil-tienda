import { describe, expect, it } from 'vitest'
import { parseBogotaDateTime, toBogotaInputValue } from '@/lib/format'

describe('fechas en hora de Bogotá', () => {
  it('interpreta el datetime-local como hora de Colombia (UTC-5)', () => {
    expect(parseBogotaDateTime('2026-10-01T20:00')?.toISOString()).toBe('2026-10-02T01:00:00.000Z')
  })

  it('ida y vuelta sin cambiar la hora', () => {
    const date = parseBogotaDateTime('2026-12-24T23:30')!
    expect(toBogotaInputValue(date)).toBe('2026-12-24T23:30')
  })

  it('rechaza valores inválidos', () => {
    expect(parseBogotaDateTime('mañana')).toBeNull()
  })
})
