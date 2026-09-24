import { describe, expect, it } from 'vitest'
import {
  generateAccessCode,
  hashAccessCode,
  isWellFormedCode,
  normalizeAccessCode,
} from '@/lib/auth/codes'

const SECRET = 'secreto-de-prueba-de-al-menos-32-caracteres'

describe('códigos de acceso', () => {
  it('tienen formato XXXXX-XXXXX sin letras ambiguas', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateAccessCode()
      expect(code).toMatch(/^[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/)
      expect(isWellFormedCode(normalizeAccessCode(code))).toBe(true)
    }
  })

  it('no se repiten', () => {
    const codes = new Set(Array.from({ length: 5000 }, generateAccessCode))
    expect(codes.size).toBe(5000)
  })

  it('normaliza lo que escribe el usuario', () => {
    expect(normalizeAccessCode(' ab1cd-efg2h ')).toBe('AB1CDEFG2H')
    expect(normalizeAccessCode('oOiIlL')).toBe('001111')
  })

  it('el hash no depende de mayúsculas, espacios ni guiones', () => {
    const code = generateAccessCode()
    const messy = ` ${code.toLowerCase().replace('-', ' ')} `
    expect(hashAccessCode(messy, SECRET)).toBe(hashAccessCode(code, SECRET))
  })

  it('el hash cambia con otro secreto', () => {
    const code = generateAccessCode()
    expect(hashAccessCode(code, SECRET)).not.toBe(hashAccessCode(code, `${SECRET}-otro`))
  })

  it('rechaza códigos mal formados', () => {
    expect(isWellFormedCode('ABC')).toBe(false)
    expect(isWellFormedCode('ABCDEFGHIJ')).toBe(false) // contiene I
  })
})
