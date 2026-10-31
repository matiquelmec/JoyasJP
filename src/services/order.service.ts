import type { InStatement } from '@libsql/client'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { getFlowPaymentStatus } from '@/lib/flow'
import { safeParseOrderItems } from '@/lib/validations/admin'

export interface OrderItemInput {
  id: string
  quantity: number
  name?: string
  price?: number
  imageUrl?: string
}

export interface ProductInventoryMetadata {
  id: string
  name: string
  slug?: string | null
  stock: number
  is_bundle: boolean
}

export interface BundleComponentRow {
  bundle_id: string
  product_id: string
  quantity: number
}

/**
 * Consolida líneas duplicadas de un mismo producto en el carrito para impedir bypass de stock.
 */
export function consolidateCartItems<T extends { id: string; quantity: number }>(items: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of items) {
    const existing = map.get(item.id)
    if (existing) {
      map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity })
    } else {
      map.set(item.id, { ...item })
    }
  }
  return Array.from(map.values())
}

/**
 * Resuelve determinísticamente las unidades físicas totales a descontar por cada `product_id`,
 * contemplando productos simples, conjuntos (`bundle_items`) y piezas compartidas en el mismo pedido.
 */
export function resolvePhysicalDeductions(
  orderItems: OrderItemInput[],
  productMetaMap: Map<string, { is_bundle: boolean }>,
  bundleComponentsMap: Map<string, Array<{ product_id: string; quantity: number }>>
): Map<string, number> {
  const deductions = new Map<string, number>()

  for (const item of orderItems) {
    const qtyPurchased = Math.max(1, Math.floor(Number(item.quantity || 1)))
    const meta = productMetaMap.get(item.id)
    const isBundle = Boolean(meta?.is_bundle)

    if (isBundle) {
      const components = bundleComponentsMap.get(item.id) || []
      if (components.length > 0) {
        for (const comp of components) {
          const componentQtyNeeded = Math.max(1, Math.floor(Number(comp.quantity || 1))) * qtyPurchased
          deductions.set(comp.product_id, (deductions.get(comp.product_id) || 0) + componentQtyNeeded)
        }
      } else {
        // Fallback defensivo si un conjunto fue creado sin filas en bundle_items
        deductions.set(item.id, (deductions.get(item.id) || 0) + qtyPurchased)
      }
    } else {
      deductions.set(item.id, (deductions.get(item.id) || 0) + qtyPurchased)
    }
  }

  return deductions
}

/**
 * Construye el lote atómico (`turso.batch(..., 'write')`) e idempotente para liquidar una orden pagada.
 * Todas las sentencias verifican atómicamente en SQLite que la orden aún NO esté en estado 'approved'/'paid',
 * eliminando condiciones de carrera entre Webhook S2S y urlReturn del navegador.
 */
export function buildAtomicOrderSettlementBatch(params: {
  orderId: string
  paymentDetailJson: string
  couponCode?: string | null
  physicalDeductions: Map<string, number>
}): InStatement[] {
  const { orderId, paymentDetailJson, couponCode, physicalDeductions } = params
  const statements: InStatement[] = []

  // 1. Deducción atómica de inventario físico (productos simples + componentes de conjuntos)
  for (const [productId, qtyToDeduct] of Array.from(physicalDeductions.entries())) {
    if (qtyToDeduct > 0) {
      statements.push({
        sql: `UPDATE products
              SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
                AND EXISTS (
                  SELECT 1 FROM orders
                  WHERE id = ? AND COALESCE(payment_status, 'pending') NOT IN ('approved', 'paid')
                )`,
        args: [qtyToDeduct, productId, orderId],
      })
    }
  }

  // 2. Incremento atómico de uso de cupón si aplica
  if (couponCode && couponCode.trim().length > 0) {
    statements.push({
      sql: `UPDATE coupons
            SET usage_count = COALESCE(usage_count, 0) + 1
            WHERE code = ?
              AND EXISTS (
                SELECT 1 FROM orders
                WHERE id = ? AND COALESCE(payment_status, 'pending') NOT IN ('approved', 'paid')
              )`,
      args: [couponCode.trim().toUpperCase(), orderId],
    })
  }

  // 3. Transición final atómica de estado de la orden (cierra el guard para peticiones concurrentes)
  statements.push({
    sql: `UPDATE orders
          SET status = 'paid',
              payment_status = 'approved',
              payment_detail = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
            AND COALESCE(payment_status, 'pending') NOT IN ('approved', 'paid')`,
    args: [paymentDetailJson, orderId],
  })

  return statements
}

/**
 * Purga instantánea (0ms) de ISR en portada, catálogo y fichas individuales (ID + Slug + Conjuntos).
 */
export function purgeStorefrontCache(identifiers: string[] = []): void {
  try {
    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/productos')
    revalidatePath('/productos', 'page')
    revalidatePath('/productos/[id]', 'page')

    const uniqueIds = Array.from(new Set(identifiers.filter(Boolean)))
    for (const idOrSlug of uniqueIds) {
      revalidatePath(`/productos/${idOrSlug}`)
    }
  } catch (err) {
    console.warn('⚠️ Advertencia en revalidación ISR post-mutación:', err)
  }
}

