import Link from 'next/link'
import { adminLogoutAction } from '@/app/admin/actions'

export function AdminHeader() {
  return (
    <header className="admin-header">
      <Link href="/admin" className="brand-mark">
        HOSTIL<span>ADMIN</span>
      </Link>
      <nav>
        <Link href="/" target="_blank">
          Ver sitio ↗
        </Link>
        <form action={adminLogoutAction}>
          <button>Salir</button>
        </form>
      </nav>
    </header>
  )
}
