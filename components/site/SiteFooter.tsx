import Link from 'next/link'
import { footerLinks } from '@/lib/content/site'

export function SiteFooter() {
  return (
    <footer>
      <div className="brand-mark">
        HOSTIL<span>®</span>
      </div>
      <p>Hecho para incomodar.</p>
      <div className="footer-links">
        {footerLinks.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
        <Link href="/privacidad">Privacidad</Link>
      </div>
      <small>© {new Date().getFullYear()} HOSTIL. Todos los derechos reservados.</small>
    </footer>
  )
}
