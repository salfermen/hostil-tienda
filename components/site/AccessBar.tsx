import { logoutAction } from '@/app/actions/access'

/** Franja superior cuando la persona está dentro de un drop privado. */
export function AccessBar({ dropName, who }: { dropName: string; who: string }) {
  return (
    <div className="access-bar">
      <span>
        ACCESO PRIVADO <b>•</b> {dropName.toUpperCase()} <b>•</b> {who.toUpperCase()}
      </span>
      <form action={logoutAction}>
        <button type="submit">SALIR</button>
      </form>
    </div>
  )
}
