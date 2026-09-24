import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/site/SectionHeading'

const categories = [
  { n: '01', label: 'CAMISETAS', className: 'category-one' },
  { n: '02', label: 'INFERIORES', className: 'category-two' },
  { n: '03', label: 'ACCESORIOS', className: 'category-three' },
]

export function Categories() {
  return (
    <section id="esenciales" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
      <SectionHeading eyebrow="03 / CATEGORÍAS" title="ENCUENTRA" accent="TU UNIFORME." />
      <div className="category-grid">
        {categories.map((c) => (
          <a key={c.n} className={`category-card ${c.className}`} href="#nuevo">
            <span>{c.n}</span>
            <strong>{c.label}</strong>
            <ArrowRight />
          </a>
        ))}
      </div>
    </section>
  )
}
