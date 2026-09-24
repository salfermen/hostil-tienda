import { ArrowRight } from 'lucide-react'

type Props = {
  eyebrow: string
  title: string
  accent: string
  link?: { href: string; label: string }
}

/** Encabezado de sección reutilizable: "01 / DROP ACTUAL — LO QUE ESTÁ SONANDO." */
export function SectionHeading({ eyebrow, title, accent, link }: Props) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow red">{eyebrow}</p>
        <h2>
          {title}
          <br />
          <i>{accent}</i>
        </h2>
      </div>
      {link && (
        <a className="text-link" href={link.href}>
          {link.label} <ArrowRight size={16} />
        </a>
      )}
    </div>
  )
}