export class OrderService {
  /**
   * Valida en servidor la disponibilidad física real de todos los productos del carrito,
   * detectando colisiones entre productos simples y componentes compartidos de conjuntos (`bundle_items`).
   */
  static async verifyCartPhysicalStock(
    cartItems: OrderItemInput[],
    dbProducts: ProductInventoryMetadata[]
  ): Promise<void> {
    const productMetaMap = new Map<string, { is_bundle: boolean }>()
    const physicalStockMap = new Map<string, { name: string; stock: number }>()
    const bundleIds: string[] = []

    for (const p of dbProducts) {
      productMetaMap.set(p.id, { is_bundle: p.is_bundle })
      physicalStockMap.set(p.id, { name: p.name, stock: Number(p.stock || 0) })
      if (p.is_bundle) {
        bundleIds.push(p.id)
      }
    }

    const bundleComponentsMap = new Map<string, Array<{ product_id: string; quantity: number }>>()

    if (bundleIds.length > 0) {
      const placeholders = bundleIds.map(() => '?').join(',')
      const { rows: bundleRows } = await turso.execute({
        sql: `SELECT bundle_id, product_id, quantity FROM bundle_items WHERE bundle_id IN (${placeholders})`,
        args: bundleIds,
      })

      const componentIds = new Set<string>()
      for (const row of bundleRows) {
        const bId = String(row.bundle_id)
        const pId = String(row.product_id)
        const qty = Math.max(1, Number(row.quantity || 1))
        const current = bundleComponentsMap.get(bId) || []
        current.push({ product_id: pId, quantity: qty })
        bundleComponentsMap.set(bId, current)
        if (!physicalStockMap.has(pId)) {
          componentIds.add(pId)
        }
      }

      if (componentIds.size > 0) {
        const compArr = Array.from(componentIds)
        const compPlaceholders = compArr.map(() => '?').join(',')
        const { rows: compProds } = await turso.execute({
          sql: `SELECT id, name, stock FROM products WHERE id IN (${compPlaceholders}) AND (deleted_at IS NULL OR deleted_at = '')`,
          args: compArr,
        })
        for (const cp of compProds) {
          physicalStockMap.set(String(cp.id), {
            name: String(cp.name),
            stock: Number(cp.stock || 0),
          })
        }
      }

      // Verificar que todo conjunto tenga componentes válidos configurados
      for (const bId of bundleIds) {
        const comps = bundleComponentsMap.get(bId) || []
        if (comps.length === 0) {
          const bundleName = physicalStockMap.get(bId)?.name || bId
          throw new Error(`El conjunto "${bundleName}" no se encuentra disponible temporalmente.`)
        }
      }
    }

    const requiredPhysical = resolvePhysicalDeductions(
      cartItems,
      productMetaMap,
      bundleComponentsMap
    )

    for (const [productId, requiredQty] of Array.from(requiredPhysical.entries())) {
      const physical = physicalStockMap.get(productId)
      if (!physical) {
        throw new Error('Uno de los productos seleccionados ya no existe en el inventario activo.')
      }
      if (physical.stock < requiredQty) {
        throw new Error(
          `Stock insuficiente para "${physical.name}" (Disponibles: ${physical.stock}, Solicitados: ${requiredQty})`
        )
      }
    }
  }

