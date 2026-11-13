import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { turso } from '@/lib/db/turso'

export const dynamic = 'force-dynamic'

const CoverUpdateSchema = z.object({
  categoryId: z.string().min(1).max(64),
  imageUrl: z.string().url().max(1024),
})

async function ensureTable() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS category_covers (
      category_id TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

function optimizeCoverUrl(url: string): string {
  if (!url.includes('res.cloudinary.com') || url.includes('f_auto')) {
    return url
  }
  return url.replace('/upload/', '/upload/f_auto,q_auto:good,w_800,c_limit/')
}

export async function GET() {
  try {
    await ensureTable()
    const { rows } = await turso.execute('SELECT category_id, image_url FROM category_covers')
    const covers: Record<string, string> = {}
    for (const row of rows as unknown as Array<{ category_id: string; image_url: string }>) {
      if (row.category_id && row.image_url) {
        covers[row.category_id] = optimizeCoverUrl(row.image_url)
      }
    }
    return NextResponse.json({ covers })
  } catch (error) {
    console.warn('[GET /api/category-covers]:', error)
    return NextResponse.json({ covers: {} })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCookie =
      request.cookies.get('admin_session')?.value ||
      request.cookies.get('kuyen_admin_session')?.value
    if (!adminCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = CoverUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await ensureTable()
    const optimizedUrl = optimizeCoverUrl(parsed.data.imageUrl)
    const now = new Date().toISOString()

    await turso.execute({
      sql: `
        INSERT INTO category_covers (category_id, image_url, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(category_id) DO UPDATE SET
          image_url = excluded.image_url,
          updated_at = excluded.updated_at
      `,
      args: [parsed.data.categoryId, optimizedUrl, now],
    })

    return NextResponse.json({
      success: true,
      categoryId: parsed.data.categoryId,
      imageUrl: optimizedUrl,
    })
  } catch (error) {
    console.error('[POST /api/category-covers]:', error)
    return NextResponse.json({ error: 'Error guardando portada' }, { status: 500 })
  }
}
