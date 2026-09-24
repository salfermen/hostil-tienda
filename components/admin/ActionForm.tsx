'use client'

import { useActionState, useEffect, useRef, type ReactNode } from 'react'
import type { FormState } from '@/app/actions/access'

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  submitLabel: string
  children: ReactNode
  /** Vaciar el formulario cuando la acción sale bien (útil para "agregar producto"). */
  resetOnSuccess?: boolean
}

/** Formulario genérico del admin: muestra el mensaje de la Server Action y el estado "enviando". */
export function ActionForm({ action, submitLabel, children, resetOnSuccess }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset()
  }, [state, resetOnSuccess])

  return (
    <form ref={ref} action={formAction} className="admin-form">
      {children}
      <button className="admin-button primary" disabled={pending}>
        {pending ? 'Guardando…' : submitLabel}
      </button>
      {state && <p className={state.ok ? 'form-success' : 'form-error'}>{state.message}</p>}
    </form>
  )
}
