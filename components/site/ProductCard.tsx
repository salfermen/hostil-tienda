'use client'

import { useCart } from '@/components/site/cart-context'

type Props = {
  name: string
  price: string
  tag?: string | null
  subtitle?: string
  /** URL de la imagen (pública en la landing, /api/imagenes/... en los drops). */
  image: string
  position?: string
}

export function ProductCard({
  name,
  price,
  tag,
  subtitle = 'Unisex / Negro',
  image,
  position,
}: Props) {
  const { add } = useCart()
  return (
    <article className="product-card">
      <div
        className="product-image"
        role="img"
        aria-label={name}
        style={{
          backgroundImage: `url(${image})`,
          backgroundPosition: position ?? 'center center',
        }}
      >
        {tag && <span className="product-tag">{tag}</span>}
        <button className="quick-add" onClick={add}>
          + Añadir
        </button>
      </div>
      <div className="mt-4 flex justify-between gap-4">
        <div>
          <h3>{name}</h3>
          <p className="muted">{subtitle}</p>
        </div>
        <strong>{price}</strong>
      </div>
    </article>
  )
}
