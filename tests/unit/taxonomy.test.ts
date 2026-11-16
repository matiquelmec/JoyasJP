import { describe, expect, it } from 'vitest'
import {
  getAllowedSubcategories,
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
})
