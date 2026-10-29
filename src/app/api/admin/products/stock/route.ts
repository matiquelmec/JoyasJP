import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = body.id || body.productId
    const stock = Math.max(0, Number(body.stock || 0))

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
    }

    await turso.execute({
      sql: 'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [stock, id],
    })

    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout')
      revalidatePath('/productos')
      revalidatePath(`/productos/${id}`)
    } catch (e) {
      console.warn('Revalidation failed after stock update:', e)
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
