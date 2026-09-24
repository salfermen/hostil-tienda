import type { DropStatus } from '@/lib/generated/prisma/enums'

/**
 * Reglas del ciclo de vida de un drop (funciones puras, fáciles de probar).
 *
 *   DRAFT ──► TEASER ──► LIVE ──► CLOSED
 *   (oculto)  (sitio      (entran    (vuelve la
 *             bloqueado,   con su     landing
 *             spoilers)    código)    pública)
 */

type DropTiming = { status: DropStatus; endsAt: Date | null }

/** Si el drop tiene fecha de cierre y ya pasó, se considera cerrado aunque nadie lo haya cambiado. */
export function effectiveStatus(drop: DropTiming, now = new Date()): DropStatus {
  if ((drop.status === 'LIVE' || drop.status === 'TEASER') && drop.endsAt && drop.endsAt <= now) {
    return 'CLOSED'
  }
  return drop.status
}

/** ¿Este drop bloquea el sitio? (anunciado o lanzado) */
export function locksSite(drop: DropTiming, now = new Date()): boolean {
  const status = effectiveStatus(drop, now)
  return status === 'TEASER' || status === 'LIVE'
}

/** Transiciones permitidas desde el panel de admin. */
export const allowedTransitions: Record<DropStatus, DropStatus[]> = {
  DRAFT: ['TEASER', 'LIVE'],
  TEASER: ['DRAFT', 'LIVE', 'CLOSED'],
  LIVE: ['CLOSED'],
  CLOSED: ['LIVE'],
}

export function canTransition(from: DropStatus, to: DropStatus): boolean {
  return allowedTransitions[from].includes(to)
}

export const statusLabels: Record<DropStatus, string> = {
  DRAFT: 'Borrador',
  TEASER: 'Teaser (spoilers)',
  LIVE: 'En vivo',
  CLOSED: 'Cerrado',
}
