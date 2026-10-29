---
name: vault-commerce-audit
description: Reglas de auditoría transaccional para Joyas JP: cálculo atómico de conjuntos dinámicos (bundle_items), cupones de descuento, pasarelas de pago (Mercado Pago y Flow.cl con HMAC-SHA256) y persistencia en Turso DB + Drizzle ORM.
---

# Vault Commerce Audit Skill — Joyas JP

Esta skill define los contratos técnicos innegociables para auditar y modificar el catálogo de joyas, el inventario de conjuntos y el procesamiento de checkout en **Joyas JP**.

## 1. Contratos de Base de Datos (Turso + Drizzle ORM)
- **Esquema Centralizado:** `src/db/schema.ts` y cliente en `src/db/index.ts`.
- **Resolución Relacional de Conjuntos (`is_bundle = 1`):**
  * El stock de un conjunto nunca se hardcodea manualmente; se calcula a partir del stock mínimo disponible de sus piezas componentes en `bundle_items`:
    $$\text{stock}_{\text{bundle}} = \min_{i} \left\lfloor \frac{\text{stock}_{\text{component}_i}}{\text{qty}_i} \right\rfloor$$
- **Operaciones Atómicas (`turso.batch`):** Al confirmarse un pedido pagado, la deducción del stock de los productos simples y componentes de conjuntos debe ejecutarse en un único `turso.batch(statements, 'write')`.

## 2. Flujo de Checkout y Pasarelas de Pago
1. **Validación Server-Side en `/api/checkout`:**
   - Prohibido confiar en precios enviados por el cliente. El servidor recalcula siempre los precios desde la tabla `products`, aplicando `discount_price` si está vigente.
   - Todo parámetro entrante debe validarse con esquemas Zod (`safeParse`).
2. **Validación de Cupones en `/api/coupons/validate`:**
   - Validar estado activo (`is_active = 1`), fecha de vencimiento (`expires_at`), límite de uso (`usage_limit > usage_count`) y compra mínima (`min_cart_amount`).
   - El descuento en dinero se calcula en el servidor de forma determinista para evitar discrepancias de redondeo en CLP.
3. **Conciliación de Webhooks e Idempotencia:**
   - Consultar la API del proveedor para certificar estado `approved` antes de actualizar la orden.
   - Si la orden ya se encuentra en estado `paid` o `approved`, la ejecución debe retornar inmediatamente con éxito sin descontar stock doblemente.
   - Purgar la caché de la vitrina en 0ms mediante `revalidatePath('/', 'layout')` y `revalidatePath('/productos')`.
