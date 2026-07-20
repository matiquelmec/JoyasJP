import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'

// POST - Restaurar producto eliminado
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { productId, originalStock } = await request.json()

    // En SQLite/Turso la columna deleted_at existe. Hacemos update directo:
    await turso.execute({
      sql: "UPDATE products SET deleted_at = NULL, stock = ? WHERE id = ?",
      args: [originalStock || 5, productId]
    })

    const { rows } = await turso.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [productId]
    })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: rows[0] })
  } catch (error) {
    console.error('Error restoring product:', error)
    return NextResponse.json({
      error: 'Failed to restore product',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}