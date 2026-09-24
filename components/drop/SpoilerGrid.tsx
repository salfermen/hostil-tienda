/**
 * Imágenes "spoiler": el servidor entrega una versión pequeña y difuminada
 * (/api/imagenes/:id?v=spoiler). La foto real nunca llega al navegador sin acceso.
 */
export function SpoilerGrid({ products }: { products: { id: string }[] }) {
  if (products.length === 0) return null
  return (
    <div className="spoiler-grid">
      {products.map((p, i) => (
        <figure key={p.id} className="spoiler-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/imagenes/${p.id}?v=spoiler`} alt={`Spoiler ${i + 1}`} loading="lazy" />
          <figcaption>SPOILER {String(i + 1).padStart(2, '0')}</figcaption>
        </figure>
      ))}
    </div>
  )
}
