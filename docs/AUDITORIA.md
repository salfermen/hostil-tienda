# Auditoría inicial (24 sep 2026)

Estado del repositorio antes de la rama `feat/backend-drops` y qué se hizo con cada punto.

## Qué había

Landing de Next.js 16 generada con v0: una sola página (`app/page.tsx`, un componente cliente
de 145 líneas), CSS minificado en líneas muy largas, sin backend, sin base de datos y con
formularios que no guardaban nada.

## Hallazgos

| #   | Severidad  | Hallazgo                                                                                                         | Estado                                                  |
| --- | ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Bloqueador | Merge de `origin/main` en `salim` sin terminar (solo diferencias de fin de línea CRLF/LF)                        | Cerrado. `.gitattributes` normaliza a LF                |
| 2   | Bloqueador | Workflow de GitHub Pages roto (esperaba `./out` sin `output: 'export'`) y además Pages no puede ejecutar backend | Eliminado. Deploy en Vercel + CI de verificación        |
| 3   | Bloqueador | Prisma desalineado: CLI `8.0.0-rc.15` (preliminar) vs cliente `7.10.0`; sin `schema.prisma`                      | Ambos en `7.10.0` fijo, esquema y migración creados     |
| 4   | Alto       | `pnpm-workspace.yaml` con valores de relleno (`set this to true or false`) → `pnpm install` falla                | Corregido, solo se aprueban los builds necesarios       |
| 5   | Alto       | `typescript.ignoreBuildErrors: true` ocultaba errores de tipos en producción                                     | Eliminado; el build falla si hay errores                |
| 6   | Alto       | CI usaba npm y `--no-package-lock` aunque el proyecto usa pnpm (builds no reproducibles)                         | CI con pnpm y `--frozen-lockfile`                       |
| 7   | Medio      | `app/page.tsx` monolítico y todo `'use client'`                                                                  | Dividido en componentes; solo lo interactivo es cliente |
| 8   | Medio      | CSS ilegible (reglas en una sola línea)                                                                          | Formateado con Prettier y dividido por secciones        |
| 9   | Medio      | `.gitignore` con `.env*` también ignoraría `.env.example`                                                        | Añadido `!.env.example`                                 |
| 10  | Bajo       | `lang="en"` en un sitio en español (accesibilidad/SEO)                                                           | `lang="es"`                                             |
| 11  | Bajo       | Archivos placeholder de v0 sin uso                                                                               | Eliminados                                              |
| 12  | Bajo       | `name: "my-project"` en package.json                                                                             | `hostil-tienda`                                         |
| 13  | Bajo       | `next` 16.3.3                                                                                                    | 16.3.6 (parches de la misma versión menor)              |

## Pendiente / recomendado (no incluido en este cambio)

Prioridad sugerida:

1. **Revisión legal** de `/privacidad` (Ley 1581 de 2012) antes de recoger datos reales.
2. **Pagos**: el carrito solo cuenta prendas. Integrar una pasarela colombiana (Wompi, Mercado Pago, Bold…)
   y un modelo `Order` con inventario por talla.
3. **Imágenes de la landing** (`public/hostil-*.png`, 1,4–2 MB cada una): convertirlas a WebP
   (~150 KB) mejora mucho la carga en móvil.
4. **Subida de fotos desde el admin** (Vercel Blob / R2) para no depender de commits.
5. **Exportar registrados a CSV** y darse de baja con un clic desde el correo.
6. **Lanzamiento programado** con Vercel Cron (pasar a En vivo a la hora exacta sin pulsar el botón).
7. **Observabilidad**: alertas de errores (p. ej. Sentry) y webhooks de Resend para rebotes.
8. **Tests end-to-end en CI** (Playwright) con una base de datos de pruebas.

## Cómo se verificó

- `pnpm typecheck`, `pnpm test` (17 tests unitarios) y `pnpm build` sin variables de entorno.
- Prueba end-to-end con PostgreSQL real y navegador automatizado (34 comprobaciones): registro,
  bloqueo en teaser, spoilers sin filtrar nombres, 403 de imágenes reales, lanzamiento y envío
  de códigos, rechazo del código de otra persona, enlace del correo, límite de intentos,
  cooldown de reenvío, revocación inmediata y desbloqueo al cerrar.
- La migración SQL se generó con el motor de esquemas oficial de Prisma 7.10.
