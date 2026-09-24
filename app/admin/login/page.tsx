import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/session'
import { adminLoginAction } from '@/app/admin/actions'
import { ActionForm } from '@/components/admin/ActionForm'

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin')
  return (
    <main className="admin-login">
      <h1 className="admin-title">HOSTIL / ADMIN</h1>
      <ActionForm action={adminLoginAction} submitLabel="Entrar">
        <label>
          Contraseña
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            autoFocus
          />
        </label>
      </ActionForm>
    </main>
  )
}
