'use client'

import { useActionState } from 'react'
import { enterWithCodeAction } from '@/app/actions/access'

/** Entrada al drop con correo + código. Si viene del enlace del correo, llega ya rellenado. */
export function AccessForm({
  defaultEmail = '',
  defaultCode = '',
}: {
  defaultEmail?: string
  defaultCode?: string
}) {
  const [state, formAction, pending] = useActionState(enterWithCodeAction, null)

  return (
    <form action={formAction} className="dark-form">
      <input
        type="email"
        name="email"
        required
        placeholder="CORREO ELECTRÓNICO"
        autoComplete="email"
        defaultValue={defaultEmail}
      />
      <input
        type="text"
        name="code"
        required
        placeholder="XXXXX-XXXXX"
        aria-label="Código de acceso"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        spellCheck={false}
        className="code-input"
        defaultValue={defaultCode}
      />
      <button className="dark-form-submit red" disabled={pending}>
        {pending ? 'Verificando…' : 'Entrar al drop'}
      </button>
      {state && !state.ok && <p className="form-error">{state.message}</p>}
    </form>
  )
}
