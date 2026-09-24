/** @type {import('next').NextConfig} */
const nextConfig = {
  // Antes estaba `typescript.ignoreBuildErrors: true`, que dejaba pasar errores de tipos a producción.
  // Ahora, si TypeScript falla, el build falla: mejor enterarse en tu PC que en producción.
  images: {
    unoptimized: true,
  },
  // Las imágenes de los drops viven en storage/ (NO en public/, que es accesible para cualquiera).
  // Le decimos a Next que incluya esa carpeta en las funciones que la leen al desplegar en Vercel.
  outputFileTracingIncludes: {
    '/api/imagenes/*': ['./storage/**/*'],
    '/admin/**': ['./storage/**/*'],
  },
}

export default nextConfig
