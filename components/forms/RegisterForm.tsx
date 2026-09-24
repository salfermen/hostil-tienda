'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requestAccessAction } from '@/app/actions/access'

/**
 * Formulario de registro. Llama a una Server Action (se ejecuta en el servidor) y
 * `useActionState` nos da el resultado y si está enviando, sin escribir fetch a mano.
 *
 * variant="red"  → sección "Únete al ruido" (fondo rojo)
 * variant="dark" → modal y pantalla del drop (fondo negro)
 */
export function RegisterForm({
  variant,
  cta = 'Registrarme',
}: {
  variant: 'red' | 'dark'
  cta?: string
}) {
  const [state, formAction, pending] = useActionState(requestAccessAction, null)

  if (state?.ok) {
    return <p className={variant === 'red' ? 'success-message' : 'form-success'}>{state.message}</p>
  }

  const consent = (
    <label className="consent">
      <input type="checkbox" name="consent" required />
      <span>
        Acepto la <Link href="/privacidad">política de tratamiento de datos</Link> y recibir correos
        de HOSTIL.
      </span>
    </label>
  )

  if (variant === 'red') {
    return (
      <form action={formAction} className="join-form">
        <div className="join-row">
          <input
            type="email"
            name="email"
            required
            placeholder="Tu correo electrónico"
            aria-label="Tu correo electrónico"
          />
          <button aria-label="Registrarme" disabled={pending}>
            <ArrowRight />
          </button>
        </div>
        {consent}
        {state && !state.ok && <p className="form-error">{state.message}</p>}
      </form>
    )
  }

  return (
    <form action={formAction} className="dark-form">
      <input
        type="text"
        name="name"
        placeholder="NOMBRE (OPCIONAL)"
        autoComplete="given-name"
        maxLength={80}
      />
      <input
        type="email"
        name="email"
        required
        placeholder="CORREO ELECTRÓNICO"
        autoComplete="email"
      />
      {consent}
      <button className="dark-form-submit" disabled={pending}>
        {pending ? 'Enviando…' : cta}
      </button>
      {state && !state.ok && <p className="form-error">{state.message}</p>}
    </form>
  )
}
