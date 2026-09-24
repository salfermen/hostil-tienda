import { toBogotaInputValue } from '@/lib/format'

type Defaults = {
  name?: string
  slug?: string
  description?: string | null
  launchAt?: Date
  endsAt?: Date | null
}

/** Campos compartidos por "crear drop" y "editar drop". */
export function DropFields({ d = {} }: { d?: Defaults }) {
  return (
    <>
      <label>
        Nombre
        <input name="name" required defaultValue={d.name} placeholder="FW26 — Sin permiso" />
      </label>
      <label>
        Slug (URL y carpeta de imágenes)
        <input
          name="slug"
          required
          defaultValue={d.slug}
          placeholder="fw26-sin-permiso"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
        />
      </label>
      <label>
        Descripción (sale en la pantalla del drop y en el correo)
        <textarea name="description" rows={3} defaultValue={d.description ?? ''} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          Lanzamiento (hora Colombia)
          <input
            type="datetime-local"
            name="launchAt"
            required
            defaultValue={toBogotaInputValue(d.launchAt ?? null)}
          />
        </label>
        <label>
          Cierre automático (opcional)
          <input
            type="datetime-local"
            name="endsAt"
            defaultValue={toBogotaInputValue(d.endsAt ?? null)}
          />
        </label>
      </div>
    </>
  )
}
