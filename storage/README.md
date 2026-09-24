# storage/ — imágenes privadas de los drops

Todo lo que está en `public/` lo puede descargar cualquiera. Las fotos de un drop
**no deben verse antes del lanzamiento**, por eso viven aquí y se sirven a través de
`/api/imagenes/[id]`, que decide si entrega la foto real o el spoiler difuminado.

## Cómo agregar las fotos de un drop nuevo

1. Crea una carpeta con el **slug** del drop: `storage/drops/<slug>/`
   (el slug es el que pusiste al crear el drop en `/admin`).
2. Copia las fotos (`.png`, `.jpg`, `.webp` o `.avif`; nombres sin espacios, p. ej. `hoodie-negro.webp`).
   Recomendado: 900–1400 px de ancho y en WebP para que pesen poco.
3. `git add storage/drops/<slug> && git commit -m "Fotos del drop <slug>"` y `git push`.
4. Cuando Vercel termine de desplegar, en `/admin` → el drop → "Agregar producto" ya puedes elegirlas.

`demo-fw26/` son imágenes de ejemplo que usa `pnpm db:seed`. Puedes borrarlas cuando tengas tus drops reales.

> Si en el futuro quieres subir fotos desde el panel sin hacer commit, el siguiente paso es
> usar un almacenamiento de archivos (por ejemplo Vercel Blob o Cloudflare R2).
