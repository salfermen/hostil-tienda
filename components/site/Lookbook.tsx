import { ArrowRight } from 'lucide-react'

export function Lookbook() {
  return (
    <section id="coleccion" className="lookbook">
      <div className="lookbook-image" />
      <div className="lookbook-copy">
        <p className="eyebrow red">02 / MANIFIESTO</p>
        <h2>
          NO SOMOS
          <br />
          <i>PARA TODOS.</i>
        </h2>
        <p>
          Hostil nace de la calle, del ruido y de las ganas de hacer las cosas distinto. Prendas que
          hablan antes que tú.
        </p>
        <a className="button-outline" href="#nosotros">
          Conoce la historia <ArrowRight size={17} />
        </a>
      </div>
    </section>
  )
}
