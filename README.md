# Joyas JP 💍✨ — Titanium Vault Edition (2026)

> E-Commerce de Alta Joyería Urbana y Bóveda Plata Italiana Ley 925 en Chile, gobernado bajo el estándar **Titanium Vault Flow — Nivel 6**.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Turso](https://img.shields.io/badge/Turso-SQLite--Edge-440099?style=for-the-badge&logo=sqlite)](https://turso.tech/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Zod v4](https://img.shields.io/badge/Zod-v4-3E67B1?style=for-the-badge)](https://zod.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)

---

## 📖 Resumen Arquitectónico

**Joyas JP (`JoyasJP_Definitive`)** es una plataforma de comercio electrónico de alto rendimiento diseñada para la exhibición, venta y gestión de inventario en tiempo real de joyería urbana y piezas de **Plata Fina Italiana Ley 925**.

Opera bajo una arquitectura unidireccional estricta (`app ➔ components/hooks/services ➔ db/lib`), persistencia distribuida en **Turso SQLite Edge**, validación de contratos al 100% con **Zod v4**, sesiones administrativas blindadas mediante **Cookies `HttpOnly` JWT** y sincronización instantánea de caché (`ISR 60s` + `revalidatePath` en `0ms`).

* **WhatsApp Concierge Oficial:** `+56 9 8299 0513` (`https://wa.me/56982990513`)

---

## 🛠️ Stack Tecnológico Oficial (SSoT)

* **Framework:** Next.js 14.2 (App Router, Server Components, Route Handlers, Dynamic Sitemap/Robots).
* **Lenguaje:** TypeScript 5.8+ en modo estricto (`npm run typecheck`).
* **Base de Datos & ORM:** Turso DB (`@libsql/client`) + **Drizzle ORM** (`src/db/schema.ts`, `src/db/index.ts`).
* **Validación & Contratos:** **Zod v4** (`src/lib/validations/checkout.ts`, `src/lib/validations/admin.ts`) con deserialización resiliente de órdenes (`normalizePaymentDetail`, `safeParseOrderItems`).
* **Seguridad Admin:** **Web Crypto JWT (`jose`)** en cookie `HttpOnly` (`joyasjp_admin_session`) verificada con secreto unificado (`getAdminJwtSecret`) en Edge Middleware (`src/middleware.ts`) y Route Handlers (`src/lib/admin-auth.ts`), con cierre formal en `/api/auth/logout` (cero `localStorage` para tokens).
* **Pasarela de Pagos & Conciliación:** **Flow.cl Nativo (`src/lib/flow.ts`)** + **`OrderService` (`src/services/order.service.ts`)** con firma HMAC-SHA256, URL canónica normalizada (`normalizeCanonicalSiteUrl`), conciliación dual idempotente (`/api/webhook/flow` + `/api/flow/return`) y deducción atómica en un único `turso.batch(..., 'write')` protegida contra *race conditions* para productos simples y conjuntos (`bundle_items`).
* **CDN & Multimedia:** Cloudinary CDN con transformación automática `f_auto,q_auto:good` vía `optimizeCloudinaryUrl()` (`src/lib/utils.ts`).
* **Suite de Pruebas:** Vitest (`tests/unit/commerce-rules.test.ts`, `tests/unit/order-reconciliation.test.ts` — 16 tests unitarios).

---

## 📂 Arquitectura de Directorios Limpia (Unidireccional)

```text
JoyasJP_Definitive/
├── .agents/skills/              # Skills especializados del agente (vault-commerce-audit, ui-ux-pro-max)
├── docs/
│   ├── architecture/            # BLUEPRINT_2026.md (Especificación Técnica Maestra)
│   └── templates/               # PROMPT_MASTERS_2026.md (Plantillas de trabajo)
├── public/assets/               # Videos hero y activos estáticos versionados
├── src/
│   ├── app/                     # Next.js App Router (Rutas públicas, /admin y API Routes)
│   │   ├── api/
│   │   │   ├── admin/           # CRUD protegido con await verifyAdminAuth(request)
│   │   │   ├── auth/            # Login / Logout con Cookie HttpOnly JWT
│   │   │   ├── checkout/        # Creación de orden validada con Zod y recálculo en servidor
│   │   │   ├── coupons/         # Validación de cupones en tiempo real
│   │   │   ├── health/          # Diagnóstico de salud Edge y latencia de Turso DB
│   │   │   └── webhook/         # Conciliación idempotente de pagos y deducción de stock
│   │   ├── productos/           # Catálogo ISR (60s) y fichas con Sticky Vault Bar
│   │   ├── robots.ts            # Reglas dinámicas de indexación
│   │   └── sitemap.ts           # Sitemap dinámico con slugs canónicos
│   ├── components/              # Componentes modulares (admin, layout, seo, shop, ui)
│   ├── db/                      # Esquema centralizado Drizzle ORM (schema.ts, index.ts)
│   ├── hooks/                   # Custom React Hooks
│   ├── lib/                     # Utilidades puras, cliente Flow, auth JWT y esquemas Zod
│   └── services/                # Capa de dominio y negocio (ProductService, OrderService)
├── tests/unit/                  # Suite de pruebas unitarias Vitest
└── AGENTS.md                    # Constitución y protocolo Titanium Vault Flow
```

---

## 📦 Scripts Oficiales de Desarrollo y Calidad

```bash
# Servidor de desarrollo
npm run dev

# Puerta de Calidad 1: Verificación estricta de tipos TypeScript (0 errores)
npm run typecheck

# Puerta de Calidad 2: Suite de pruebas unitarias Vitest (100% pasando)
npm test

# Compilación de producción
npm run build
```

---

## 🔒 Variables de Entorno Requeridas (`.env.local`)

```env
# Turso SQLite Edge Database
TURSO_CONNECTION_URL=libsql://tu-db.turso.io
TURSO_AUTH_TOKEN=tu-auth-token

# Seguridad Admin (HttpOnly JWT)
ADMIN_PASSWORD=tu-password-segura
JWT_SECRET=tu-secreto-criptografico-jwt

# Pasarela Flow.cl (Producción)
FLOW_API_KEY=tu-flow-api-key
FLOW_SECRET_KEY=tu-flow-secret-key
FLOW_ENV=production

# Cloudinary CDN
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# URL Pública Canónica
NEXT_PUBLIC_SITE_URL=https://joyasjp.cl
```
