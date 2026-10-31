import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/services/product.service'
import { relatedProductsQuerySchema } from '@/lib/validations/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = relatedProductsQuerySchema.safeParse({
      category: searchParams.get('category') || '',
      id: searchParams.get('id') || '',
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Missing category parameter' },
        { status: 400 }
      )
    }

    const { category, id: currentProductId } = parsed.data

    const [related, allProducts] = await Promise.all([
      ProductService.getRelatedProducts(currentProductId, category),
      ProductService.getAllProducts(),
    ])

    const otherProducts = allProducts
      .filter((p) => p.category !== category && p.id !== currentProductId && p.stock > 0)
      .slice(0, 4)

    return NextResponse.json({
      related: related.slice(0, 4),
      others: otherProducts,
    })
  } catch (error) {
    console.error('Error in API /api/products/related:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch related products',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
