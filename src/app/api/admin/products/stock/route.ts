import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { adminStockUpdateSchema } from '@/lib/validations/admin'
import { purgeStorefrontCache } from '@/services/order.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function handleStockUpdate(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = adminStockUpdateSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de stock inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const id = (parsed.data.id || parsed.data.productId)!
    const stock = parsed.data.stock

    await turso.execute({
      sql: 'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [stock, id],
    })

    // Identificar slug propio y conjuntos padres cuyos stocks dinámicos dependan de esta pieza
    const cacheIdentifiers: string[] = [id]
    const { rows: relatedRows } = await turso.execute({
      sql: `SELECT id, slug FROM products WHERE id = ?
            UNION
            SELECT p.id, p.slug FROM products p
            JOIN bundle_items bi ON p.id = bi.bundle_id
            WHERE bi.product_id = ?`,
      args: [id, id],
    })

    for (const row of relatedRows) {
      cacheIdentifiers.push(String(row.id))
      if (row.slug) cacheIdentifiers.push(String(row.slug))
    }

    purgeStorefrontCache(cacheIdentifiers)
    try {
      revalidatePath('/admin')
      revalidatePath('/admin/productos')
    } catch {
      // No bloquear respuesta
    }

    return NextResponse.json({ success: true, id, stock })
  } catch (error) {
    console.error('Error updating product stock:', error)
    return NextResponse.json(
      {
        error: 'Failed to update stock',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return handleStockUpdate(request)
}

export async function PUT(request: NextRequest) {
  return handleStockUpdate(request)
}
