'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { RegisterForm } from '@/components/forms/RegisterForm'

/** Modal del botón ♥: registro para recibir los códigos de los drops. */
export function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="relative w-full max-w-md border border-white/10 bg-[#0c0c0c] p-8">
        <button className="absolute top-4 right-4" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 id="auth-title" className="mb-2 text-2xl font-black uppercase">
          Acceso exclusivo
        </h3>
        <p className="mb-6 text-sm text-white/60">
          Los drops de HOSTIL son solo para registrados. Déjanos tu correo y te enviamos tu código
          personal cuando salga una colección.
        </p>
        <RegisterForm variant="dark" />
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="mb-3 text-xs tracking-wider text-white/50 uppercase">
            ¿Ya tienes tu código?
          </p>
          <Link
            href="/acceso"
            className="inline-block bg-[#df2d22] px-4 py-2 text-sm font-bold uppercase"
            onClick={onClose}
          >
            Entrar con mi código
          </Link>
        </div>
      </div>
    </div>
  )
}
