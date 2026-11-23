import { NextResponse } from 'next/server'
import { ProductService } from '@/services/product.service'
import { buildGoogleShoppingXml } from '@/lib/google-shopping'

export const revalidate = 3600

export async function GET() {
  try {
    const products = await ProductService.getAllProducts()
    const xml = buildGoogleShoppingXml(products)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('[GET /google-shopping.xml]:', error)
    return new NextResponse('Error generating Google Shopping feed', { status: 500 })
  }
}
