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

    const cleanCategory = category.trim().toLowerCase()
    const candidates = allProducts.filter(
      (p) =>
        (p.category || '').trim().toLowerCase() !== cleanCategory &&
        p.id !== currentProductId &&
        p.stock > 0
    )

    // Seleccionar hasta 4 piezas priorizando diversidad de categorías (1 por categoría primero)
    const otherProducts: typeof candidates = []
    const seenCategories = new Set<string>()

    for (const item of candidates) {
      const cat = (item.category || '').trim().toLowerCase()
      if (!seenCategories.has(cat)) {
        seenCategories.add(cat)
        otherProducts.push(item)
        if (otherProducts.length === 4) break
      }
    }

    if (otherProducts.length < 4) {
      for (const item of candidates) {
        if (!otherProducts.some((x) => x.id === item.id)) {
          otherProducts.push(item)
          if (otherProducts.length === 4) break
        }
      }
    }

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
