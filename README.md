# HOSTIL — tienda de drops privados

Tienda de ropa urbana donde **las colecciones (drops) solo están disponibles para personas registradas**.
Cuando sale un drop, el sitio se bloquea, se muestran spoilers difuminados y cada registrado
recibe por correo **un código personal** para entrar.

## Características

- Registro de clientes en PostgreSQL con autorización de tratamiento de datos (Ley 1581).
- Drops con ciclo de vida: `Borrador → Teaser → En vivo → Cerrado`.
- Sitio bloqueado mientras hay un drop activo; landing pública cuando no lo hay.
- Código **único por persona y por drop** (se guarda solo su hash; se puede revocar).
- Imágenes spoiler generadas en el servidor: la foto real nunca llega sin acceso.
- Correos con Resend (en desarrollo se imprimen en la terminal).
- Panel `/admin` para crear drops, agregar productos, lanzar y revocar códigos.
- Límite de intentos contra fuerza bruta.

## Tecnologías

| Pieza                                                    | Para qué                                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Next.js 16](https://nextjs.org) (App Router) + React 19 | Frontend y backend en un mismo proyecto (Server Components, Server Actions, Route Handlers) |
| TypeScript                                               | Tipos en todo el código                                                                     |
| Tailwind CSS 4 + CSS propio                              | Estilos (`app/globals.css`)                                                                 |
| PostgreSQL (Neon) + Prisma 7                             | Base de datos y acceso tipado                                                               |
| Resend                                                   | Envío de correos                                                                            |
| sharp                                                    | Genera las imágenes spoiler                                                                 |
| Zod                                                      | Validación de formularios en el servidor                                                    |
| Vitest                                                   | Tests unitarios                                                                             |
| Vercel                                                   | Hosting y despliegue                                                                        |

## Requisitos

- Node.js 22.12 o superior
- pnpm 12 (`corepack enable` lo activa automáticamente con la versión de `package.json`)
- Una base de datos PostgreSQL (recomendado: una rama `dev` gratuita en [Neon](https://neon.tech), o Docker)

## Instalación

```bash
corepack enable          # activa pnpm con la versión exacta del proyecto
pnpm install             # instala dependencias y genera el cliente de Prisma
cp .env.example .env     # en Windows (PowerShell): copy .env.example .env
```

Rellena `.env` (el archivo explica cada variable). Para generar `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Crea las tablas y carga datos de ejemplo:

```bash
pnpm db:deploy   # aplica las migraciones de prisma/migrations
pnpm db:seed     # drop de demo en borrador + usuario de prueba (SEED_USER_EMAIL)
```

## Ejecución

```bash
pnpm dev         # http://localhost:3000  (panel: http://localhost:3000/admin)
```

Sin `RESEND_API_KEY`, los correos (con los códigos) aparecen en la terminal donde corre `pnpm dev`.

### Probar el flujo completo en local

1. Entra a `/admin` con tu `ADMIN_PASSWORD` y abre el drop **FW26 Sin Permiso**.
2. **Pasar a Teaser** → abre `/` en una ventana de incógnito: verás el sitio bloqueado con spoilers.
3. **Pasar a En vivo** → en la terminal aparece el correo con el código del usuario de prueba.
4. En incógnito, abre el enlace del correo (o `/acceso`) y entra: ves la tienda del drop.
5. **Pasar a Cerrado** → el sitio vuelve a la landing pública.

## Scripts

| Comando                           | Qué hace                                                          |
| --------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                        | Servidor de desarrollo                                            |
| `pnpm build`                      | Genera el cliente de Prisma y compila para producción             |
| `pnpm start`                      | Sirve el build de producción                                      |
| `pnpm typecheck`                  | Revisa los tipos de TypeScript                                    |
| `pnpm test`                       | Ejecuta los tests (Vitest)                                        |
| `pnpm format`                     | Formatea el código con Prettier                                   |
| `pnpm db:migrate --name <cambio>` | Crea una migración tras editar `prisma/schema.prisma`             |
| `pnpm db:deploy`                  | Aplica las migraciones pendientes (lo hace Vercel en cada deploy) |
| `pnpm db:seed`                    | Datos de ejemplo                                                  |
| `pnpm db:studio`                  | Interfaz visual para ver/editar la base de datos                  |

## Variables de entorno

Ver [`.env.example`](.env.example). Resumen: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
`ADMIN_PASSWORD`, `APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`.

## Deployment

Paso a paso en [`docs/DESPLIEGUE.md`](docs/DESPLIEGUE.md) (Neon + Resend + Vercel).
**GitHub Pages no sirve para este proyecto**: solo publica archivos estáticos y aquí hay
base de datos, sesiones y envío de correos.

## Estructura del proyecto

```text
app/                    Rutas (cada carpeta es una URL)
  page.tsx              /          landing pública o tienda del drop (decide el servidor)
  drop/                 /drop      sitio bloqueado: spoilers + registro
  acceso/               /acceso    entrar con correo + código (llega el enlace del correo)
  admin/                /admin     panel (login, drops, productos, códigos)
  api/imagenes/[id]/    imágenes de productos: real o spoiler según el acceso
  actions/access.ts     Server Actions públicas (registro, entrar, salir)
components/
  site/                 Secciones de la tienda (header, hero, productos...)
  drop/                 Pantalla de drop bloqueado, cuenta regresiva, spoilers
  forms/                Formularios de registro y acceso
  admin/                Piezas del panel
lib/
  auth/                 Códigos, cookies firmadas, sesiones, límite de intentos, admin
  drops/                Reglas de estados, consultas (DAL) y envío de códigos
  email/                Plantillas y envío con Resend
  db.ts  env.ts  images.ts  validation.ts  format.ts
prisma/                 schema.prisma, migraciones y seed
storage/drops/<slug>/   Fotos PRIVADAS de cada drop (ver storage/README.md)
tests/                  Tests unitarios
docs/                   Arquitectura, despliegue y auditoría
```

Cómo funciona por dentro: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).
