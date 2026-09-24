import { formatCop } from '@/lib/format'
import { ProductCard } from '@/components/site/ProductCard'
import { SectionHeading } from '@/components/site/SectionHeading'

type Product = {
  id: string
  name: string
  description: string | null
  priceCop: number
  tag: string | null
}

/** Productos del drop desbloqueado. Las imágenes pasan por /api/imagenes (verifica el acceso). */
export function DropProducts({ dropName, products }: { dropName: string; products: Product[] }) {
  return (
    <section id="nuevo" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
      <SectionHeading
        eyebrow={`01 / ${dropName.toUpperCase()}`}
        title="LO QUE ESTÁ"
        accent="SONANDO."
      />
      {products.length === 0 ? (
        <p className="muted">Este drop aún no tiene productos.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              name={p.name}
              price={formatCop(p.priceCop)}
              tag={p.tag}
              subtitle={p.description ?? undefined}
              image={`/api/imagenes/${p.id}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
