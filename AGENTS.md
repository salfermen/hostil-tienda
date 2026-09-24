<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Notas del proyecto HOSTIL (para asistentes de IA y personas)

- Idioma: la interfaz, los comentarios y la documentación están en español.
- Gestor de paquetes: **pnpm** (versión fijada en `package.json` → `packageManager`). No usar npm/yarn.
- Arquitectura y flujos: `docs/ARQUITECTURA.md`. Despliegue: `docs/DESPLIEGUE.md`.
- Reglas de seguridad que no se deben romper:
  - Toda decisión de acceso se toma en el servidor (`lib/drops/queries.ts`), nunca en componentes `'use client'`.
  - Cada Server Action del admin empieza con `requireAdmin()`.
  - Las fotos de los drops van en `storage/`, nunca en `public/`.
  - Nunca guardar códigos de acceso en texto plano (solo `hashAccessCode`).
- Antes de terminar un cambio: `pnpm typecheck && pnpm test && pnpm build`.
- Cambios en la base de datos: editar `prisma/schema.prisma` y crear migración con `pnpm db:migrate --name ...`.
