import Link from 'next/link'
import { formatDateTime } from '@/lib/format'
import type { CurrentDrop } from '@/lib/drops/queries'
import { Countdown } from '@/components/drop/Countdown'
import { SpoilerGrid } from '@/components/drop/SpoilerGrid'
import { RegisterForm } from '@/components/forms/RegisterForm'

/**
 * Pantalla de "sitio bloqueado". Se muestra a todo el que no tenga acceso mientras haya
 * un drop activo:
 *  - TEASER: cuenta regresiva + spoilers + registro.
 *  - LIVE: spoilers + "ya tengo código" + "pedir mi código".
 */
export function DropGate({ drop, spoilers }: { drop: CurrentDrop; spoilers: { id: string }[] }) {
  const live = drop.status === 'LIVE'

  return (
    <main className="drop-gate">
      <header className="drop-gate-header">
        <span className="brand-mark">
          HOSTIL<span>®</span>
        </span>
        <span className="eyebrow red">
          {live ? 'DROP EN VIVO / SOLO REGISTRADOS' : 'PRÓXIMO DROP'}
        </span>
      </header>

      <section className="drop-gate-hero">
        <p className="eyebrow">
          {live ? 'ACCESO PRIVADO' : `LANZAMIENTO: ${formatDateTime(drop.launchAt).toUpperCase()}`}
        </p>
        <h1 className="drop-title">{drop.name}</h1>
        {drop.description && <p className="hero-description">{drop.description}</p>}
        {!live && <Countdown target={drop.launchAt.toISOString()} />}
      </section>

      <SpoilerGrid products={spoilers} />

      <section className="drop-gate-forms">
        {live && (
          <div className="drop-panel">
            <p className="eyebrow red">01 / YA TENGO MI CÓDIGO</p>
            <h2 className="panel-title">ENTRA AL DROP</h2>
            <p className="muted">Usa el código personal que te llegó al correo.</p>
            <Link href="/acceso" className="button-primary mt-6">
              Ingresar código
            </Link>
          </div>
        )}
        <div className="drop-panel">
          <p className="eyebrow red">{live ? '02 / NO TENGO CÓDIGO' : 'REGÍSTRATE'}</p>
          <h2 className="panel-title">{live ? 'PIDE TU ACCESO' : 'QUE NO TE LO CUENTEN'}</h2>
          <p className="muted">
            {live
              ? 'Regístrate (o escribe tu correo si ya estabas) y te enviamos tu código al instante.'
              : 'Solo los registrados reciben el código para entrar el día del lanzamiento.'}
          </p>
          <div className="mt-6">
            <RegisterForm variant="dark" cta={live ? 'Enviarme mi código' : 'Registrarme'} />
          </div>
        </div>
      </section>

      <footer className="drop-gate-footer">
        <small>© {new Date().getFullYear()} HOSTIL.</small>
        <Link href="/privacidad">Privacidad</Link>
      </footer>
    </main>
  )
}
