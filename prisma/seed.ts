/**
 * Datos de ejemplo para desarrollo:  pnpm db:seed
 *
 * Crea un drop "demo-fw26" en BORRADOR con 3 productos (las imágenes están en
 * storage/drops/demo-fw26/). Si defines SEED_USER_EMAIL en .env, también crea ese usuario
 * para que puedas probar el flujo completo recibiendo el código.
 *
 * Es idempotente: puedes ejecutarlo varias veces sin duplicar datos.
 */
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const products = [
  {
    name: 'Camiseta Ruido',
    priceCop: 129900,
    tag: 'Nuevo',
    imageKey: 'camiseta-ruido.webp',
    sortOrder: 0,
  },
  {
    name: 'Cargo Insurrecto',
    priceCop: 219900,
    tag: 'Bestseller',
    imageKey: 'cargo-insurrecto.webp',
    sortOrder: 1,
  },
  {
    name: 'Hoodie Sin Permiso',
    priceCop: 249900,
    tag: 'Edición limitada',
    imageKey: 'hoodie-sin-permiso.webp',
    sortOrder: 2,
  },
]

async function main() {
  const launchAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // en 3 días

  const drop = await db.drop.upsert({
    where: { slug: 'demo-fw26' },
    update: {},
    create: {
      slug: 'demo-fw26',
      name: 'FW26 Sin Permiso',
      description: 'La colección de otoño-invierno. Solo para registrados, unidades limitadas.',
      launchAt,
    },
  })

  const existing = await db.product.count({ where: { dropId: drop.id } })
  if (existing === 0) {
    await db.product.createMany({
      data: products.map((p) => ({ ...p, dropId: drop.id, description: 'Unisex / Negro' })),
    })
  }

  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase()
  if (email) {
    await db.user.upsert({
      where: { email },
      update: {},
      create: { email, name: 'Prueba', consentAt: new Date() },
    })
  }

  console.log(`Seed listo: drop "${drop.name}" (${drop.status}) con ${products.length} productos.`)
  if (email) console.log(`Usuario de prueba: ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
