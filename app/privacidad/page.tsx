import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Política de tratamiento de datos — HOSTIL' }

/**
 * BORRADOR. En Colombia, la Ley 1581 de 2012 exige informar para qué usas los datos y
 * obtener autorización. Revisa este texto con un abogado antes de salir a producción.
 */
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/" className="brand-mark">
        HOSTIL<span>®</span>
      </Link>
      <h1>Política de tratamiento de datos personales</h1>
      <p className="muted">Borrador — pendiente de revisión legal.</p>
      <h2>Qué datos recogemos</h2>
      <p>Tu correo electrónico y, si nos lo das, tu nombre.</p>
      <h2>Para qué los usamos</h2>
      <p>
        Para enviarte los códigos de acceso a los drops, información de nuevas colecciones y
        comunicaciones de HOSTIL. No vendemos ni compartimos tus datos con terceros, salvo los
        proveedores necesarios para operar el servicio (hosting, base de datos y envío de correos).
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes conocer, actualizar, rectificar o pedir que eliminemos tus datos, y revocar la
        autorización en cualquier momento, escribiéndonos a nuestro correo de contacto.
      </p>
    </main>
  )
}
