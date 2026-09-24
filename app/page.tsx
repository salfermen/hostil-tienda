import { redirect } from 'next/navigation'
import { getCurrentDrop, getDropAccess, getDropProducts } from '@/lib/drops/queries'
import { CartProvider } from '@/components/site/cart-context'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Hero } from '@/components/site/Hero'
import { ShowcaseProducts } from '@/components/site/ShowcaseProducts'
import { DropProducts } from '@/components/site/DropProducts'
import { Lookbook } from '@/components/site/Lookbook'
import { Categories } from '@/components/site/Categories'
import { JoinSection } from '@/components/site/JoinSection'
import { SiteFooter } from '@/components/site/SiteFooter'
import { AccessBar } from '@/components/site/AccessBar'

/**
 * Página principal. La decisión se toma en el SERVIDOR (este componente no es 'use client'):
 *
 *   ¿Hay un drop activo?
 *     no → landing pública
 *     sí → ¿tiene acceso?  no → /drop (sitio bloqueado)
 *                          sí → tienda del drop
 */
export default async function HomePage() {
  const drop = await getCurrentDrop()

  if (!drop) {
    return (
      <CartProvider>
        <main className="min-h-screen bg-[#0c0c0c] text-[#f4f1ed]">
          <SiteHeader />
          <Hero />
          <ShowcaseProducts />
          <Lookbook />
          <Categories />
          <JoinSection />
          <SiteFooter />
        </main>
      </CartProvider>
    )
  }

  const access = await getDropAccess(drop)
  if (!access) redirect('/drop')

  const products = await getDropProducts(drop.id)
  const who = access.via === 'admin' ? 'vista de admin' : (access.userName ?? 'registrado')

  return (
    <CartProvider>
      <main className="min-h-screen bg-[#0c0c0c] text-[#f4f1ed]">
        <AccessBar dropName={drop.name} who={who} />
        <SiteHeader />
        <Hero eyebrow={`HOSTIL / ${drop.name.toUpperCase()}`} ctaLabel="Ver el drop" />
        <DropProducts dropName={drop.name} products={products} />
        <Lookbook />
        <Categories />
        <SiteFooter />
      </main>
    </CartProvider>
  )
}
