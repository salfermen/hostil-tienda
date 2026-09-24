import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentDrop, getDropAccess } from '@/lib/drops/queries'
import { AccessForm } from '@/components/forms/AccessForm'

export const metadata: Metadata = { title: 'Entrar al drop — HOSTIL' }

/** Aquí llega el enlace del correo: /acceso?email=...&code=... (el formulario se rellena solo). */
export default async function AccessPage({ searchParams }: PageProps<'/acceso'>) {
  const drop = await getCurrentDrop()
  if (drop && (await getDropAccess(drop))) redirect('/')

  const params = await searchParams
  const email = typeof params.email === 'string' ? params.email : ''
  const code = typeof params.code === 'string' ? params.code : ''

  return (
    <main className="drop-gate">
      <header className="drop-gate-header">
        <Link href="/" className="brand-mark">
          HOSTIL<span>®</span>
        </Link>
      </header>
      <section className="access-panel">
        <p className="eyebrow red">{drop ? drop.name.toUpperCase() : 'ACCESO PRIVADO'}</p>
        <h1 className="drop-title">TU CÓDIGO</h1>
        {drop?.status === 'LIVE' ? (
          <>
            <p className="muted mb-6">
              Escribe el correo con el que te registraste y tu código personal.
            </p>
            <AccessForm defaultEmail={email} defaultCode={code} />
          </>
        ) : (
          <p className="muted">No hay un drop abierto en este momento. Te avisaremos por correo.</p>
        )}
        <p className="muted mt-8">
          ¿No tienes código?{' '}
          <Link href="/drop" className="underline">
            Pídelo aquí
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
