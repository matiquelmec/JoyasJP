import { productConfig } from '@/lib/config'

export type MainCategoryId = (typeof productConfig.categories)[number]['id']
export type SubcategoryId = (typeof productConfig.subcategories)[number]['id']

const MAIN_CATEGORY_IDS = new Set<string>(productConfig.categories.map((c) => c.id))
const SUBCATEGORY_IDS = new Set<string>(productConfig.subcategories.map((s) => s.id))

export function isMainCategoryId(id: string | null | undefined): id is MainCategoryId {
  return Boolean(id && MAIN_CATEGORY_IDS.has(id.trim().toLowerCase()))
}

export function isSubcategoryId(id: string | null | undefined): id is SubcategoryId {
  return Boolean(id && SUBCATEGORY_IDS.has(id.trim().toLowerCase()))
}

export function getCategoryName(id: string | null | undefined): string {
  if (!id) return 'Joyería'
  const clean = id.trim().toLowerCase()
  return (
    productConfig.categories.find((c) => c.id === clean)?.name ||
    id.charAt(0).toUpperCase() + id.slice(1)
  )
}

export function getSubcategoryName(id: string | null | undefined): string {
  if (!id) return ''
  const clean = id.trim().toLowerCase()
  return (
    productConfig.subcategories.find((s) => s.id === clean)?.name ||
    id.charAt(0).toUpperCase() + id.slice(1)
  )
}

/**
 * Devuelve las subcategorías válidas para una categoría principal.
 * Relojes no usa subcategorías de joyería (cadenas/dijes/etc.).
 */
export function getAllowedSubcategories(categoryId: string | null | undefined) {
  const clean = (categoryId || '').trim().toLowerCase()
  if (clean === 'relojes') {
    return []
  }
  return [...productConfig.subcategories]
}

/**
 * Resuelve parámetros de URL del catálogo manteniendo retrocompatibilidad con enlaces antiguos
 * (ej. /productos?categoria=cadenas -> category='all', subcategory='cadenas').
 */
export function resolveCatalogQuery(
  categoriaParam?: string | null,
  subcategoriaParam?: string | null
): { category: string; subcategory: string } {
  const rawCat = (categoriaParam || '').trim().toLowerCase()
  const rawSub = (subcategoriaParam || '').trim().toLowerCase()

  let category = 'all'
  let subcategory = isSubcategoryId(rawSub) ? rawSub : 'all'

  if (rawCat && rawCat !== 'all') {
    if (isMainCategoryId(rawCat)) {
      category = rawCat
    } else if (isSubcategoryId(rawCat)) {
      subcategory = rawCat
    }
  }

  if (category === 'relojes') {
    subcategory = 'all'
  }

  return { category, subcategory }
}

/**
 * Mapeo determinista para migrar productos legados de 1 nivel hacia (category, subcategory).
 */
export function inferTaxonomyFromLegacyProduct(input: {
  category?: string | null
  subcategory?: string | null
  materials?: string | null
}): { category: MainCategoryId; subcategory: SubcategoryId | null } {
  const rawCat = (input.category || '').trim().toLowerCase()
  const rawSub = (input.subcategory || '').trim().toLowerCase()
  const mat = (input.materials || '').trim().toLowerCase()

  // Si ya está migrado con categoría principal válida, preservar
  if (isMainCategoryId(rawCat)) {
    if (rawCat === 'relojes') {
      return { category: 'relojes', subcategory: null }
    }
    if (isSubcategoryId(rawSub)) {
      return { category: rawCat, subcategory: rawSub }
    }
    // Piezas que originalmente tenían category='plata-925' o 'enchapado-plata' eran cadenas
    return { category: rawCat, subcategory: 'cadenas' }
  }

  // Determinar subcategoría desde la antigua categoría de tipo de pieza
  const subcategory: SubcategoryId = isSubcategoryId(rawCat) ? rawCat : 'cadenas'

  // Determinar nueva categoría principal desde el material
  if (mat.includes('925') || mat.includes('plata ital') || mat.includes('plata ley')) {
    return { category: 'plata-925', subcategory }
  }
  if (mat.includes('enchap') || mat.includes('bañado de plata') || mat.includes('banado de plata')) {
    return { category: 'enchapado-plata', subcategory }
  }
  if (mat.includes('aleaci') || mat.includes('zinc')) {
    return { category: 'aleacion-zinc', subcategory }
  }

  return { category: 'acero-inoxidable', subcategory }
}
