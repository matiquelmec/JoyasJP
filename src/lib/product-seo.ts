import { productConfig } from '@/lib/config'
import type { Product } from '@/lib/types'

export interface ProductSpecificationItem {
  key: string
  value: string
}

export interface ProductSeoMetadata {
  title: string
  description: string
  keywords: string[]
  keywordsText: string
  categoryName: string
}

/**
 * Convierte cualquier representación de especificaciones (string multilínea, JSON array, objeto)
 * en una lista estructurada de pares { key, value } sin perder información.
 */
export function parseProductSpecifications(raw: unknown): ProductSpecificationItem[] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    const items: ProductSpecificationItem[] = []
    for (const entry of raw) {
      if (typeof entry === 'string') {
        items.push(...parseProductSpecifications(entry))
      } else if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>
        const key = String(obj.key ?? obj.name ?? obj.label ?? '').trim()
        const value = String(obj.value ?? obj.val ?? '').trim()
        if (key && value) {
          items.push({ key, value })
        } else if (value) {
          items.push({ key: 'Especificación', value })
        }
      }
    }
    return items
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    return Object.entries(obj)
      .map(([k, v]) => ({ key: k.trim(), value: String(v ?? '').trim() }))
      .filter((item) => item.key.length > 0 && item.value.length > 0)
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed || trimmed === '[]' || trimmed === '{}') return []

    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        return parseProductSpecifications(parsed)
      } catch {
        // Si no es JSON válido, parsear como texto multilínea
      }
    }

    return trimmed
      .split(/\r?\n|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const colonIdx = line.indexOf(':')
        if (colonIdx > 0 && colonIdx < line.length - 1) {
          return {
            key: line.slice(0, colonIdx).trim(),
            value: line.slice(colonIdx + 1).trim(),
          }
        }
        return {
          key: 'Especificación',
          value: line,
        }
      })
  }

  return []
}

/**
 * Convierte especificaciones estructuradas en texto legible ("Clave: Valor") para el editor del admin.
 */
export function formatSpecificationsText(raw: unknown): string {
  const items = parseProductSpecifications(raw)
  if (items.length === 0) return ''
  return items
    .map((item) =>
      item.key === 'Especificación' ? item.value : `${item.key}: ${item.value}`
    )
    .join('\n')
}

/**
 * Extrae texto de palabras clave SEO opcionales guardadas manualmente.
 */
export function extractCustomSeoKeywords(rawSeo: unknown): string {
  if (!rawSeo) return ''
  if (typeof rawSeo === 'string') {
    const trimmed = rawSeo.trim()
    if (!trimmed || trimmed === '{}' || trimmed === '[]') return ''
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return extractCustomSeoKeywords(JSON.parse(trimmed))
      } catch {
        return trimmed
      }
    }
    return trimmed
  }
  if (Array.isArray(rawSeo)) {
    return rawSeo.map((x) => String(x).trim()).filter(Boolean).join(', ')
  }
  if (typeof rawSeo === 'object') {
    const obj = rawSeo as Record<string, unknown>
    if (typeof obj.customKeywords === 'string') return obj.customKeywords
    if (typeof obj.keywords === 'string') return obj.keywords
    if (Array.isArray(obj.keywords)) {
      return obj.keywords.map((x) => String(x).trim()).filter(Boolean).join(', ')
    }
  }
  return ''
}

/**
 * Genera metadatos SEO profesionales y automáticos según estándares de joyería de alta gama.
 */