  /**
   * Conciliación Dual Idempotente y Atómica (`turso.batch`) para Flow.cl (Webhook + Return).
   */
  static async reconcileFlowOrder(token: string): Promise<{
    success: boolean
    status: string
    commerceOrder: string
    orderLookupId: string
  }> {
    const cleanToken = (token || '').trim()
    if (!cleanToken) {
      throw new Error('Token de Flow no proporcionado')
    }

    const statusData = await getFlowPaymentStatus(cleanToken)
    const { status, commerceOrder, flowOrder, amount } = statusData

    // Flow status: 1 = Pendiente, 2 = Pagada, 3 = Rechazada, 4 = Anulada
    let orderStatus = 'pending'
    let paymentStatusStr = 'pending'

    if (status === 2) {
      orderStatus = 'paid'
      paymentStatusStr = 'approved'
    } else if (status === 3) {
      orderStatus = 'cancelled'
      paymentStatusStr = 'rejected'
    } else if (status === 4) {
      orderStatus = 'cancelled'
      paymentStatusStr = 'cancelled'
    }

    const { rows: orderRows } = await turso.execute({
      sql: 'SELECT id, total_amount, coupon_code, status, payment_status, items FROM orders WHERE id = ? OR payment_id = ? LIMIT 1',
      args: [commerceOrder, cleanToken],
    })

    if (!orderRows || orderRows.length === 0) {
      console.warn(`⚠️ Orden no encontrada para token Flow: ${cleanToken} (ref: ${commerceOrder})`)
      return {
        success: false,
        status: orderStatus,
        commerceOrder,
        orderLookupId: commerceOrder,
      }
    }

    const order = orderRows[0]
    const orderId = String(order.id)

    // Idempotencia temprana: Si ya fue aprobada/pagada, jamás volver a descontar inventario
    if (
      order.payment_status === 'approved' ||
      order.payment_status === 'paid' ||
      order.status === 'paid'
    ) {
      return {
        success: true,
        status: 'paid',
        commerceOrder,
        orderLookupId: orderId,
      }
    }

    const paidAmount = Number(amount)
    const paymentDetailPayload = JSON.stringify({
      provider: 'flow',
      flowOrder,
      media: statusData.paymentData?.media || null,
      paidAt: statusData.paymentData?.date || new Date().toISOString(),
      amount: Number.isFinite(paidAmount) ? paidAmount : Number(order.total_amount),
    })

    if (orderStatus === 'paid') {
      const expectedAmount = Number(order.total_amount)
      if (!Number.isFinite(paidAmount) || Math.abs(expectedAmount - paidAmount) > 1) {
        console.error(
          `🚨 Discrepancia financiera en Flow (${orderId}): Esperado ${expectedAmount}, Recibido ${amount}`
        )
        throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${amount}`)
      }

      // Parsear ítems de la orden de forma segura
      const parsedItems: OrderItemInput[] = safeParseOrderItems(order.items)

      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        throw new Error(`La orden ${orderId} no contiene ítems válidos para deducción de stock`)
      }

      const itemIds = Array.from(new Set(parsedItems.map((i) => String(i.id))))
      const placeholders = itemIds.map(() => '?').join(',')

      const { rows: prodRows } = await turso.execute({
        sql: `SELECT id, slug, is_bundle FROM products WHERE id IN (${placeholders})`,
        args: itemIds,
      })

      const productMetaMap = new Map<string, { is_bundle: boolean }>()
      const cacheIdentifiers: string[] = [...itemIds]
      const bundleIds: string[] = []

      for (const r of prodRows) {
        const pid = String(r.id)
        const isBundle = Number(r.is_bundle || 0) === 1 || String(r.is_bundle) === 'true'
        productMetaMap.set(pid, { is_bundle: isBundle })
        if (r.slug) cacheIdentifiers.push(String(r.slug))
        if (isBundle) bundleIds.push(pid)
      }

      const bundleComponentsMap = new Map<string, Array<{ product_id: string; quantity: number }>>()
      if (bundleIds.length > 0) {
        const bPlaceholders = bundleIds.map(() => '?').join(',')
        const { rows: bRows } = await turso.execute({
          sql: `SELECT bundle_id, product_id, quantity FROM bundle_items WHERE bundle_id IN (${bPlaceholders})`,
          args: bundleIds,
        })
        for (const bRow of bRows) {
          const bId = String(bRow.bundle_id)
          const pId = String(bRow.product_id)
          const qty = Math.max(1, Number(bRow.quantity || 1))
          const arr = bundleComponentsMap.get(bId) || []
          arr.push({ product_id: pId, quantity: qty })
          bundleComponentsMap.set(bId, arr)
          cacheIdentifiers.push(pId)
        }
      }

      const physicalDeductions = resolvePhysicalDeductions(
        parsedItems,
        productMetaMap,
        bundleComponentsMap
      )

      // Identificar también slugs de componentes y conjuntos padres afectados para invalidar su ISR
      const deductedIds = Array.from(physicalDeductions.keys())
      if (deductedIds.length > 0) {
        const dPlaceholders = deductedIds.map(() => '?').join(',')
        const { rows: affectedRows } = await turso.execute({
          sql: `SELECT id, slug FROM products WHERE id IN (${dPlaceholders})
                UNION
                SELECT p.id, p.slug FROM products p
                JOIN bundle_items bi ON p.id = bi.bundle_id
                WHERE bi.product_id IN (${dPlaceholders})`,
          args: [...deductedIds, ...deductedIds],
        })
        for (const ar of affectedRows) {
          cacheIdentifiers.push(String(ar.id))
          if (ar.slug) cacheIdentifiers.push(String(ar.slug))
        }
      }

      const batchStatements = buildAtomicOrderSettlementBatch({
        orderId,
        paymentDetailJson: paymentDetailPayload,
        couponCode: order.coupon_code ? String(order.coupon_code) : null,
        physicalDeductions,
      })

      // Escritura atómica en un único batch transaccional sobre Turso Edge
      await turso.batch(batchStatements, 'write')

      // Revalidación instantánea 0ms en vitrina, catálogo y fichas individuales
      purgeStorefrontCache(cacheIdentifiers)
    } else if (orderStatus === 'cancelled') {
      await turso.batch(
        [
          {
            sql: `UPDATE orders
                  SET status = ?, payment_status = ?, payment_detail = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ? AND COALESCE(payment_status, 'pending') NOT IN ('approved', 'paid')`,
            args: [orderStatus, paymentStatusStr, paymentDetailPayload, orderId],
          },
        ],
        'write'
      )
    }

    return {
      success: true,
      status: orderStatus,
      commerceOrder,
      orderLookupId: orderId,
    }
  }
}
