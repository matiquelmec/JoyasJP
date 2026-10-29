# 🏛️ REGLAS DE DESARROLLO Y ARQUITECTURA: JOYAS JP (2026)

Este archivo define las directrices, contratos arquitectónicos y estándares de ingeniería para todos los agentes de Inteligencia Artificial y desarrolladores que operen en el repositorio de **Joyas JP (`JoyasJP_Definitive`)**, bajo el protocolo **Titanium Vault Flow — Nivel 6 (Urban Luxury & High Jewelry 2026)**.

---

## 1. STACK TECNOLÓGICO OFICIAL (SSoT)

* **Framework:** Next.js 14+ (App Router, Server Components, Route Handlers y Turbopack).
* **Lenguaje:** TypeScript 5.8+ en modo estricto (`npm run typecheck`).
* **Base de Datos:** **Turso DB (LibSQL / SQLite Edge Database)** con cliente `@libsql/client`.
* **ORM & Esquema Centralizado:** **Drizzle ORM** (`src/db/schema.ts`, `src/db/index.ts`).
* **Validación de Contratos:** **Zod v4** (`zod`) mediante `safeParse` en mutaciones, checkout, cupones y configuraciones.
* **Pasarela de Pagos Dual:** **Mercado Pago SDK** + **Flow.cl Nativo** con verificación criptográfica HMAC-SHA256 y deducción atómica de stock en `turso.batch`.
* **Dirección de Arte & Estilos:** Tailwind CSS con estética *Urban Luxury & Vault* (Negro Obsidiana `#09090B`, Oro Milano `#D4AF37`, Plata Italiana 925 `#E2E8F0` y Rubí Terciopelo), retícula Base 8 y touch targets $\ge 44\text{px}$.
* **Testing:** **Vitest** (`npm test`) en `tests/unit/*.test.ts`.

---

## 2. PROTOCOLO TITANIUM VAULT FLOW — NIVEL 6 (6 FASES)

Toda tarea de alto impacto, persistencia o refinamiento visual debe ejecutarse siguiendo rigurosamente estas 6 fases:

### FASE 0: PRE-FLIGHT, CONTEXTO & ACTIVACIÓN DE SKILLS
- Verifica que el working tree de Git esté limpio y en la rama correspondiente (`git status`).
- Identifica y lee los `SKILL.md` pertinentes en `.agents/skills/` antes de escribir código:
  * Si impacta UI/UX, redes sociales o catálogo ➔ Activa `ui-ux-pro-max`.
  * Si impacta Base de Datos, Stock, Bundles o Pagos ➔ Activa `vault-commerce-audit` y `turso-drizzle-engine`.
- Revisa las especificaciones técnicas vigentes en `docs/architecture/BLUEPRINT_2026.md`.

### FASE 1: ARQUITECTURA UNIDIRECCIONAL, ZOD V4 & SEGURIDAD ZERO-TRUST
- **Flujo Unidireccional Estricto:** `src/app` ➔ `src/components` / `src/hooks` / `src/services` ➔ `src/db` / `src/lib` ➔ `src/types`.
- **Validación 100% con Zod:** Toda entrada en rutas de mutación, checkout (`/api/checkout`), cupones (`/api/coupons/validate`) y administración debe validarse con `safeParse` antes de interactuar con Turso DB.
- **Guardrail de Autenticación Admin:** Prohibido guardar contraseñas en `localStorage`. Todo acceso a `/admin` y endpoints `/api/admin/*` debe validarse mediante cookie `HttpOnly` firmada con Web Crypto JWT (`verifyAdminSession`).
- **Integridad Financiera y Stock de Bundles (Conjuntos):**
  * El servidor recalcula siempre los precios desde Turso DB (usando `discount_price` si aplica).
  * Si el producto es un Conjunto (`is_bundle = 1`), verificar el stock de cada joya componente en `bundle_items` y descontar atómicamente en un solo `turso.batch(..., 'write')`.
  * Toda confirmación en webhook debe ser idempotente (`if (order.payment_status === 'approved') return`).

### FASE 2: CRAFTSMANSHIP VISUAL, CONVERSIÓN LUXURY & RENDIMIENTO EDGE
- **Retícula Base 8 & Touch Targets:** Espaciados múltiplos de 8 (`8/16/24/32/48px`) y áreas táctiles $\ge 44\text{px}$ (48px en móvil).
- **Mobile-First & Sticky Vault Bar:** En fichas de producto (`/productos/[id]`), mantener barra inferior fija con precio, selector de medida y CTA directo en zona del pulgar, junto al canal de **WhatsApp Concierge (+56 9 8299 0513)**.
- **Contraste WCAG 2.2 AA:** Relación de contraste $\ge 4.5:1$ en toda la tipografía sobre fondos oscuros (cero texto oscuro sobre fondo oscuro).
- **SEO y Google Shopping:** Datos estructurados `Schema.org/Product` reflejando el precio real de oferta (`discount_price || price`), disponibilidad en tiempo real y URLs canónicas.
- **Sincronización 0ms:** ISR de 60s con `revalidatePath` inmediato tras compras o actualizaciones en `/admin`.

### FASE 3: TRIPLE PUERTA DE CALIDAD (LOGICAL + SENSORIAL BROWSER GATE)
- **Puerta Lógica:** Añadir o actualizar pruebas unitarias en `tests/unit/*.test.ts`.
- **Comandos Obligatorios (Cero Tolerancia a Fallos):**
  ```bash
  npm run typecheck   # tsc --noEmit (0 errores permitidos)
  npm test            # vitest run (100% de las suites pasando)
  ```
- **Puerta Sensorial (Cuando hay cambios de UI/UX):**
  * Inspeccionar en viewport móvil (`390px`) y escritorio (`1440px`) con Chrome DevTools.
  * Certificar: cero desbordamiento horizontal (`overflow-x: hidden`), animaciones GPU fluidas y tipografía nítida.

### FASE 4: GOBERNANZA DOC-AS-CODE EN CASCADA
- Actualizar atómicamente en cada entrega:
  * `README.md`
  * `docs/architecture/BLUEPRINT_2026.md`
  * `AGENTS.md` (si se introducen nuevas reglas de negocio o contratos técnicos).

### FASE 5: CICLO GIT & ENTREGA EJECUTIVA
- `git add` selectivo (nunca subir `.env*` ni archivos locales).
- Commit semántico bajo *Conventional Commits* (`feat(...)`, `fix(...)`, `refactor(...)`, `style(...)`, `test(...)`, `docs(...)`).
- `git push origin <rama>` y reporte ejecutivo de resultados.
