import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/admin'
import { allowedTransitions, effectiveStatus, statusLabels } from '@/lib/drops/status'
import { formatCop, formatDateTime } from '@/lib/format'
import { listDropImages } from '@/lib/images'
import { countPendingUsers } from '@/lib/drops/access-codes'
import {
  createProductAction,
  deleteDropAction,
  deleteProductAction,
  revokeTokenAction,
  sendPendingCodesAction,
  setDropStatusAction,
  updateDropAction,
} from '@/app/admin/actions'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ActionForm } from '@/components/admin/ActionForm'
import { DropFields } from '@/components/admin/DropFields'
import { StatusBadge } from '@/components/admin/StatusBadge'

const transitionHelp: Record<string, string> = {
  TEASER: 'Bloquea el sitio y muestra spoilers + registro.',
  LIVE: 'Lanza el drop: genera y ENVÍA los códigos a todos los registrados.',
  CLOSED: 'Cierra el drop y desbloquea el sitio.',
  DRAFT: 'Vuelve a borrador (oculto).',
}

export default async function AdminDropPage({
  params,
  searchParams,
}: PageProps<'/admin/drops/[id]'>) {
  await requireAdmin()
  const { id } = await params
  const { msg } = await searchParams

  const drop = await db.drop.findUnique({
    where: { id },
    include: { products: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!drop) notFound()

  const [images, totalTokens, sentTokens, usedTokens, revokedTokens, pendingUsers, topTokens] =
    await Promise.all([
      listDropImages(drop.slug),
      db.accessToken.count({ where: { dropId: id } }),
      db.accessToken.count({ where: { dropId: id, sentAt: { not: null } } }),
      db.accessToken.count({ where: { dropId: id, firstUsedAt: { not: null } } }),
      db.accessToken.count({ where: { dropId: id, revokedAt: { not: null } } }),
      countPendingUsers(id),
      db.accessToken.findMany({
        where: { dropId: id, firstUsedAt: { not: null } },
        orderBy: { useCount: 'desc' },
        take: 30,
        include: { user: { select: { email: true } } },
      }),
    ])

  const status = effectiveStatus(drop)

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <Link href="/admin" className="muted">
          ← Todos los drops
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="admin-title">{drop.name}</h1>
          <StatusBadge status={status} />
        </div>
        {typeof msg === 'string' && <p className="admin-flash">{msg}</p>}

        <section className="admin-card">
          <h2 className="admin-subtitle">Estado</h2>
          <p className="muted mb-4">
            Lanzamiento: {formatDateTime(drop.launchAt)}
            {drop.endsAt && ` · Cierre: ${formatDateTime(drop.endsAt)}`}
          </p>
          <div className="flex flex-wrap gap-3">
            {allowedTransitions[drop.status].map((next) => (
              <form key={next} action={setDropStatusAction.bind(null, drop.id, next)}>
                <button
                  className={`admin-button ${next === 'LIVE' ? 'primary' : ''}`}
                  title={transitionHelp[next]}
                >
                  Pasar a {statusLabels[next]}
                </button>
              </form>
            ))}
            {drop.status === 'DRAFT' && (
              <form action={deleteDropAction.bind(null, drop.id)}>
                <button className="admin-button danger">Borrar drop</button>
              </form>
            )}
          </div>
          <ul className="muted mt-4 list-disc pl-5 text-sm">
            {allowedTransitions[drop.status].map((next) => (
              <li key={next}>
                <b>{statusLabels[next]}:</b> {transitionHelp[next]}
              </li>
            ))}
          </ul>
          {(status === 'TEASER' || status === 'LIVE' || drop.status === 'DRAFT') && (
            <p className="mt-4 text-sm">
              <Link href={status === 'LIVE' ? '/' : '/drop'} target="_blank" className="underline">
                Previsualizar como admin ↗
              </Link>
            </p>
          )}
        </section>

        <section className="admin-card">
          <h2 className="admin-subtitle">Códigos de acceso</h2>
          <div className="admin-stats compact">
            <div>
              <strong>{sentTokens}</strong>
              <span>Enviados</span>
            </div>
            <div>
              <strong>{usedTokens}</strong>
              <span>Usados</span>
            </div>
            <div>
              <strong>{revokedTokens}</strong>
              <span>Revocados</span>
            </div>
            <div>
              <strong>{status === 'LIVE' ? pendingUsers : '—'}</strong>
              <span>Pendientes</span>
            </div>
          </div>
          {status === 'LIVE' && (
            <form action={sendPendingCodesAction.bind(null, drop.id)} className="mt-4">
              <button className="admin-button">Enviar códigos pendientes</button>
            </form>
          )}
          {totalTokens > 0 && topTokens.length > 0 && (
            <>
              <p className="muted mt-6 text-sm">
                Más usados (un número muy alto puede significar que alguien compartió su código):
              </p>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Correo</th>
                    <th>Usos</th>
                    <th>Último uso</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {topTokens.map((t) => (
                    <tr key={t.id}>
                      <td>{t.user.email}</td>
                      <td>{t.useCount}</td>
                      <td>{t.lastUsedAt ? formatDateTime(t.lastUsedAt) : '—'}</td>
                      <td>
                        {t.revokedAt ? (
                          'Revocado'
                        ) : (
                          <form action={revokeTokenAction.bind(null, drop.id, t.id)}>
                            <button className="admin-button small danger">Revocar</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        <section className="admin-card">
          <h2 className="admin-subtitle">Productos ({drop.products.length})</h2>
          {drop.products.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Imagen</th>
                  <th>Spoiler</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {drop.products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.sortOrder}</td>
                    <td>{p.name}</td>
                    <td>{formatCop(p.priceCop)}</td>
                    <td>
                      <a href={`/api/imagenes/${p.id}`} target="_blank" className="underline">
                        {p.imageKey}
                      </a>
                    </td>
                    <td>
                      {p.showInTeaser ? (
                        <a
                          href={`/api/imagenes/${p.id}?v=spoiler`}
                          target="_blank"
                          className="underline"
                        >
                          ver
                        </a>
                      ) : (
                        'no'
                      )}
                    </td>
                    <td>
                      <form action={deleteProductAction.bind(null, drop.id, p.id)}>
                        <button className="admin-button small danger">Quitar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3 className="admin-subtitle mt-8">Agregar producto</h3>
          {images.length === 0 ? (
            <p className="form-error">
              No hay imágenes en <code>storage/drops/{drop.slug}/</code>. Copia ahí las fotos (png,
              jpg o webp), haz commit y despliega; luego vuelve a esta página.
            </p>
          ) : (
            <ActionForm
              action={createProductAction.bind(null, drop.id)}
              submitLabel="Agregar producto"
              resetOnSuccess
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  Nombre
                  <input name="name" required />
                </label>
                <label>
                  Precio (COP, sin puntos)
                  <input
                    name="priceCop"
                    type="number"
                    min={0}
                    step={100}
                    required
                    placeholder="129900"
                  />
                </label>
                <label>
                  Etiqueta (opcional)
                  <input name="tag" placeholder="Edición limitada" />
                </label>
                <label>
                  Orden
                  <input name="sortOrder" type="number" defaultValue={drop.products.length} />
                </label>
              </div>
              <label>
                Descripción corta (opcional)
                <input name="description" placeholder="Unisex / Negro" />
              </label>
              <label>
                Imagen
                <select name="imageKey" required>
                  {images.map((img) => (
                    <option key={img} value={img}>
                      {img}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex-row! items-center gap-2">
                <input type="checkbox" name="showInTeaser" defaultChecked /> Mostrar como spoiler
                antes del lanzamiento
              </label>
            </ActionForm>
          )}
        </section>

        <section className="admin-card">
          <h2 className="admin-subtitle">Editar datos del drop</h2>
          <ActionForm action={updateDropAction.bind(null, drop.id)} submitLabel="Guardar cambios">
            <DropFields d={drop} />
          </ActionForm>
          {drop.status !== 'DRAFT' && (
            <p className="muted mt-2 text-sm">
              Ojo: si cambias el slug, las imágenes deben estar en la carpeta con el nuevo nombre.
            </p>
          )}
        </section>
      </main>
    </>
  )
}
