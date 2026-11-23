import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { calculateBlackFridayDiscountPrice } from '@/lib/black-friday'
import { purgeStorefrontCache } from '@/services/order.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const blackFridayCampaignSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('apply'),
    category: z.string().min(1).default('all'),
    discountPercent: z.number().min(5).max(70),
  }),
  z.object({
    action: z.literal('restore'),
    category: z.string().min(1).default('all'),
  }),
])

export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = blackFridayCampaignSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Parámetros de campaña inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const { action, category } = parsed.data
    const filterAll = category === 'all'

    if (action === 'restore') {
      const result = filterAll
        ? await turso.execute({
            sql: "UPDATE products SET discount_price = NULL, updated_at = CURRENT_TIMESTAMP WHERE (deleted_at IS NULL OR deleted_at = '') AND discount_price IS NOT NULL",
            args: [],
          })
        : await turso.execute({
            sql: "UPDATE products SET discount_price = NULL, updated_at = CURRENT_TIMESTAMP WHERE (deleted_at IS NULL OR deleted_at = '') AND category = ? AND discount_price IS NOT NULL",
            args: [category],
          })

      purgeStorefrontCache([])
      try {
        revalidatePath('/', 'layout')
        revalidatePath('/productos')
        revalidatePath('/google-shopping.xml')
        revalidatePath('/admin')
      } catch {
        // Non-blocking cache revalidation
      }

      return NextResponse.json({
        success: true,
        action: 'restore',
        category,
        updatedCount: result.rowsAffected ?? 0,
      })
    }

    const { discountPercent } = parsed.data
    const { rows } = filterAll
      ? await turso.execute({
          sql: "SELECT id, slug, price FROM products WHERE (deleted_at IS NULL OR deleted_at = '') AND price > 0",
          args: [],
        })
      : await turso.execute({
          sql: "SELECT id, slug, price FROM products WHERE (deleted_at IS NULL OR deleted_at = '') AND price > 0 AND category = ?",
          args: [category],
        })

    if (!rows.length) {
      return NextResponse.json({
        success: true,
        action: 'apply',
        category,
        discountPercent,
        updatedCount: 0,
      })
    }

    const statements = rows.map((row) => {
      const newDiscountPrice = calculateBlackFridayDiscountPrice(Number(row.price), discountPercent)
      return {
        sql: 'UPDATE products SET discount_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [newDiscountPrice, String(row.id)],
      }
    })

    // Ejecutar en lotes atómicos de 50 sentencias
    for (let i = 0; i < statements.length; i += 50) {
      await turso.batch(statements.slice(i, i + 50), 'write')
    }

    const identifiers: string[] = []
    for (const row of rows) {
      identifiers.push(String(row.id))
      if (row.slug) identifiers.push(String(row.slug))
    }

    purgeStorefrontCache(identifiers)
    try {
      revalidatePath('/', 'layout')
      revalidatePath('/productos')
      revalidatePath('/google-shopping.xml')
      revalidatePath('/admin')
    } catch {
      // Non-blocking cache revalidation
    }

    return NextResponse.json({
      success: true,
      action: 'apply',
      category,
      discountPercent,
      updatedCount: rows.length,
    })
  } catch (error) {
    console.error('[Black Friday Bulk API] Error:', error)
    return NextResponse.json(
      { error: 'No se pudo actualizar la campaña Black Friday' },
      { status: 500 }
    )
  }
}
