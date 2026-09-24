/**
 * Contenido fijo de la landing pública (lo que se ve cuando no hay un drop activo).
 * Los productos de los drops NO van aquí: viven en la base de datos y se gestionan en /admin.
 */

export const navLinks = [
  { href: '#nuevo', label: 'Nuevo' },
  { href: '#coleccion', label: 'Colección' },
  { href: '#esenciales', label: 'Esenciales' },
  { href: '#nosotros', label: 'Nosotros' },
] as const

export type ShowcaseProduct = {
  name: string
  price: string
  tag: string
  image: string
  position: string
}

export const showcaseProducts: ShowcaseProduct[] = [
  {
    name: 'Camiseta Ruido',
    price: '$129.900',
    tag: 'Nuevo',
    image: '/hostil-categories.png',
    position: '0% center',
  },
  {
    name: 'Cargo Insurrecto',
    price: '$219.900',
    tag: 'Bestseller',
    image: '/hostil-hero.png',
    position: 'center center',
  },
  {
    name: 'Hoodie Sin Permiso',
    price: '$249.900',
    tag: 'Edición limitada',
    image: '/hostil-lookbook.png',
    position: 'center center',
  },
]

export const footerLinks = [
  { href: '#inicio', label: 'Instagram' },
  { href: '#inicio', label: 'TikTok' },
  { href: '#inicio', label: 'Contacto' },
  { href: '#inicio', label: 'Envíos y cambios' },
] as const
