import { RegisterForm } from '@/components/forms/RegisterForm'

/** Sección roja "Únete al ruido": ahora registra de verdad en la base de datos. */
export function JoinSection() {
  return (
    <section id="nosotros" className="newsletter">
      <p className="eyebrow">04 / ÚNETE AL RUIDO</p>
      <h2>
        NO TE QUEDES
        <br />
        <i>AFUERA.</i>
      </h2>
      <p>Los drops son solo para registrados. Recibe tu código secreto antes que nadie.</p>
      <RegisterForm variant="red" />
    </section>
  )
}
