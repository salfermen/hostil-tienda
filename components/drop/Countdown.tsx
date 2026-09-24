'use client'

import { useEffect, useState } from 'react'

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    días: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    min: Math.floor((s % 3600) / 60),
    seg: s % 60,
  }
}

/** Cuenta regresiva hasta el lanzamiento. Solo es visual: el drop se abre cuando el admin lo lanza. */
export function Countdown({ target }: { target: string }) {
  // Empezamos en null para que el HTML del servidor y el del navegador coincidan (sin errores de hidratación).
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = now === null ? null : new Date(target).getTime() - now
  if (remaining !== null && remaining <= 0) {
    return <p className="countdown-soon">EL DROP ESTÁ POR ABRIR. MANTENTE ATENTO A TU CORREO.</p>
  }

  const values = remaining === null ? null : parts(remaining)
  return (
    <div className="countdown" aria-live="polite">
      {(['días', 'horas', 'min', 'seg'] as const).map((unit) => (
        <div key={unit}>
          <strong>{values ? String(values[unit]).padStart(2, '0') : '--'}</strong>
          <span>{unit.toUpperCase()}</span>
        </div>
      ))}
    </div>
  )
}
