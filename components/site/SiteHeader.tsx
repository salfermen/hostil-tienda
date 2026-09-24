'use client'

import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { navLinks } from '@/lib/content/site'
import { useCart } from '@/components/site/cart-context'
import { AuthModal } from '@/components/site/AuthModal'
import { CartDrawer } from '@/components/site/CartDrawer'

export function SiteHeader() {
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <div className="announcement">
        ENVÍO GRATIS EN COMPRAS SUPERIORES A $250.000 <span>•</span> CAMBIOS FÁCILES
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0c0c0c]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1400px] items-center justify-between px-5 lg:px-10">
          <button className="lg:hidden" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
            <Menu size={23} />
          </button>

          <a href="#inicio" className="brand-mark">
            HOSTIL<span>®</span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label.toUpperCase()}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              aria-label="Buscar"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((o) => !o)}
            >
              <Search size={20} className="transition-colors hover:text-[#df2d22]" />
            </button>
            <button aria-label="Registro y acceso" onClick={() => setAuthOpen(true)}>
              <Heart size={20} className="transition-colors hover:text-[#df2d22]" />
            </button>
            <button className="relative" aria-label="Carrito" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} className="transition-colors hover:text-[#df2d22]" />
              {count > 0 && (
                <b className="absolute -right-2 -bottom-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#df2d22] text-[10px] text-white">
                  {count}
                </b>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="animate-in slide-in-from-top-2 absolute top-full left-0 flex w-full items-center justify-center border-b border-white/10 bg-[#151515] px-5 py-4">
            <div className="flex w-full max-w-2xl items-center border-b border-white/30 pb-2">
              <Search size={20} className="mr-3 text-white/50" />
              <input
                type="text"
                autoFocus
                placeholder="BUSCAR PRENDAS, COLECCIONES..."
                className="w-full bg-transparent text-lg uppercase outline-none placeholder:text-white/30"
              />
              <button aria-label="Cerrar búsqueda" onClick={() => setSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c0c0c] p-6">
          <div className="flex justify-between">
            <span className="brand-mark">
              HOSTIL<span>®</span>
            </span>
            <button aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}>
              <X />
            </button>
          </div>
          <nav className="mt-20 flex flex-col gap-8 text-4xl font-black uppercase">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
