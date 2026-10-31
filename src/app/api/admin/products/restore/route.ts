import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { adminProductRestoreSchema } from '@/lib/validations/admin'
import { purgeStorefrontCache } from '@/services/order.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST - Restaurar producto archivado con validación Zod v4 y purga ISR 0ms
export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = adminProductRestoreSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'ID de producto inválido',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const productId = (parsed.data.id || parsed.data.productId)!
    const restoredStock = parsed.data.originalStock ?? 5

    await turso.execute({
      sql: 'UPDATE products SET deleted_at = NULL, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [restoredStock, productId],
    })

    const { rows } = await turso.execute({
      sql: 'SELECT * FROM products WHERE id = ? LIMIT 1',
      args: [productId],
    })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const slug = rows[0].slug ? String(rows[0].slug) : ''
    purgeStorefrontCache([productId, slug])
    try {
      revalidatePath('/admin')
      revalidatePath('/admin/productos')
    } catch {
      // No bloquear respuesta
    }

    return NextResponse.json({ product: rows[0] })
  } catch (error) {
    console.error('Error restoring product:', error)
    return NextResponse.json(
      {
        error: 'Failed to restore product',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}
