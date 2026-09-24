import { showcaseProducts } from '@/lib/content/site'
import { ProductCard } from '@/components/site/ProductCard'
import { SectionHeading } from '@/components/site/SectionHeading'

/** Vitrina de la landing pública (contenido fijo, imágenes públicas). */
export function ShowcaseProducts() {
  return (
    <section id="nuevo" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
      <SectionHeading
        eyebrow="01 / DROP ACTUAL"
        title="LO QUE ESTÁ"
        accent="SONANDO."
        link={{ href: '#coleccion', label: 'Ver todo' }}
      />
      <div className="product-grid">
        {showcaseProducts.map((p) => (
          <ProductCard key={p.name} {...p} />
        ))}
      </div>
    </section>
  )
}
