import { ArrowDown, ArrowRight } from 'lucide-react'

type HeroProps = {
  /** Texto pequeño sobre el título, p. ej. "HOSTIL / FW26" o el nombre del drop. */
  eyebrow?: string
  ctaLabel?: string
}

export function Hero({ eyebrow = 'HOSTIL / FW26', ctaLabel = 'Comprar colección' }: HeroProps) {
  return (
    <section id="inicio" className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          VISTE
          <br />
          <em>EL RUIDO.</em>
        </h1>
        <p className="hero-description">
          Ropa para quienes no piden permiso.
          <br />
          Diseñada en Colombia, hecha para moverse.
        </p>
        <a className="button-primary" href="#nuevo">
          {ctaLabel} <ArrowRight size={17} />
        </a>
      </div>
      <div className="hero-image" role="img" aria-label="Campaña Hostil de moda urbana" />
      <div className="hero-stamp">
        NO
        <br />
        APOLOGIES
        <br />
        <span>●</span>
      </div>
      <a className="scroll-cue" href="#nuevo">
        <ArrowDown size={18} /> SCROLL PARA EXPLORAR
      </a>
    </section>
  )
}
