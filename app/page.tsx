'use client'

import { useState } from 'react'
import { ArrowDown, ArrowRight, Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'

const products = [
  { name: 'Camiseta Ruido', price: '$129.900', tag: 'Nuevo', image: '/hostil-categories.png', position: '0% center' },
  { name: 'Cargo Insurrecto', price: '$219.900', tag: 'Bestseller', image: '/hostil-hero.png', position: 'center center' },
  { name: 'Hoodie Sin Permiso', price: '$249.900', tag: 'Edición limitada', image: '/hostil-lookbook.png', position: 'center center' },
]

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  // Nuevos estados para los 3 botones
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#0c0c0c] text-[#f4f1ed] selection:bg-[#df2d22] selection:text-white">
      <div className="announcement">ENVÍO GRATIS EN COMPRAS SUPERIORES A $250.000 <span>•</span> CAMBIOS FÁCILES</div>
      
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0c0c]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between px-5 lg:px-10">
          <button className="lg:hidden" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Menu size={23} />
          </button>
          
          <a href="#inicio" className="brand-mark">HOSTIL<span>®</span></a>
          
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
            <a href="#nuevo">NUEVO</a>
            <a href="#coleccion">COLECCIÓN</a>
            <a href="#esenciales">ESENCIALES</a>
            <a href="#nosotros">NOSOTROS</a>
          </nav>
          
          {/* Botones de acción actualizados */}
          <div className="flex items-center gap-4">
            <button aria-label="Buscar" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search size={20} className="hover:text-[#df2d22] transition-colors" />
            </button>
            <button aria-label="Favoritos / Acceso" onClick={() => setIsAuthOpen(true)}>
              <Heart size={20} className="hover:text-[#df2d22] transition-colors" />
            </button>
            <button className="relative" aria-label="Carrito" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} className="hover:text-[#df2d22] transition-colors" />
              {cartCount > 0 && <b className="absolute -bottom-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#df2d22] text-[10px] text-white">{cartCount}</b>}
            </button>
          </div>
        </div>

        {/* 1. Barra de Búsqueda Desplegable */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-[#151515] border-b border-white/10 px-5 py-4 flex items-center justify-center animate-in slide-in-from-top-2">
            <div className="flex w-full max-w-2xl items-center border-b border-white/30 pb-2">
              <Search size={20} className="text-white/50 mr-3" />
              <input 
                type="text" 
                autoFocus
                placeholder="BUSCAR PRENDAS, COLECCIONES..." 
                className="w-full bg-transparent text-lg outline-none placeholder:text-white/30 uppercase"
              />
              <button onClick={() => setIsSearchOpen(false)}><X size={20} /></button>
            </div>
          </div>
        )}
      </header>

      {/* --- Resto del contenido de la página intacto --- */}
      <section id="inicio" className="hero-section">
        <div className="hero-copy"><p className="eyebrow">HOSTIL / FW26</p><h1>VISTE<br /><em>EL RUIDO.</em></h1><p className="hero-description">Ropa para quienes no piden permiso.<br />Diseñada en Colombia, hecha para moverse.</p><a className="button-primary" href="#nuevo">Comprar colección <ArrowRight size={17} /></a></div>
        <div className="hero-image" role="img" aria-label="Campaña Hostil de moda urbana"></div>
        <div className="hero-stamp">NO<br />APOLOGIES<br /><span>●</span></div>
        <a className="scroll-cue" href="#nuevo"><ArrowDown size={18} /> SCROLL PARA EXPLORAR</a>
      </section>

      <section id="nuevo" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28"><div className="section-heading"><div><p className="eyebrow red">01 / DROP ACTUAL</p><h2>LO QUE ESTÁ<br /><i>SONANDO.</i></h2></div><a className="text-link" href="#coleccion">Ver todo <ArrowRight size={16} /></a></div><div className="product-grid">{products.map((product) => <article className="product-card" key={product.name}><div className="product-image" style={{ backgroundImage: `url(${product.image})`, backgroundPosition: product.position }}><span className="product-tag">{product.tag}</span><button className="quick-add" onClick={() => setCartCount((count) => count + 1)}>+ Añadir</button></div><div className="mt-4 flex justify-between gap-4"><div><h3>{product.name}</h3><p className="muted">Unisex / Negro</p></div><strong>{product.price}</strong></div></article>)}</div></section>

      <section id="coleccion" className="lookbook"><div className="lookbook-image"></div><div className="lookbook-copy"><p className="eyebrow red">02 / MANIFIESTO</p><h2>NO SOMOS<br /><i>PARA TODOS.</i></h2><p>Hostil nace de la calle, del ruido y de las ganas de hacer las cosas distinto. Prendas que hablan antes que tú.</p><a className="button-outline" href="#nosotros">Conoce la historia <ArrowRight size={17} /></a></div></section>

      <section id="esenciales" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28"><div className="section-heading"><div><p className="eyebrow red">03 / CATEGORÍAS</p><h2>ENCUENTRA<br /><i>TU UNIFORME.</i></h2></div></div><div className="category-grid"><a className="category-card category-one" href="#nuevo"><span>01</span><strong>CAMISETAS</strong><ArrowRight /></a><a className="category-card category-two" href="#nuevo"><span>02</span><strong>INFERIORES</strong><ArrowRight /></a><a className="category-card category-three" href="#nuevo"><span>03</span><strong>ACCESORIOS</strong><ArrowRight /></a></div></section>

      <section id="nosotros" className="newsletter"><p className="eyebrow">04 / ÚNETE AL RUIDO</p><h2>NO TE QUEDES<br /><i>AFUERA.</i></h2><p>Recibe drops, lanzamientos y códigos secretos antes que nadie.</p>{subscribed ? <p className="success-message">Listo. Bienvenido a la resistencia.</p> : <form onSubmit={(event) => { event.preventDefault(); if (email) setSubscribed(true) }}><input type="email" required placeholder="Tu correo electrónico" aria-label="Tu correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} /><button aria-label="Suscribirme"><ArrowRight /></button></form>}</section>
      
      <footer><div className="brand-mark">HOSTIL<span>®</span></div><p>Hecho para incomodar.</p><div className="footer-links"><a href="#inicio">Instagram</a><a href="#inicio">TikTok</a><a href="#inicio">Contacto</a><a href="#inicio">Envíos y cambios</a></div><small>© 2026 HOSTIL. Todos los derechos reservados.</small></footer>

      {/* 2. Modal de Registro / Acceso (Botón Favoritos) */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c0c0c] border border-white/10 p-8 relative">
            <button className="absolute top-4 right-4" onClick={() => setIsAuthOpen(false)}><X size={20} /></button>
            <h3 className="text-2xl font-black uppercase mb-2">Acceso Exclusivo</h3>
            <p className="text-white/60 text-sm mb-6">Regístrate para guardar favoritos y recibir los PIN de los nuevos drops.</p>
            <form className="flex flex-col gap-4">
              <input type="email" placeholder="CORREO ELECTRÓNICO" className="w-full bg-[#151515] border border-white/20 p-3 outline-none focus:border-[#df2d22]" />
              <button className="bg-white text-black font-bold py-3 uppercase hover:bg-[#df2d22] hover:text-white transition-colors">Continuar</button>
            </form>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">¿Ya tienes un PIN de colección?</p>
              <div className="flex gap-2">
                <input type="text" placeholder="INGRESA EL PIN" className="w-full bg-[#151515] border border-white/20 p-2 outline-none focus:border-[#df2d22] text-sm" />
                <button className="bg-[#df2d22] px-4 font-bold uppercase text-sm">Entrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Panel Lateral del Carrito (Drawer) */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-[#0c0c0c] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-xl font-black uppercase">Tu Carrito ({cartCount})</h3>
              <button onClick={() => setIsCartOpen(false)}><X size={20} /></button>
            </div>
            <div className="flex-1 p-5 flex flex-col items-center justify-center text-white/50">
              {cartCount === 0 ? (
                <p>Tu carrito está vacío.</p>
              ) : (
                <p>Tienes {cartCount} prendas por revisar.</p>
                /* Aquí luego mapearemos los productos agregados */
              )}
            </div>
            {cartCount > 0 && (
              <div className="p-5 border-t border-white/10">
                <button className="w-full bg-white text-black font-bold py-4 uppercase hover:bg-[#df2d22] hover:text-white transition-colors">
                  Pagar Pedido
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Menú móvil */}
      {menuOpen && <div className="fixed inset-0 z-50 bg-[#0c0c0c] p-6"><div className="flex justify-between"><span className="brand-mark">HOSTIL<span>®</span></span><button aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}><X /></button></div><nav className="mt-20 flex flex-col gap-8 text-4xl font-black uppercase"><a href="#nuevo" onClick={() => setMenuOpen(false)}>Nuevo</a><a href="#coleccion" onClick={() => setMenuOpen(false)}>Colección</a><a href="#esenciales" onClick={() => setMenuOpen(false)}>Esenciales</a><a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a></nav></div>}
    </main>
  )
}