import { describe, it, expect } from 'vitest'
import { getProductBadge } from '@/lib/product-badges'

describe('getProductBadge (Estándar Alta Joyería - Máximo 1 etiqueta)', () => {
  const baseProduct = {
    stock: 1,
    price: 50000,
    discount_price: undefined,
    custom_label: undefined,
    is_bundle: false,
    category: 'cadenas',
  }

  it('muestra tarjeta limpia (null) cuando stock === 1 y no hay etiqueta manual ni oferta', () => {
    expect(getProductBadge(baseProduct)).toBeNull()
  })

  it('muestra AGOTADO cuando stock <= 0 por encima de cualquier otra etiqueta', () => {
    const badge = getProductBadge({
      ...baseProduct,
      stock: 0,
      discount_price: 35000,
      custom_label: 'EXCLUSIVO',
      is_bundle: true,
    })
    expect(badge?.variant).toBe('soldout')
    expect(badge?.text).toBe('AGOTADO')
  })

  it('prioriza el descuento (-X%) sobre etiqueta manual y set', () => {
    const badge = getProductBadge({
      ...baseProduct,
      price: 100000,
      discount_price: 80000,
      custom_label: 'NUEVO',
      is_bundle: true,
    })
    expect(badge?.variant).toBe('sale')
    expect(badge?.text).toBe('-20%')
  })

  it('muestra la etiqueta manual curada si no hay descuento', () => {
    const badge = getProductBadge({
      ...baseProduct,
      custom_label: 'Edición Milano',
      is_bundle: true,
    })
    expect(badge?.variant).toBe('custom')
    expect(badge?.text).toBe('EDICIÓN MILANO')
  })

  it('muestra SET EXCLUSIVO si es bundle o categoría conjuntos sin descuento ni etiqueta manual', () => {
    const badge = getProductBadge({
      ...baseProduct,
      is_bundle: true,
    })
    expect(badge?.variant).toBe('bundle')
    expect(badge?.text).toBe('SET EXCLUSIVO')
  })

  it('ignora custom_label vacío o con solo espacios', () => {
    const badge = getProductBadge({
      ...baseProduct,
      custom_label: '   ',
    })
    expect(badge).toBeNull()
  })
})
