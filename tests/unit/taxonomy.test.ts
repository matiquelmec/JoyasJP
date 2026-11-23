import { describe, expect, it } from 'vitest'
import {
  buildCatalogAvailabilityMap,
  getAllowedSubcategories,
  getAvailableCategoriesForProducts,
  getAvailableSubcategoriesForCategory,
  getCategoryName,
  getSubcategoryName,
  inferTaxonomyFromLegacyProduct,
  resolveCatalogQuery,
} from '@/lib/taxonomy'

describe('2-level jewelry taxonomy helpers', () => {
  it('resolves legacy piece-type URLs into subcategory filters seamlessly', () => {
    expect(resolveCatalogQuery('cadenas', null)).toEqual({
      category: 'all',
      subcategory: 'cadenas',
    })
    expect(resolveCatalogQuery('acero-inoxidable', 'dijes')).toEqual({
      category: 'acero-inoxidable',
      subcategory: 'dijes',
    })
    expect(resolveCatalogQuery('relojes', 'cadenas')).toEqual({
      category: 'relojes',
      subcategory: 'all',
    })
  })

  it('infers main category and subcategory deterministically from legacy DB rows', () => {
    expect(
      inferTaxonomyFromLegacyProduct({ category: 'plata-925', materials: 'Plata Italy 925' })
    ).toEqual({ category: 'plata-925', subcategory: 'cadenas' })

    expect(
      inferTaxonomyFromLegacyProduct({
        category: 'aros',
        materials: 'Bañado de plata con piedra roja',
      })
    ).toEqual({ category: 'enchapado-plata', subcategory: 'aros' })

    expect(
      inferTaxonomyFromLegacyProduct({ category: 'dijes', materials: 'Aleación de zinc' })
    ).toEqual({ category: 'aleacion-zinc', subcategory: 'dijes' })

    expect(
      inferTaxonomyFromLegacyProduct({ category: 'cadenas', materials: 'Acero quirúrgico' })
    ).toEqual({ category: 'acero-inoxidable', subcategory: 'cadenas' })

    expect(
      inferTaxonomyFromLegacyProduct({ category: 'relojes', materials: 'Acero' })
    ).toEqual({ category: 'relojes', subcategory: null })
  })

  it('returns allowed subcategories and canonical labels', () => {
    expect(getAllowedSubcategories('relojes')).toEqual([])
    expect(getAllowedSubcategories('plata-925')).toHaveLength(5)
    expect(getCategoryName('plata-925')).toBe('Plata Italiana 925')
    expect(getSubcategoryName('dijes')).toBe('Dijes / Colgantes')
  })

  it('computes dynamic categories and subcategories strictly from active products', () => {
    const sampleProducts = [
      { category: 'plata-925', subcategory: 'cadenas' },
      { category: 'acero-inoxidable', subcategory: 'cadenas' },
      { category: 'acero-inoxidable', subcategory: 'dijes' },
      { category: 'acero-inoxidable', subcategory: 'pulseras' },
      { category: 'acero-inoxidable', subcategory: 'aros' },
      { category: 'enchapado-plata', subcategory: 'cadenas' },
      { category: 'enchapado-plata', subcategory: 'aros' },
      { category: 'aleacion-zinc', subcategory: 'dijes' },
      { category: 'aleacion-zinc', subcategory: 'conjuntos' },
      { category: 'relojes', subcategory: null },
    ]

    expect(getAvailableCategoriesForProducts(sampleProducts).map((c) => c.id)).toEqual([
      'plata-925',
      'acero-inoxidable',
      'enchapado-plata',
      'aleacion-zinc',
      'relojes',
    ])

    // Plata 925 solo tiene cadenas -> oculta dijes, pulseras, aros y conjuntos
    expect(getAvailableSubcategoriesForCategory(sampleProducts, 'plata-925').map((s) => s.id)).toEqual([
      'cadenas',
    ])

    // Acero Inoxidable no tiene conjuntos
    expect(
      getAvailableSubcategoriesForCategory(sampleProducts, 'acero-inoxidable').map((s) => s.id)
    ).toEqual(['cadenas', 'dijes', 'pulseras', 'aros'])

    // Enchapado de Plata solo tiene cadenas y aros
    expect(
      getAvailableSubcategoriesForCategory(sampleProducts, 'enchapado-plata').map((s) => s.id)
    ).toEqual(['cadenas', 'aros'])

    // Relojes nunca expone subcategorías
    expect(getAvailableSubcategoriesForCategory(sampleProducts, 'relojes')).toEqual([])

    // Mapa serializable para el Asistente de Estilo
    const availability = buildCatalogAvailabilityMap(sampleProducts)
    expect(availability.subcategoriesByCategory['plata-925']).toEqual(['cadenas'])
    expect(availability.subcategoriesByCategory['aleacion-zinc']).toEqual(['dijes', 'conjuntos'])
    expect(availability.subcategoriesByCategory['all']).toEqual([
      'cadenas',
      'dijes',
      'pulseras',
      'aros',
      'conjuntos',
    ])
  })
})
