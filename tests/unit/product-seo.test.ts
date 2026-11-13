import { describe, expect, it } from 'vitest'
import {
  buildProductSeo,
  extractCustomSeoKeywords,
  formatSpecificationsText,
  parseProductSpecifications,
} from '@/lib/product-seo'
import {
  adminProductMutationSchema,
  adminProductUpdateSchema,
} from '@/lib/validations/admin'

describe('product-seo & specifications persistence', () => {
  it('parses multiline Key: Value specifications without losing entries', () => {
    const raw = 'Pureza: Plata Italiana 925\nPeso: 18g\nCierre reforzado'
    const parsed = parseProductSpecifications(raw)

    expect(parsed).toEqual([
      { key: 'Pureza', value: 'Plata Italiana 925' },
      { key: 'Peso', value: '18g' },
      { key: 'Especificación', value: 'Cierre reforzado' },
    ])
    expect(formatSpecificationsText(parsed)).toBe(
      'Pureza: Plata Italiana 925\nPeso: 18g\nCierre reforzado'
    )
  })

  it('parses JSON-serialized specification arrays from Turso DB', () => {
    const dbValue = JSON.stringify([
      { key: 'Movimiento', value: 'Cuarzo japonés' },
      { key: 'Resistencia al agua', value: '30m' },
    ])

    expect(parseProductSpecifications(dbValue)).toEqual([
      { key: 'Movimiento', value: 'Cuarzo japonés' },
      { key: 'Resistencia al agua', value: '30m' },
    ])
  })

  it('builds automated luxury jewelry SEO metadata and merges optional custom keywords', () => {
    const seo = buildProductSeo({
      name: 'Casio MTP-V002D-1B',
      category: 'relojes',
      materials: 'Acero Inoxidable',
      color: 'Plateado',
      dimensions: '44×37×9,6 mm',
      sku: 'RC-002',
      seo: JSON.stringify({ customKeywords: 'reloj elegante, regalo hombre' }),
    })

    expect(seo.title).toContain('Casio MTP-V002D-1B')
    expect(seo.title).toContain('Joyas JP')
    expect(seo.description).toContain('Medidas: 44×37×9,6 mm.')
    expect(seo.keywords).toContain('relojes casio chile')
    expect(seo.keywords).toContain('rc-002')
    expect(seo.keywords).toContain('reloj elegante')
    expect(seo.keywords).toContain('regalo hombre')
  })

  it('extracts custom keywords cleanly from string or JSON seo objects', () => {
    expect(extractCustomSeoKeywords('regalo, aniversario')).toBe('regalo, aniversario')
    expect(extractCustomSeoKeywords({ customKeywords: 'cadena gruesa' })).toBe('cadena gruesa')
    expect(extractCustomSeoKeywords('{}')).toBe('')
  })
})

describe('admin product validation rules', () => {
  it('accepts valid product with discount_price strictly lower than price', () => {
    const result = adminProductMutationSchema.safeParse({
      name: 'Cadena Cubana',
      price: 49990,
      discount_price: 39990,
      stock: 3,
      category: 'cadenas',
      specifications: 'Pureza: Plata 925',
    })

    expect(result.success).toBe(true)
  })

  it('rejects discount_price greater than or equal to regular price on create and update', () => {
    const invalidCreate = adminProductMutationSchema.safeParse({
      name: 'Cadena Cubana',
      price: 30000,
      discount_price: 35000,
      stock: 3,
      category: 'cadenas',
    })
    expect(invalidCreate.success).toBe(false)

    const invalidUpdate = adminProductUpdateSchema.safeParse({
      id: 'prod-123',
      name: 'Cadena Cubana',
      price: 30000,
      discount_price: 30000,
      stock: 3,
      category: 'cadenas',
    })
    expect(invalidUpdate.success).toBe(false)
  })
})