export function buildProductSeo(
  product: Partial<Product> & { name: string; category?: string }
): ProductSeoMetadata {
  const catId = (product.category || '').trim().toLowerCase()
  const catMeta = productConfig.categories.find((c) => c.id.toLowerCase() === catId)
  const categoryName = catMeta?.name || (product.category ? product.category : 'Joyería')

  const material = (product.materials || '').trim()
  const color = (product.color || '').trim()
  const dimensions = (product.dimensions || '').trim()
  const sku = (product.sku || product.code || '').trim()

  const titleParts = [product.name.trim()]
  if (material && !product.name.toLowerCase().includes(material.toLowerCase())) {
    titleParts.push(material)
  } else if (catMeta && !product.name.toLowerCase().includes(categoryName.toLowerCase())) {
    titleParts.push(categoryName)
  }
  const rawTitle = `${titleParts.join(' · ')} | Joyas JP`
  const title = rawTitle.length > 68 ? `${product.name.trim()} | Joyas JP` : rawTitle

  const descSegments: string[] = []
  if (product.description && product.description.trim().length > 0) {
    descSegments.push(product.description.trim())
  } else {
    descSegments.push(
      `${product.name.trim()} en ${material || categoryName} de alta joyería urbana.`
    )
  }
  if (dimensions && !descSegments[0].toLowerCase().includes(dimensions.toLowerCase())) {
    descSegments.push(`Medidas: ${dimensions}.`)
  }
  descSegments.push('Envío a todo Chile y gratis desde $50.000.')
  const fullDesc = descSegments.join(' ')
  const description = fullDesc.length > 160 ? `${fullDesc.slice(0, 157).trimEnd()}...` : fullDesc

  const autoKeywords = new Set<string>([
    product.name.trim().toLowerCase(),
    `${categoryName.toLowerCase()} chile`,
    `${categoryName.toLowerCase()} joyas jp`,
    'joyería urbana chile',
    'joyas jp',
  ])

  if (material) {
    autoKeywords.add(material.toLowerCase())
    autoKeywords.add(`${categoryName.toLowerCase()} ${material.toLowerCase()}`)
  }
  if (color) {
    autoKeywords.add(`${categoryName.toLowerCase()} ${color.toLowerCase()}`)
  }
  if (catId === 'plata-925' || material.toLowerCase().includes('925')) {
    autoKeywords.add('plata italiana 925')
    autoKeywords.add('plata ley 925 certificada')
  }
  if (catId === 'relojes') {
    autoKeywords.add('relojes casio chile')
    autoKeywords.add('relojes originales')
  }
  if (sku) {
    autoKeywords.add(sku.toLowerCase())
  }

  const customRaw = extractCustomSeoKeywords(product.seo)
  if (customRaw) {
    for (const kw of customRaw.split(',')) {
      const clean = kw.trim().toLowerCase()
      if (clean) autoKeywords.add(clean)
    }
  }

  const keywords = Array.from(autoKeywords)

  return {
    title,
    description,
    keywords,
    keywordsText: keywords.join(', '),
    categoryName,
  }
}

/**
 * Plantillas sugeridas de especificaciones técnicas por categoría para agilizar la carga en /admin.
 */
export function getSpecTemplateForCategory(category: string): string {
  const cat = (category || '').trim().toLowerCase()
  switch (cat) {
    case 'relojes':
      return 'Movimiento: Cuarzo japonés\nResistencia al agua: 30m (Uso diario)\nMaterial de caja: Acero inoxidable\nCristal: Mineral'
    case 'plata-925':
      return 'Pureza: Plata Italiana Ley 925 certificada\nOrigen: Italia\nHipoalergénica: Libre de níquel\nAcabado: Pulido espejo'
    case 'cadenas':
      return 'Tipo de eslabón: \nCierre: Mosquetón reforzado\nGrosor: \nLargo disponible: '
    case 'dijes':
      return 'Engaste / Detalle: \nPasador compatible: Cadenas hasta 5mm\nAcabado: '
    case 'pulseras':
      return 'Tipo de ajuste: \nCierre: \nGrosor: '
    case 'aros':
      return 'Tipo de broche: \nPeso: Ligero de uso diario\nHipoalergénico: Sí'
    default:
      return 'Material principal: \nAcabado: \nGarantía: 30 días por fallas de fábrica'
  }
}
