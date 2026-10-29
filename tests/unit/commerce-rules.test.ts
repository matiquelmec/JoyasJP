import { describe, it, expect } from 'vitest'

function calculateEffectivePrice(price: number, discount_price?: number): number {
  if (discount_price && discount_price > 0 && discount_price < price) {
    return discount_price
  }
  return price
}

function calculateDiscount(total: number, coupon: { type: 'percentage' | 'fixed'; value: number }): number {
  if (coupon.type === 'percentage') {
    return Math.round(total * (coupon.value / 100))
  }
  return Math.min(coupon.value, total)
}

function calculateBundleStock(components: Array<{ stock: number; quantity: number }>): number {
  if (components.length === 0) return 0
  const possibleBundles = components.map(c => Math.floor(c.stock / c.quantity))
  return Math.min(...possibleBundles)
}

describe('Reglas de Negocio Financieras e Inventario Joyas JP', () => {
  it('aplica discount_price correctamente si es menor al precio original', () => {
    expect(calculateEffectivePrice(49990, 39990)).toBe(39990)
    expect(calculateEffectivePrice(49990, 59990)).toBe(49990)
    expect(calculateEffectivePrice(49990, undefined)).toBe(49990)
  })

  it('calcula descuentos de cupones porcentuales y fijos en CLP', () => {
    // 10% de $50.000 = $5.000
    expect(calculateDiscount(50000, { type: 'percentage', value: 10 })).toBe(5000)
    // Cupón fijo de $10.000 en carrito de $50.000
    expect(calculateDiscount(50000, { type: 'fixed', value: 10000 })).toBe(10000)
    // Cupón fijo mayor al total del carrito se acota al total
    expect(calculateDiscount(5000, { type: 'fixed', value: 10000 })).toBe(5000)
  })

  it('resuelve el stock relacional de un conjunto dinámico (bundle)', () => {
    // Set incluye: 1 Cadena (stock 10) + 1 Pulsera (stock 4) + 1 Dije (stock 8)
    const bundle = [
      { stock: 10, quantity: 1 },
      { stock: 4, quantity: 1 },
      { stock: 8, quantity: 1 },
    ]
    expect(calculateBundleStock(bundle)).toBe(4)

    // Si uno de los componentes se agota, el conjunto debe reportar 0 stock
    const outOfStockBundle = [
      { stock: 10, quantity: 1 },
      { stock: 0, quantity: 1 },
    ]
    expect(calculateBundleStock(outOfStockBundle)).toBe(0)
  })
})
