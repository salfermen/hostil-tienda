'use client'

import { X } from 'lucide-react'
import { useCart } from '@/components/site/cart-context'

/** Panel lateral del carrito. El pago real se integra en una fase posterior. */
export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { count } = useCart()
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="animate-in slide-in-from-right fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#0c0c0c] shadow-2xl"
        aria-label="Carrito"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h3 className="text-xl font-black uppercase">Tu carrito ({count})</h3>
          <button aria-label="Cerrar carrito" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-5 text-white/50">
          <p>{count === 0 ? 'Tu carrito está vacío.' : `Tienes ${count} prendas por revisar.`}</p>
        </div>
        {count > 0 && (
          <div className="border-t border-white/10 p-5">
            <button className="w-full bg-white py-4 font-bold text-black uppercase transition-colors hover:bg-[#df2d22] hover:text-white">
              Pagar pedido
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
