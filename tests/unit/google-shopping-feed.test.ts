import { describe, expect, it } from 'vitest'
import {
  buildGoogleShoppingXml,
  escapeXml,
  resolveGoogleProductCategory,
  resolveProductBrandAndMpn,
} from '@/lib/google-shopping'
import type { Product } from '@/lib/types'

describe('Google Shopping XML feed engine', () => {
  it('escapes XML special characters safely', () => {
    expect(escapeXml('Cadena & Dije <Plata> "925"')).toBe(
      'Cadena &amp; Dije &lt;Plata&gt; &quot;925&quot;'
    )
  })

  it('assigns brand Casio + MPN for Casio watches and identifier_exists=no for Joyas JP jewelry', () => {
    expect(
      resolveProductBrandAndMpn({
        id: 'w1',
        name: 'Casio MTP-V002D-1B',
        category: 'relojes',
      })
    ).toEqual({
      brand: 'Casio',
      mpn: 'MTP-V002D-1B',
      identifierExists: 'yes',
    })

    expect(
      resolveProductBrandAndMpn({
        id: 'j1',
        name: 'Cubana 925',
        category: 'plata-925',
        sku: 'JP-925-01',
      })
    ).toEqual({
      brand: 'Joyas JP',
      mpn: 'JP-925-01',
      identifierExists: 'no',
    })
  })

  it('maps Google product taxonomy IDs accurately', () => {
    expect(resolveGoogleProductCategory({ category: 'relojes' })).toBe('201')
    expect(resolveGoogleProductCategory({ category: 'acero-inoxidable', subcategory: 'cadenas' })).toBe('196')
    expect(resolveGoogleProductCategory({ category: 'aleacion-zinc', subcategory: 'dijes' })).toBe('192')
    expect(resolveGoogleProductCategory({ category: 'acero-inoxidable', subcategory: 'pulseras' })).toBe('191')
    expect(resolveGoogleProductCategory({ category: 'enchapado-plata', subcategory: 'aros' })).toBe('194')
  })

  it('generates valid RSS 2.0 XML with sale_price and dynamic 70000 CLP free shipping', () => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Casio MTP-1314SG-1AV',
        slug: 'casio-mtp-1314sg-1av',
        price: 75000,
        stock: 1,
        category: 'relojes',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/watch.png',
        materials: 'Acero',
        color: 'Plateado',
      },
      {
        id: '2',
        name: 'King & Crown',
        slug: 'king-crown',
        price: 25000,
        discount_price: 19990,
        stock: 1,
        category: 'aleacion-zinc',
        subcategory: 'dijes',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/king.png',
        materials: 'Aleación de zinc',
      },
    ]

    const xml = buildGoogleShoppingXml(sampleProducts, 'https://joyasjp.cl')

    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"')
    expect(xml).toContain('<g:brand>Casio</g:brand>')
    expect(xml).toContain('<g:price>0 CLP</g:price>')
    expect(xml).toContain('<g:title>King &amp; Crown</g:title>')
    expect(xml).toContain('<g:sale_price>19990 CLP</g:sale_price>')
    expect(xml).toContain('<g:identifier_exists>no</g:identifier_exists>')
    expect(xml).toContain('<g:price>3000 CLP</g:price>')
  })
})
