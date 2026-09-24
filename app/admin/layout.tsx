import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Admin — HOSTIL',
  robots: { index: false, follow: false }, // que Google no indexe el panel
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin">{children}</div>
}
