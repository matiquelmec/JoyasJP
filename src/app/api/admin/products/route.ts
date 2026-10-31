import type { InStatement } from '@libsql/client'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { generateSlug } from '@/lib/slug-utils'
import {
  adminProductDeleteSchema,
  adminProductMutationSchema,
  adminProductUpdateSchema,
} from '@/lib/validations/admin'
import { purgeStorefrontCache } from '@/services/order.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function safeParseJson<T>(raw: unknown, fallback: T): T {
  if (raw === null || raw === undefined || raw === '') return fallback
  if (typeof raw === 'object') return raw as T
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

// GET - Obtener todos los productos con stock físico de bundles resuelto
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await turso.execute('SELECT * FROM products ORDER BY id DESC')
    const { rows: bundleItems } = await turso.execute('SELECT * FROM bundle_items')

    const stockMap = new Map<string, number>()
    rows.forEach((r) => {
      stockMap.set(String(r.id), Number(r.stock || 0))
    })

    const products = rows.map((r) => {
      const is_bundle = Number(r.is_bundle || 0) === 1 || String(r.is_bundle) === 'true'
      const components = is_bundle
        ? bundleItems
            .filter((item) => item.bundle_id === r.id)
            .map((item) => ({
              product_id: String(item.product_id),
              quantity: Math.max(1, Number(item.quantity || 1)),
            }))
        : []

      let calculatedStock = Number(r.stock || 0)
      if (is_bundle) {
        if (components.length === 0) {
          calculatedStock = 0
        } else {
          const maxBundles = components.map((c) => {
            const compStock = stockMap.get(String(c.product_id)) || 0
            return Math.floor(compStock / c.quantity)
          })
          calculatedStock = Math.min(...maxBundles)
        }
      }

      return {
        ...r,
        stock: calculatedStock,
        is_priority: Number(r.is_priority || 0) === 1 || String(r.is_priority) === 'true',
        is_bundle,
        components,
        gallery: safeParseJson<string[]>(r.gallery, []),
        variants: safeParseJson<unknown[]>(r.variants, []),
        specifications: safeParseJson<unknown[]>(r.specifications, []),
        seo: safeParseJson<Record<string, unknown>>(r.seo, {}),
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo producto atómicamente en turso.batch
export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = adminProductMutationSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de producto inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const productId = crypto.randomUUID()
    const { code, components, ...productDataWithoutCode } = parsed.data
    const sku = productDataWithoutCode.sku || code || null

    const gallery = JSON.stringify(
      Array.isArray(productDataWithoutCode.gallery) ? productDataWithoutCode.gallery : []
    )
    const variants = JSON.stringify(
      Array.isArray(productDataWithoutCode.variants) ? productDataWithoutCode.variants : []
    )
    const specifications = JSON.stringify(
      Array.isArray(productDataWithoutCode.specifications)
        ? productDataWithoutCode.specifications
        : []
    )
    const seo = JSON.stringify(productDataWithoutCode.seo || {})
    const is_priority = productDataWithoutCode.is_priority ? 1 : 0
    const is_bundle = productDataWithoutCode.is_bundle ? 1 : 0

    let slug = productDataWithoutCode.slug || generateSlug(productDataWithoutCode.name || '')

    const { rows: slugCheck } = await turso.execute({
      sql: 'SELECT id FROM products WHERE slug = ?',
      args: [slug],
    })
    if (slugCheck.length > 0) {
      slug = `${generateSlug(productDataWithoutCode.name || '')}-${Date.now().toString(36)}`
    }

    const imageUrl =
      productDataWithoutCode.imageUrl ||
      (Array.isArray(productDataWithoutCode.gallery)
        ? productDataWithoutCode.gallery[0]
        : null) ||
      null

    const batchStatements: InStatement[] = [
      {
        sql: `INSERT INTO products (
          id, name, price, imageUrl, category, dimensions, materials, color, stock, detail, description, specifications, gallery, variants, sku, seo, image_hint, is_priority, is_bundle, slug, discount_price, custom_label
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          productId,
          productDataWithoutCode.name.trim(),
          Number(productDataWithoutCode.price),
          imageUrl,
          productDataWithoutCode.category || null,
          productDataWithoutCode.dimensions || null,
          productDataWithoutCode.materials || null,
          productDataWithoutCode.color || null,
          Number(productDataWithoutCode.stock || 0),
          productDataWithoutCode.detail || null,
          productDataWithoutCode.description || null,
          specifications,
          gallery,
          variants,
          sku,
          seo,
          productDataWithoutCode.image_hint || null,
          is_priority,
          is_bundle,
          slug,
          productDataWithoutCode.discount_price !== null &&
          productDataWithoutCode.discount_price !== undefined
            ? Number(productDataWithoutCode.discount_price)
            : null,
          productDataWithoutCode.custom_label || null,
        ],
      },
    ]

    if (is_bundle === 1 && Array.isArray(components)) {
      for (const comp of components) {
        if (comp.product_id) {
          batchStatements.push({
            sql: 'INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)',
            args: [productId, comp.product_id, Math.max(1, Number(comp.quantity || 1))],
          })
        }
      }
    }

    await turso.batch(batchStatements, 'write')

    purgeStorefrontCache([productId, slug])
    try {
      revalidatePath('/admin')
      revalidatePath('/admin/productos')
    } catch {
      // No bloquear respuesta si falla revalidación interna
    }

    return NextResponse.json(
      { product: { id: productId, slug, ...productDataWithoutCode } },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Full error creating product:', error)
    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PUT - Actualizar producto y componentes de bundle atómicamente en turso.batch
export async function PUT(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = adminProductUpdateSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de actualización de producto inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const { id, code, components, ...productData } = parsed.data
    const sku = productData.sku || code || null

    if (Array.isArray(productData.gallery)) {
      productData.imageUrl = productData.imageUrl || productData.gallery[0] || null
    }

    const gallery = JSON.stringify(
      Array.isArray(productData.gallery) ? productData.gallery : []
    )
    const variants = JSON.stringify(
      Array.isArray(productData.variants) ? productData.variants : []
    )
    const specifications = JSON.stringify(
      Array.isArray(productData.specifications) ? productData.specifications : []
    )
    const seo = JSON.stringify(productData.seo || {})
    const is_priority = productData.is_priority ? 1 : 0
    const is_bundle = productData.is_bundle ? 1 : 0

    let slug = productData.slug || generateSlug(productData.name || '')

    const { rows: slugCheck } = await turso.execute({
      sql: 'SELECT id FROM products WHERE slug = ? AND id != ?',
      args: [slug, id],
    })
    if (slugCheck.length > 0) {
      slug = `${generateSlug(productData.name || '')}-${Date.now().toString(36)}`
    }

    const batchStatements: InStatement[] = [
      {
        sql: `UPDATE products SET 
          name = ?, price = ?, imageUrl = ?, category = ?, dimensions = ?, materials = ?, color = ?, stock = ?, detail = ?, description = ?, specifications = ?, gallery = ?, variants = ?, sku = ?, seo = ?, image_hint = ?, is_priority = ?, is_bundle = ?, slug = ?, discount_price = ?, custom_label = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        args: [
          productData.name.trim(),
          Number(productData.price),
          productData.imageUrl || null,
          productData.category || null,
          productData.dimensions || null,
          productData.materials || null,
          productData.color || null,
          Number(productData.stock || 0),
          productData.detail || null,
          productData.description || null,
          specifications,
          gallery,
          variants,
          sku,
          seo,
          productData.image_hint || null,
          is_priority,
          is_bundle,
          slug,
          productData.discount_price !== null && productData.discount_price !== undefined
            ? Number(productData.discount_price)
            : null,
          productData.custom_label || null,
          id,
        ],
      },
      {
        sql: 'DELETE FROM bundle_items WHERE bundle_id = ?',
        args: [id],
      },
    ]

    if (is_bundle === 1 && Array.isArray(components)) {
      for (const comp of components) {
        if (comp.product_id) {
          batchStatements.push({
            sql: 'INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)',
            args: [id, comp.product_id, Math.max(1, Number(comp.quantity || 1))],
          })
        }
      }
    }

    await turso.batch(batchStatements, 'write')

    // Invalidar el propio producto y cualquier conjunto padre si esta joya es componente
    const cacheIdentifiers: string[] = [id, slug]
    const { rows: parentBundles } = await turso.execute({
      sql: `SELECT p.id, p.slug FROM products p
            JOIN bundle_items bi ON p.id = bi.bundle_id
            WHERE bi.product_id = ?`,
      args: [id],
    })
    for (const pb of parentBundles) {
      cacheIdentifiers.push(String(pb.id))
      if (pb.slug) cacheIdentifiers.push(String(pb.slug))
    }

    purgeStorefrontCache(cacheIdentifiers)
    try {
      revalidatePath('/admin')
      revalidatePath('/admin/productos')
    } catch {
      // No bloquear respuesta
    }

    return NextResponse.json({ product: { id, slug, ...productData } })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      {
        error: 'Failed to update product',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar o archivar producto con validación Zod v4
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const parsed = adminProductDeleteSchema.safeParse({
      id: searchParams.get('id') || '',
      permanent: (searchParams.get('permanent') as 'true' | 'false' | null) || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Parámetros inválidos' },
        { status: 400 }
      )
    }

    const { id } = parsed.data
    const permanent = parsed.data.permanent === 'true'

    const { rows: existing } = await turso.execute({
      sql: 'SELECT slug FROM products WHERE id = ? LIMIT 1',
      args: [id],
    })
    const slug = existing[0]?.slug ? String(existing[0].slug) : ''

    if (permanent) {
      await turso.batch(
        [
          {
            sql: 'DELETE FROM bundle_items WHERE bundle_id = ? OR product_id = ?',
            args: [id, id],
          },
          {
            sql: 'DELETE FROM products WHERE id = ?',
            args: [id],
          },
        ],
        'write'
      )
    } else {
      await turso.execute({
        sql: 'UPDATE products SET deleted_at = CURRENT_TIMESTAMP, stock = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [id],
      })
    }

    purgeStorefrontCache([id, slug])
    try {
      revalidatePath('/admin')
      revalidatePath('/admin/productos')
    } catch {
      // No bloquear respuesta
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete product',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}
