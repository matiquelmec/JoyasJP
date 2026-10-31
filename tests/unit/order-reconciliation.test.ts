import { describe, it, expect } from 'vitest'
import {
  consolidateCartItems,
  resolvePhysicalDeductions,
  buildAtomicOrderSettlementBatch,
} from '@/services/order.service'
import {
  normalizePaymentDetail,
  safeParseOrderItems,
  adminOrderUpdateSchema,
  adminStockUpdateSchema,
  adminProductMutationSchema,
  adminCouponMutationSchema,
} from '@/lib/validations/admin'

describe('Regresión P0: Deserialización Resiliente de Pedidos en /api/admin/orders', () => {
  it('normaliza payment_detail en texto plano legado ("Flow Order: 186679066") sin lanzar SyntaxError', () => {
    const legacyDetail = normalizePaymentDetail('Flow Order: 186679066')
    expect(legacyDetail).not.toBeNull()
    expect(legacyDetail?.raw).toBe('Flow Order: 186679066')
    expect(legacyDetail?.provider).toBe('flow')
    expect(legacyDetail?.flowOrder).toBe(186679066)
  })

  it('normaliza payment_detail JSON estructurado de Flow.cl y preserva medio de pago y seguimiento', () => {
    const jsonPayload = JSON.stringify({
      provider: 'flow',
      flowOrder: 186679066,
      media: 'Transferencias bancarias vía Khipu',
      paidAt: '2026-10-30 17:17:45',
      amount: 25000,
      trackingNumber: 'STK-998877',
    })

    const detail = normalizePaymentDetail(jsonPayload)
    expect(detail).not.toBeNull()
    expect(detail?.flowOrder).toBe(186679066)
    expect(detail?.media).toBe('Transferencias bancarias vía Khipu')
    expect(detail?.trackingNumber).toBe('STK-998877')
    expect(detail?.raw).toContain('Flow #186679066')
  })

  it('maneja valores nulos, vacíos o JSON corrupto en payment_detail e items sin caer', () => {
    expect(normalizePaymentDetail(null)).toBeNull()
    expect(normalizePaymentDetail('')).toBeNull()
    expect(normalizePaymentDetail('{corrupted-json')).toEqual({
      raw: '{corrupted-json',
      provider: undefined,
      flowOrder: undefined,
    })

    expect(safeParseOrderItems('[{"id":"p1","name":"Cubana","quantity":1,"price":15000}]')).toHaveLength(1)
    expect(safeParseOrderItems('{malformed')).toEqual([])
    expect(safeParseOrderItems(null)).toEqual([])
  })
})

describe('Integridad Atómica de Inventario y Conjuntos (turso.batch)', () => {
  it('consolida ítems repetidos en el carrito para evitar bypass de validación de stock', () => {
    const consolidated = consolidateCartItems([
      { id: 'prod-a', quantity: 1, price: 15000 },
      { id: 'prod-b', quantity: 2, price: 10000 },
      { id: 'prod-a', quantity: 3, price: 15000 },
    ])

    expect(consolidated).toHaveLength(2)
    expect(consolidated.find((i) => i.id === 'prod-a')?.quantity).toBe(4)
    expect(consolidated.find((i) => i.id === 'prod-b')?.quantity).toBe(2)
  })

  it('calcula deducciones físicas exactas combinando productos simples y componentes compartidos en bundle_items', () => {
    const productMeta = new Map<string, { is_bundle: boolean }>([
      ['prod-chain', { is_bundle: false }],
      ['prod-bracelet', { is_bundle: false }],
      ['bundle-vip', { is_bundle: true }],
    ])

    const bundleComponents = new Map<string, Array<{ product_id: string; quantity: number }>>([
      [
        'bundle-vip',
        [
          { product_id: 'prod-chain', quantity: 1 },
          { product_id: 'prod-bracelet', quantity: 2 },
        ],
      ],
    ])

    // El cliente compra 1 Cadena suelta + 2 Conjuntos VIP (cada conjunto incluye 1 cadena + 2 pulseras)
    const deductions = resolvePhysicalDeductions(
      [
        { id: 'prod-chain', quantity: 1 },
        { id: 'bundle-vip', quantity: 2 },
      ],
      productMeta,
      bundleComponents
    )

    expect(deductions.get('prod-chain')).toBe(3) // 1 suelta + (1 * 2 del bundle)
    expect(deductions.get('prod-bracelet')).toBe(4) // 2 * 2 del bundle
    expect(deductions.has('bundle-vip')).toBe(false)
  })

  it('construye sentencias SQL atómicas e idempotentes protegidas contra race conditions Webhook vs Return', () => {
    const deductions = new Map<string, number>([
      ['0f549c7d-eafc-4d43-9bd6-84e91e176819', 1],
      ['9c24cf1b-1e2d-45d2-97af-7e6dfb2ab97a', 1],
    ])

    const statements = buildAtomicOrderSettlementBatch({
      orderId: 'ORD-1793391364824-296',
      paymentDetailJson: '{"provider":"flow","flowOrder":186679066}',
      couponCode: 'vip10',
      physicalDeductions: deductions,
    })

    // 2 descuentos de stock + 1 incremento de cupón + 1 cierre de estado de la orden = 4 sentencias en batch
    expect(statements).toHaveLength(4)

    // Todas las sentencias llevan guard de idempotencia sobre payment_status
    for (const stmt of statements) {
      const sql = typeof stmt === 'string' ? stmt : stmt.sql
      expect(sql).toContain("NOT IN ('approved', 'paid')")
    }

    // La sentencia final cierra la orden como 'paid' / 'approved'
    const finalStmt = statements[statements.length - 1] as { sql: string; args: unknown[] }
    expect(finalStmt.sql).toContain("SET status = 'paid'")
    expect(finalStmt.sql).toContain("payment_status = 'approved'")
    expect(finalStmt.args).toEqual([
      '{"provider":"flow","flowOrder":186679066}',
      'ORD-1793391364824-296',
    ])
  })
})

describe('Contratos Administrativos Zod v4', () => {
  it('valida actualizaciones de estado de orden, stock, productos y cupones', () => {
    expect(
      adminOrderUpdateSchema.safeParse({
        orderId: 'ORD-123',
        status: 'shipped',
        trackingNumber: 'STK-100',
      }).success
    ).toBe(true)

    expect(
      adminOrderUpdateSchema.safeParse({
        orderId: 'ORD-123',
        status: 'invalid_state',
      }).success
    ).toBe(false)

    expect(adminStockUpdateSchema.safeParse({ id: 'prod-1', stock: 8 }).success).toBe(true)
    expect(adminStockUpdateSchema.safeParse({ id: 'prod-1', stock: -1 }).success).toBe(false)

    expect(
      adminProductMutationSchema.safeParse({
        name: 'Cadena Italiana 925',
        price: 35000,
        stock: 5,
        category: 'plata-925',
      }).success
    ).toBe(true)

    const couponParsed = adminCouponMutationSchema.safeParse({
      code: ' milano20 ',
      discount_type: 'percentage',
      discount_value: 20,
    })
    expect(couponParsed.success).toBe(true)
    if (couponParsed.success) {
      expect(couponParsed.data.code).toBe('MILANO20')
    }
  })
})
