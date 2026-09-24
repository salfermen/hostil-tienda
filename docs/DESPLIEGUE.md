# Despliegue a producción (Vercel + Neon + Resend)

Tiempo estimado la primera vez: 30–45 minutos. Todo tiene plan gratuito para empezar.

```text
GitHub (código) ──push──► Vercel (build + hosting) ──► Neon (PostgreSQL)
                                   └──────────────────► Resend (correos)
```

Cada `git push` a `main` despliega a producción. Cada pull request crea una URL de
**preview** para probar antes de publicar.

---

## 0. Antes de empezar: apagar GitHub Pages

GitHub Pages solo sirve archivos estáticos; este proyecto necesita servidor. En el repo:
**Settings → Pages → Source: None** (o "Unpublish site"). El workflow viejo ya se eliminó.

## 1. Base de datos en Neon

1. Crea una cuenta en <https://neon.tech> y un proyecto (región: la más cercana a tus clientes, p. ej. `us-east`).
2. Neon crea una rama `main` (producción). Crea otra rama llamada `dev` para desarrollo y previews.
3. En **Connect** copia dos cadenas de conexión de cada rama:
   - **Pooled** (el host tiene `-pooler`) → `DATABASE_URL`
   - **Direct** (sin `-pooler`) → `DIRECT_URL`
4. Pon las de la rama `dev` en tu `.env` local y ejecuta:

   ```bash
   pnpm db:deploy   # crea las tablas
   pnpm db:seed     # opcional: datos de ejemplo
   ```

> ¿Por qué dos URLs? La app abre muchas conexiones cortas (una por petición); el _pooler_
> las reutiliza. Las migraciones necesitan una conexión directa y estable.

## 2. Correos con Resend

1. Crea una cuenta en <https://resend.com> → **API Keys → Create** → guárdala como `RESEND_API_KEY`.
2. **Domains → Add domain** con tu dominio (p. ej. `hostil.co`) y agrega los registros DNS que te indica
   (SPF y DKIM) en tu proveedor de dominio. Sin dominio verificado solo puedes enviarte correos a ti mismo.
3. Cuando el dominio esté verificado: `EMAIL_FROM="HOSTIL <drops@hostil.co>"`.

**Límites del plan gratuito** (septiembre 2026): 100 correos/día y 3.000/mes. Si tienes más de
100 registrados, un lanzamiento se quedaría a medias ese día: pasa al plan Pro (USD 20/mes,
50.000 correos, sin límite diario) antes del primer drop grande. Revisa <https://resend.com/pricing>.

## 3. Proyecto en Vercel

1. <https://vercel.com> → **Add New → Project** → importa `salfermen/hostil-tienda`.
2. Framework: Next.js (se detecta solo). No cambies los comandos: `vercel.json` ya define
   `pnpm db:deploy && pnpm build` (aplica migraciones y compila).
3. **Environment Variables** (Settings → Environment Variables):

   | Variable                       | Production                      | Preview                           |
   | ------------------------------ | ------------------------------- | --------------------------------- |
   | `DATABASE_URL`                 | pooled de Neon `main`           | pooled de Neon `dev`              |
   | `DIRECT_URL`                   | direct de Neon `main`           | direct de Neon `dev`              |
   | `AUTH_SECRET`                  | uno nuevo y largo               | otro distinto                     |
   | `ADMIN_PASSWORD`               | contraseña fuerte               | otra                              |
   | `APP_URL`                      | `https://tu-dominio.com`        | URL de preview o la de producción |
   | `RESEND_API_KEY`               | tu API key                      | la misma o una de pruebas         |
   | `EMAIL_FROM`                   | `HOSTIL <drops@tu-dominio.com>` | igual                             |
   | `ENABLE_EXPERIMENTAL_COREPACK` | `1`                             | `1`                               |

   `ENABLE_EXPERIMENTAL_COREPACK=1` hace que Vercel use exactamente el pnpm de `package.json`
   (12.x). Sin ella, Vercel usa pnpm 9/10.

4. **Deploy**. Cuando termine, abre la URL y entra a `/admin`.

> Nunca apuntes las previews a la base de datos de producción: cada preview ejecuta migraciones.

## 4. Dominio propio

Vercel → Settings → **Domains → Add** → sigue las instrucciones de DNS. Después actualiza
`APP_URL` a `https://tu-dominio.com` y vuelve a desplegar (los enlaces de los correos la usan).

## 5. Flujo de trabajo del día a día

```bash
git switch -c feat/lo-que-sea     # rama nueva para cada cambio
pnpm dev                          # desarrollar y probar en local
pnpm typecheck && pnpm test       # verificar
git add -A && git commit -m "..." # commit
git push -u origin feat/lo-que-sea
```

En GitHub abre un **Pull Request** hacia `main`: GitHub Actions corre tipos, tests y build
(`.github/workflows/ci.yml`) y Vercel te da una URL de preview. Si todo está bien, **Merge** →
se despliega a producción automáticamente.

### Si cambias la base de datos

```bash
# 1. edita prisma/schema.prisma
pnpm db:migrate --name agrega_talla_a_producto   # crea el SQL en prisma/migrations y lo aplica en tu BD dev
# 2. haz commit de la carpeta de la migración
```

Vercel aplica la migración en producción en el siguiente deploy (`prisma migrate deploy`).
Nunca edites una migración que ya se aplicó en producción: crea una nueva.

## 6. Lanzar un drop (checklist)

1. Copia las fotos a `storage/drops/<slug>/`, commit y push (ver `storage/README.md`).
2. `/admin` → **Nuevo drop** (borrador) → agrega los productos.
3. Revisa los spoilers con los enlaces "ver" de la tabla de productos.
4. **Pasar a Teaser** unos días antes: el sitio se bloquea y la gente se registra.
5. El día del lanzamiento: **Pasar a En vivo** → se envían los códigos.
   Si aparecen "Pendientes", pulsa **Enviar códigos pendientes** hasta que quede en 0.
6. Vigila la tabla "Más usados" y revoca códigos compartidos.
7. Al terminar: **Pasar a Cerrado** (o usa la fecha de cierre automático).

## Solución de problemas

| Síntoma                                            | Causa probable                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| Build falla con `Variables de entorno inválidas`   | Falta una variable en Vercel para ese entorno                             |
| Build falla en `prisma migrate deploy`             | `DIRECT_URL` incorrecta o la BD no acepta conexiones                      |
| Los correos no llegan                              | Dominio sin verificar en Resend, límite diario alcanzado, o están en spam |
| "No hay imágenes en storage/drops/..." en el admin | La carpeta no coincide con el slug o no se hizo push                      |
| Los enlaces del correo apuntan a localhost         | `APP_URL` mal configurada en producción                                   |
