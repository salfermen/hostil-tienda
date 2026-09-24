import Link from 'next/link'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/admin'
import { effectiveStatus } from '@/lib/drops/status'
import { formatDateTime } from '@/lib/format'
import { createDropAction, setUserStatusAction } from '@/app/admin/actions'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ActionForm } from '@/components/admin/ActionForm'
import { DropFields } from '@/components/admin/DropFields'
import { StatusBadge } from '@/components/admin/StatusBadge'

export default async function AdminHome() {
  await requireAdmin()

  const [drops, totalUsers, activeUsers, recentUsers] = await Promise.all([
    db.drop.findMany({
      orderBy: { launchAt: 'desc' },
      include: { _count: { select: { products: true, accessTokens: true } } },
    }),
    db.user.count(),
    db.user.count({ where: { status: 'ACTIVE' } }),
    db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 25 }),
  ])

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <section className="admin-stats">
          <div>
            <strong>{totalUsers}</strong>
            <span>Registrados</span>
          </div>
          <div>
            <strong>{activeUsers}</strong>
            <span>Activos (reciben códigos)</span>
          </div>
          <div>
            <strong>{drops.length}</strong>
            <span>Drops</span>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-subtitle">Drops</h2>
          {drops.length === 0 ? (
            <p className="muted">Aún no hay drops. Crea el primero abajo.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Lanzamiento</th>
                  <th>Productos</th>
                  <th>Códigos</th>
                </tr>
              </thead>
              <tbody>
                {drops.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link href={`/admin/drops/${d.id}`} className="underline">
                        {d.name}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge status={effectiveStatus(d)} />
                    </td>
                    <td>{formatDateTime(d.launchAt)}</td>
                    <td>{d._count.products}</td>
                    <td>{d._count.accessTokens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="admin-card">
          <h2 className="admin-subtitle">Nuevo drop</h2>
          <ActionForm action={createDropAction} submitLabel="Crear en borrador">
            <DropFields />
          </ActionForm>
        </section>

        <section className="admin-card">
          <h2 className="admin-subtitle">Últimos registrados</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Correo</th>
                <th>Nombre</th>
                <th>Registro</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name ?? '—'}</td>
                  <td>{formatDateTime(u.createdAt)}</td>
                  <td>{u.status === 'ACTIVE' ? 'Activo' : 'Bloqueado'}</td>
                  <td>
                    <form
                      action={setUserStatusAction.bind(
                        null,
                        u.id,
                        u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE',
                      )}
                    >
                      <button className="admin-button small">
                        {u.status === 'ACTIVE' ? 'Bloquear' : 'Activar'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  )
}
