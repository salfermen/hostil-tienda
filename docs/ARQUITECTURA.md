# Arquitectura

## Idea general

Es un **monolito de Next.js**: frontend y backend viven en el mismo proyecto y se despliegan
juntos en Vercel. Para el tamaño actual es lo más simple de mantener; no necesitamos un
servidor aparte ni microservicios.

```text
Navegador ──► Vercel (Next.js) ──► PostgreSQL (Neon)
                     │
                     └──────────► Resend (correos)
```

Tres formas de "backend" dentro de Next, y cuándo usamos cada una:

| Pieza                 | Dónde                                           | Para qué                                                                                                   |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Server Components** | `app/**/page.tsx`                               | Leen la base de datos y deciden qué mostrar (p. ej. bloquear el sitio). No envían JavaScript al navegador. |
| **Server Actions**    | `app/actions/access.ts`, `app/admin/actions.ts` | Formularios que modifican datos (registrarse, entrar, lanzar un drop).                                     |
| **Route Handler**     | `app/api/imagenes/[productId]/route.ts`         | Cuando necesitamos una URL que devuelve algo que no es HTML (imágenes).                                    |

> Regla de oro: **toda decisión de seguridad se toma en el servidor.** Un componente con
> `'use client'` solo pinta la interfaz; nunca decide quién puede ver qué.

## Modelo de datos

```text
User 1───* AccessToken *───1 Drop 1───* Product

LoginAttempt (independiente: intentos fallidos para el límite de fuerza bruta)
```

- **User**: correo único, nombre opcional, `status` (ACTIVE/BLOCKED), `consentAt`.
- **Drop**: `slug`, nombre, descripción, `status`, `launchAt`, `endsAt` opcional.
- **Product**: pertenece a un drop; `imageKey` es el nombre del archivo en `storage/drops/<slug>/`.
- **AccessToken**: el "custom token". Uno por (usuario, drop). Guarda `tokenHash`, cuándo se
  envió, cuándo y cuántas veces se usó, y si fue revocado.

El esquema está en `prisma/schema.prisma`; el SQL real en `prisma/migrations/`.

## Ciclo de vida de un drop

```text
 DRAFT ────────► TEASER ────────► LIVE ────────► CLOSED
 oculto          sitio bloqueado   se envían los    landing pública
 (solo admin)    + spoilers        códigos; entran   otra vez
                 + registro        con su código
```

- Solo puede haber **un** drop en TEASER o LIVE a la vez (es el que bloquea el sitio).
- Si el drop tiene `endsAt` y ya pasó, se considera cerrado automáticamente (`lib/drops/status.ts`).
- **Pasar a En vivo = lanzar**: genera un código para cada registrado activo y envía los correos
  en lotes de 100. Si hay más de 300 pendientes, se envían por tandas con el botón
  "Enviar códigos pendientes" (para no superar el tiempo máximo de una función en Vercel).

## Flujo de acceso

```text
1. Visitante abre /
2. app/page.tsx pregunta a la capa de datos (lib/drops/queries.ts):
     getCurrentDrop()  → ¿hay drop TEASER/LIVE?     no → landing pública
     getDropAccess()   → ¿cookie válida para ESTE drop y token no revocado en la BD?
                          no → redirect('/drop')
                          sí → tienda del drop
3. En /drop o /acceso escribe correo + código → enterWithCodeAction:
     - límite de intentos (5 fallos por correo / 20 por IP en 15 min)
     - normaliza el código, calcula su hash y lo busca en la BD
     - comprueba: mismo drop, mismo correo, no revocado, usuario activo
     - crea la cookie firmada `hostil_access` (7 días, httpOnly) → redirect('/')
```

### Por qué un código por persona y no un PIN general

- Si un código se filtra en redes, sabes **de quién** era y lo revocas sin afectar a nadie más.
- El contador `useCount` en el admin delata códigos compartidos.
- El correo actúa como verificación: solo quien controla el buzón recibe el código.

### Por qué guardamos solo el hash del código

Igual que con las contraseñas: si alguien obtiene una copia de la base de datos, no puede
entrar. Consecuencia práctica: **un código no se puede reenviar**; cuando alguien pide otro,
se genera uno nuevo y el anterior deja de funcionar ("rotar").

### Sesiones

Cookies firmadas con HMAC (`lib/auth/signed.ts`), sin librerías externas. El contenido
(ids) se puede leer pero no modificar sin `AUTH_SECRET`. Además, en cada visita se confirma
contra la base de datos que el token siga vigente: revocar surte efecto de inmediato.

## Imágenes spoiler

```text
GET /api/imagenes/:id?v=spoiler  → 360px, difuminado, WebP (~2 KB). Público solo si el
                                   producto es del drop activo y tiene "spoiler" activado.
GET /api/imagenes/:id            → imagen real. Solo con acceso al drop (o admin). Si no: 403.
```

Las fotos están en `storage/` y no en `public/`: lo que está en `public/` se puede descargar
con la URL, aunque el sitio esté "bloqueado". Un `filter: blur()` en CSS tampoco sirve: con
"Inspeccionar" se ve la imagen original. Por eso el difuminado se hace en el servidor.

En la pantalla de teaser tampoco se envían nombres ni precios de productos (solo sus ids).

## Correos

`lib/email/send.ts` usa la API batch de Resend (100 por llamada). En desarrollo, sin
`RESEND_API_KEY`, imprime los correos en la terminal. Las plantillas son HTML con estilos
en línea (`lib/email/templates.ts`) para que se vean bien en Gmail/Outlook.

## Seguridad: resumen

| Riesgo                                       | Mitigación                                                            |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Adivinar códigos                             | ~50 bits de azar + límite de intentos por correo e IP                 |
| Robo de la base de datos                     | Solo hashes HMAC de los códigos                                       |
| Cookies manipuladas                          | Firma HMAC + `httpOnly` + `secure` en producción + verificación en BD |
| Llamar Server Actions del admin directamente | `requireAdmin()` al inicio de cada acción                             |
| Descargar fotos antes del drop               | Fotos fuera de `public/`, spoiler generado en servidor                |
| Averiguar quién está registrado              | El registro responde igual exista o no el correo                      |
| Inyección SQL                                | Prisma parametriza todas las consultas                                |
| Datos inválidos                              | Validación con Zod en el servidor                                     |
| Secretos en el repo                          | `.env` en `.gitignore`; solo se sube `.env.example`                   |

## Decisiones y alternativas

- **Prisma vs. Drizzle**: Prisma da un esquema legible y migraciones automáticas; ideal para aprender.
- **Cookies propias vs. Auth.js/Clerk**: el acceso es con código, no con cuenta+contraseña.
  Una librería de auth completa sería más complejidad de la necesaria hoy.
- **Límite de intentos en PostgreSQL vs. Redis**: suficiente para este volumen. Con mucho
  tráfico, pasar a Upstash Redis.
- **Fotos en el repo vs. almacenamiento de archivos**: simple y gratis, pero obliga a hacer commit
  por cada drop. Siguiente paso natural: Vercel Blob o Cloudflare R2 con subida desde el admin.
