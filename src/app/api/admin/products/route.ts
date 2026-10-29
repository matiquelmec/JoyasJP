import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { generateSlug } from '@/lib/slug-utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener todos los productos con stock de bundles resuelto
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await turso.execute('SELECT * FROM products ORDER BY id DESC')
    const { rows: bundleItems } = await turso.execute('SELECT * FROM bundle_items')

    // Mapa de stock físico de componentes
    const stockMap = new Map<string, number>()
    rows.forEach(r => {
      stockMap.set(String(r.id), Number(r.stock || 0))
    })

    const products = rows.map(r => {
      const is_bundle = Boolean(r.is_bundle === 1 || r.is_bundle === '1')
      const components = is_bundle
        ? bundleItems
            .filter(item => item.bundle_id === r.id)
            .map(item => ({
              product_id: item.product_id,
              quantity: Number(item.quantity || 1),
            }))
        : []

      // Si es un bundle, calcular el stock físico real disponible en base a sus componentes
      let calculatedStock = Number(r.stock || 0)
      if (is_bundle) {
        if (components.length === 0) {
          calculatedStock = 0
        } else {
          const maxBundles = components.map(c => {
            const compStock = stockMap.get(String(c.product_id)) || 0
            return Math.floor(compStock / c.quantity)
          })
          calculatedStock = Math.min(...maxBundles)
        }
      }

      return {
        ...r,
        stock: calculatedStock,
        is_priority: Boolean(r.is_priority === 1 || r.is_priority === '1'),
        is_bundle,
        components,
        gallery: typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery || [],
        variants: typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants || [],
        specifications:
          typeof r.specifications === 'string'
            ? JSON.parse(r.specifications)
            : r.specifications || [],
        seo: typeof r.seo === 'string' ? JSON.parse(r.seo) : r.seo || {},
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

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const productData = await request.json()
    const productId = crypto.randomUUID()
    const { code, components, ...productDataWithoutCode } = productData
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

    let slug =
      productDataWithoutCode.slug || generateSlug(productDataWithoutCode.name || '')

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
        : null)

    const tx = await turso.transaction('write')
    try {
      await tx.execute({
        sql: `INSERT INTO products (
          id, name, price, imageUrl, category, dimensions, materials, color, stock, detail, description, specifications, gallery, variants, sku, seo, image_hint, is_priority, is_bundle, slug, discount_price, custom_label
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          productId,
          (productDataWithoutCode.name || '').trim(),
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
          productDataWithoutCode.discount_price
            ? Number(productDataWithoutCode.discount_price)
            : null,
          productDataWithoutCode.custom_label || null,
        ],
      })

      if (is_bundle === 1 && Array.isArray(components)) {
        for (const comp of components) {
          if (comp.product_id) {
            await tx.execute({
              sql: 'INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)',
              args: [productId, comp.product_id, Number(comp.quantity || 1)],
            })
          }
        }
      }

      await tx.commit()
    } catch (txErr) {
      await tx.rollback()
      throw txErr
    }

    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout')
      revalidatePath('/productos')
      revalidatePath(`/productos/${productId}`)
      revalidatePath(`/productos/${slug}`)
      revalidatePath('/')
    } catch (revalidateError) {
      console.warn('Revalidation failed for product:', productId, revalidateError)
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

// PUT - Actualizar producto
export async function PUT(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, code, components, ...productData } = await request.json()

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

    const tx = await turso.transaction('write')
    try {
      await tx.execute({
        sql: `UPDATE products SET 
          name = ?, price = ?, imageUrl = ?, category = ?, dimensions = ?, materials = ?, color = ?, stock = ?, detail = ?, description = ?, specifications = ?, gallery = ?, variants = ?, sku = ?, seo = ?, image_hint = ?, is_priority = ?, is_bundle = ?, slug = ?, discount_price = ?, custom_label = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        args: [
          (productData.name || '').trim(),
          Number(productData.price),
          productData.imageUrl,
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
          productData.sku || null,
          seo,
          productData.image_hint || null,
          is_priority,
          is_bundle,
          slug,
          productData.discount_price ? Number(productData.discount_price) : null,
          productData.custom_label || null,
          id,
        ],
      })

      await tx.execute({
        sql: 'DELETE FROM bundle_items WHERE bundle_id = ?',
        args: [id],
      })

      if (is_bundle === 1 && Array.isArray(components)) {
        for (const comp of components) {
          if (comp.product_id) {
            await tx.execute({
              sql: 'INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)',
              args: [id, comp.product_id, Number(comp.quantity || 1)],
            })
          }
        }
      }

      await tx.commit()
    } catch (txErr) {
      await tx.rollback()
      throw txErr
    }

    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout')
      revalidatePath(`/productos/${id}`)
      revalidatePath(`/productos/${slug}`)
      revalidatePath('/productos')
    } catch (revalidateError) {
      console.warn('Revalidation failed for product:', id, revalidateError)
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

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
    }

    if (permanent) {
      await turso.execute({
        sql: 'DELETE FROM products WHERE id = ?',
        args: [id],
      })
    } else {
      await turso.execute({
        sql: 'UPDATE products SET deleted_at = CURRENT_TIMESTAMP, stock = 0 WHERE id = ?',
        args: [id],
      })
    }

    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'layout')
      revalidatePath('/')
      revalidatePath('/productos')
      revalidatePath(`/productos/${id}`)
    } catch (revalidateError) {
      console.warn('⚠️ Revalidation failed after DELETE for product:', id, revalidateError)
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
