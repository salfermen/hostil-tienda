'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

/**
 * Estado del carrito compartido entre el header (contador) y las tarjetas de producto.
 * Por ahora solo cuenta prendas; cuando integremos pagos guardará los productos reales.
 */
type CartContextValue = { count: number; add: () => void }

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  return (
    <CartContext.Provider value={{ count, add: () => setCount((c) => c + 1) }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
