/** Utilidades de formato para Colombia (moneda y fechas en hora de Bogotá). */

const TIME_ZONE = 'America/Bogota'
/** Colombia no tiene horario de verano, así que el desfase es fijo. */
const BOGOTA_OFFSET = '-05:00'

export function formatCop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: TIME_ZONE,
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

/** Convierte el valor de un <input type="datetime-local"> (hora de Bogotá) a Date. */
export function parseBogotaDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const date = new Date(`${value}:00${BOGOTA_OFFSET}`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Lo inverso: Date → valor para <input type="datetime-local"> en hora de Bogotá. */
export function toBogotaInputValue(date: Date | null): string {
  if (!date) return ''
  const shifted = new Date(date.getTime() - 5 * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 16)
}
