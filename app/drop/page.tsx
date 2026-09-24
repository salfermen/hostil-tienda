import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentDrop, getDropAccess, getTeaserProducts } from '@/lib/drops/queries'
import { DropGate } from '@/components/drop/DropGate'

export const metadata: Metadata = { title: 'Drop privado — HOSTIL' }

export default async function DropPage() {
  const drop = await getCurrentDrop()
  if (!drop) redirect('/') // no hay drop activo: el sitio está abierto
  if (await getDropAccess(drop)) redirect('/') // ya tiene acceso

  const spoilers = await getTeaserProducts(drop.id)
  return <DropGate drop={drop} spoilers={spoilers} />
}
