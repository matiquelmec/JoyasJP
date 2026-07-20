import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/product.service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const currentProductId = searchParams.get('id') || ''

    if (!category) {
      return NextResponse.json({ error: 'Missing category parameter' }, { status: 400 })
    }

    // Obtener productos relacionados y otros desde el servicio de servidor (que usa Turso/SQLite)
    const [related, allProducts] = await Promise.all([
      ProductService.getRelatedProducts(category, currentProductId),
      ProductService.getAllProducts()
    ])

    // Filtrar otros productos (diferente categoría y que tengan stock)
    const otherProducts = allProducts
      .filter(p => p.category !== category && p.id !== currentProductId && p.stock > 0)
      .slice(0, 4)

    return NextResponse.json({
      related: related.slice(0, 4),
      others: otherProducts
    })
  } catch (error) {
    console.error('Error in API /api/products/related:', error)
    return NextResponse.json({
      error: 'Failed to fetch related products',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
