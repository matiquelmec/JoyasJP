import { siteConfig } from '@/lib/config'
import { buildProductSeo } from '@/lib/product-seo'
import type { Product } from '@/lib/types'

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function resolveProductBrandAndMpn(product: Pick<Product, 'id' | 'name' | 'category' | 'sku'>): {
  brand: string
  mpn: string
  identifierExists: 'yes' | 'no'
} {
  const isCasioWatch =
    (product.category || '').trim().toLowerCase() === 'relojes' &&
    product.name.toLowerCase().includes('casio')

  if (isCasioWatch) {
    const model = product.name.replace(/casio/i, '').trim() || product.sku || product.id
    return {
      brand: 'Casio',
      mpn: model,
      identifierExists: 'yes',
    }
  }

  return {
    brand: 'Joyas JP',
    mpn: product.sku || product.id,
    identifierExists: 'no',
  }
}

export function resolveGoogleProductCategory(
  product: Pick<Product, 'category' | 'subcategory'>
): string {
  const cat = (product.category || '').trim().toLowerCase()
  const sub = (product.subcategory || '').trim().toLowerCase()

  if (cat === 'relojes') return '201' // Apparel & Accessories > Jewelry > Watches
  if (sub === 'cadenas') return '196' // Necklaces
  if (sub === 'dijes') return '192' // Charms & Pendants
  if (sub === 'pulseras') return '191' // Bracelets
  if (sub === 'aros') return '194' // Earrings
  return '188' // Jewelry
}

export function buildGoogleShoppingXml(
  products: Product[],
  siteUrl: string = siteConfig.url
): string {
  const baseUrl = siteUrl.replace(/\/+$/, '')
  const freeShippingFrom = siteConfig.ecommerce.freeShippingFrom

  const itemsXml = products
    .filter((p) => Boolean(p.id && p.name && p.price > 0 && p.imageUrl))
    .map((product) => {
      const productUrl = `${baseUrl}/productos/${product.slug || product.id}`
      const seo = buildProductSeo(product)
      const description = (product.description || seo.description).trim()
      const hasSale = Boolean(
        product.discount_price && product.discount_price > 0 && product.discount_price < product.price
      )
      const effectivePrice = hasSale ? product.discount_price! : product.price
      const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock'
      const shippingPrice = effectivePrice >= freeShippingFrom ? 0 : 3000
      const { brand, mpn, identifierExists } = resolveProductBrandAndMpn(product)
      const googleCategory = resolveGoogleProductCategory(product)

      const primaryImage = product.imageUrl.startsWith('http')
        ? product.imageUrl
        : `${baseUrl}${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`

      const additionalImages = (Array.isArray(product.gallery) ? product.gallery : [])
        .filter((img) => img && img !== product.imageUrl)
        .slice(0, 5)
        .map((img) =>
          img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`
        )

      const lines = [
        '    <item>',
        `      <g:id>${escapeXml(product.sku || product.id)}</g:id>`,
        `      <g:title>${escapeXml(product.name.trim())}</g:title>`,
        `      <g:description>${escapeXml(description)}</g:description>`,
        `      <g:link>${escapeXml(productUrl)}</g:link>`,
        `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>`,
        ...additionalImages.map(
          (img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
        ),
        `      <g:availability>${availability}</g:availability>`,
        `      <g:price>${Math.round(product.price)} CLP</g:price>`,
        ...(hasSale
          ? [`      <g:sale_price>${Math.round(product.discount_price!)} CLP</g:sale_price>`]
          : []),
        '      <g:condition>new</g:condition>',
        `      <g:brand>${escapeXml(brand)}</g:brand>`,
        `      <g:mpn>${escapeXml(mpn)}</g:mpn>`,
        `      <g:identifier_exists>${identifierExists}</g:identifier_exists>`,
        `      <g:google_product_category>${googleCategory}</g:google_product_category>`,
        ...(product.materials
          ? [`      <g:material>${escapeXml(product.materials.trim())}</g:material>`]
          : []),
        ...(product.color ? [`      <g:color>${escapeXml(product.color.trim())}</g:color>`] : []),
        '      <g:age_group>adult</g:age_group>',
        '      <g:gender>unisex</g:gender>',
        '      <g:shipping>',
        '        <g:country>CL</g:country>',
        `        <g:service>${shippingPrice === 0 ? 'Envio Gratis Starken' : 'Starken Estandar'}</g:service>`,
        `        <g:price>${shippingPrice} CLP</g:price>`,
        '      </g:shipping>',
        '    </item>',
      ]

      return lines.join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(siteConfig.name)}</title>`,
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <description>${escapeXml(siteConfig.description)}</description>`,
    itemsXml,
    '  </channel>',
    '</rss>',
  ].join('\n')
}
