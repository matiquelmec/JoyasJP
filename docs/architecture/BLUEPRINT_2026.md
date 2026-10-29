# 🏛️ BLUEPRINT ARQUITECTÓNICO MAESTRO 2026 — JOYAS JP

> **Versión del Sistema:** 2.1.0 (Titanium Vault Edition — Clean Architecture, Turso LibSQL + Drizzle ORM + Vitest)  
> **Última Actualización:** Octubre 2026  
> **Estado:** Producción y Alta Disponibilidad en Edge  
> **Gobernanza:** Regido por [`AGENTS.md`](file:///C:/Users/Matías%20Riquelme/Desktop/Proyectos%20documentados/JoyasJP_Definitive/AGENTS.md) y el protocolo **Titanium Vault Flow**.

---

## 1. 🌟 Visión General y Pilares Arquitectónicos

**Joyas JP** es una plataforma de comercio electrónico de alta joyería para la escena urbana en Chile, especializada en Cadenas Cubanas, Dijes, Pulseras y la Bóveda exclusiva de **Plata Fina Italiana Ley 925**.

### Pilares del Sistema:
1. **Arquitectura Unidireccional Limpia (Zero Dead Code):** Flujo estricto `src/app ➔ src/components & src/services ➔ src/db & src/lib`. Cero archivos huérfanos, cero configuraciones duplicadas y cero dependencias legadas (`@supabase/supabase-js` y `next-sitemap` erradicados).
2. **Persistencia Serverless con Turso Edge + Drizzle ORM:** Esquema relacional en [`src/db/schema.ts`](file:///C:/Users/Matías%20Riquelme/Desktop/Proyectos%20documentados/JoyasJP_Definitive/src/db/schema.ts) con deducción atómica de inventario y resolución de stock para conjuntos dinámicos (`bundle_items`).
3. **Seguridad Zero-Trust & Admin Blindado:** Autenticación administrativa mediante cookies `HttpOnly` firmadas con Web Crypto JWT (`joyasjp_admin_session`) y verificación asíncrona obligatoria `await verifyAdminAuth(request)` en todos los Route Handlers de `/api/admin/*`.
4. **Validación Exhaustiva con Zod v4:** 100% de los contratos de entrada (checkout, cupones y administración) auditados en servidor mediante `safeParse`.
5. **Sincronización Perimetral en 0ms & LCP Instantáneo:** ISR de `60s` combinado con revalidación bajo demanda (`revalidatePath`) tras compras o mutaciones en `/admin`, optimización automática de imágenes Cloudinary (`f_auto,q_auto:good`) y eliminación de preloaders bloqueantes.
6. **Observabilidad Edge (`/api/health`):** Endpoint de telemetría en tiempo real que mide la latencia de conexión a Turso DB en milisegundos.
7. **Ergonomía y Craftsmanship Visual:** Paleta OKLCH Obsidian & Gold 18k, retícula Base 8, touch targets $\ge 44\text{px}$, Sticky Vault Bar móvil y asesoría directa por **WhatsApp Concierge (`+56 9 8299 0513`)**.

---

## 2. 🗄️ Esquema de Base de Datos Centralizado (`src/db/schema.ts`)

1. **`products`:** Catálogo de joyas individuales y conjuntos, con soporte para `slug`, `price`, `discount_price`, `stock`, `materials`, `is_bundle` y `is_priority`.
2. **`bundle_items`:** Tabla asociativa que define los componentes de cada conjunto ($bundle\_id \times product\_id \times quantity$).
3. **`orders`:** Registro de órdenes con número de pedido, datos del cliente, método de despacho, ítems JSON validados, total CLP y estado de pago.
4. **`coupons`:** Cupones de descuento (fijos o porcentuales) con reglas de compra mínima, expiración y límite de usos.
5. **`configuration`:** Configuración dinámica del negocio (nombre, WhatsApp `+56 9 8299 0513`, redes sociales y costo de envío).

---

## 3. 🔌 Mapa de Endpoints Críticos

| Ruta | Método | Propósito y Seguridad |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Telemetría Edge y latencia en vivo de Turso SQLite (`latencyMs`). |
| `/api/checkout` | `POST` | Validación Zod, recálculo autoritativo de precios/cupones y preferencia MP. |
| `/api/webhook/mercadopago` | `POST` | Conciliación idempotente, deducción de stock (simple y bundles) y purga ISR 0ms. |
| `/api/coupons/validate` | `POST` | Validación Zod de vigencia, monto mínimo y límite de uso de cupones. |
| `/api/products/related` | `GET` | Recomendaciones relacionales por categoría excluyendo el producto actual. |
| `/api/auth/login` & `/logout` | `POST` | Emisión y revocación de sesión administrativa en cookie `HttpOnly` JWT. |
| `/api/admin/*` | `ALL` | Gestión de catálogo, órdenes, cupones y configuración protegida con `await verifyAdminAuth(request)`. |

---

## 4. 🧪 Comandos Oficiales de Calidad (Triple Gate)

```bash
# 1. Verificación estricta de tipos TypeScript (0 errores permitidos)
npm run typecheck

# 2. Suite de pruebas unitarias con Vitest (7 suites: precios, cupones, bundles, slugs, Cloudinary, colores, Zod)
npm test

# 3. Compilación de producción
npm run build
```
