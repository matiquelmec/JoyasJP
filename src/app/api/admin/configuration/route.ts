import { NextRequest, NextResponse } from 'next/server'
import { turso } from '@/lib/db/turso'
import { siteConfig } from '@/lib/config'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { adminConfigurationSchema } from '@/lib/validations/admin'
import { purgeStorefrontCache } from '@/services/order.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Obtener configuración de la tienda
export async function GET(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await turso.execute('SELECT * FROM configuration LIMIT 1')

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        configuration: {
          store_name: siteConfig.name,
          store_email: siteConfig.business.contact.email,
          store_description: siteConfig.description,
          instagram_url: siteConfig.links.instagram,
          tiktok_url: siteConfig.links.tiktok,
          whatsapp_number: siteConfig.business.contact.whatsapp,
          shipping_cost: 3000,
          free_shipping_from: 50000,
          shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
          admin_email: siteConfig.business.contact.email,
          notify_new_orders: true,
          notify_low_stock: true,
          notify_new_customers: false,
        },
      })
    }

    const row = rows[0] as Record<string, unknown>
    return NextResponse.json({
      configuration: {
        ...row,
        whatsapp_number: row.whatsapp_number || siteConfig.business.contact.whatsapp,
      },
    })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch configuration',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración validada con Zod v4
export async function POST(request: NextRequest) {
  if (!(await verifyAdminAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const parsed = adminConfigurationSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || 'Datos de configuración inválidos',
          issues: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const configData = parsed.data
    const whatsappCanonical =
      configData.whatsapp_number?.trim() || siteConfig.business.contact.whatsapp

    const { rows } = await turso.execute('SELECT id FROM configuration WHERE id = 1')
    const exists = rows && rows.length > 0

    if (exists) {
      await turso.execute({
        sql: `UPDATE configuration SET 
          store_name = ?, store_email = ?, store_description = ?, instagram_url = ?, tiktok_url = ?, whatsapp_number = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = 1`,
        args: [
          configData.store_name,
          configData.store_email || null,
          configData.store_description || null,
          configData.instagram_url || null,
          configData.tiktok_url || null,
          whatsappCanonical,
        ],
      })
    } else {
      await turso.execute({
        sql: `INSERT INTO configuration (
          id, store_name, store_email, store_description, instagram_url, tiktok_url, whatsapp_number
        ) VALUES (1, ?, ?, ?, ?, ?, ?)`,
        args: [
          configData.store_name,
          configData.store_email || null,
          configData.store_description || null,
          configData.instagram_url || null,
          configData.tiktok_url || null,
          whatsappCanonical,
        ],
      })
    }

    const updated = await turso.execute('SELECT * FROM configuration WHERE id = 1')
    purgeStorefrontCache()

    return NextResponse.json({ configuration: updated.rows[0] })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json(
      {
        error: 'Failed to update configuration',
        details: (error as Error).message || String(error),
      },
      { status: 500 }
    )
  }
}
