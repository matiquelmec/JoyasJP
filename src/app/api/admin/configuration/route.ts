import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { turso } from '@/lib/db/turso'
import { siteConfig } from '@/lib/config'
import { verifyAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// GET - Obtener configuración
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { rows } = await turso.execute("SELECT * FROM configuration LIMIT 1")

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        configuration: {
          store_name: siteConfig.name,
          store_email: siteConfig.business.contact.email,
          store_description: siteConfig.description,
          shipping_cost: 3000,
          free_shipping_from: 50000,
          shipping_zones: siteConfig.ecommerce.shippingZones.join(', '),
          admin_email: siteConfig.business.contact.email,
          notify_new_orders: true,
          notify_low_stock: true,
          notify_new_customers: false,
          mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '',
          mercadopago_access_token: process.env.MP_ACCESS_TOKEN || ''
        }
      })
    }

    return NextResponse.json({ configuration: rows[0] })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json({
      error: 'Failed to fetch configuration',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}

// POST - Actualizar configuración
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const configData = await request.json()

    // Check if configuration exists (id = 1)
    const { rows } = await turso.execute("SELECT id FROM configuration WHERE id = 1")
    const exists = rows && rows.length > 0

    if (exists) {
      await turso.execute({
        sql: `UPDATE configuration SET 
          store_name = ?, store_email = ?, store_description = ?, instagram_url = ?, tiktok_url = ?, whatsapp_number = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = 1`,
        args: [
          configData.store_name || null,
          configData.store_email || null,
          configData.store_description || null,
          configData.instagram_url || null,
          configData.tiktok_url || null,
          configData.whatsapp_number || null
        ]
      })
    } else {
      await turso.execute({
        sql: `INSERT INTO configuration (
          id, store_name, store_email, store_description, instagram_url, tiktok_url, whatsapp_number
        ) VALUES (1, ?, ?, ?, ?, ?, ?)`,
        args: [
          configData.store_name || null,
          configData.store_email || null,
          configData.store_description || null,
          configData.instagram_url || null,
          configData.tiktok_url || null,
          configData.whatsapp_number || null
        ]
      })
    }

    // Obtener la configuración actualizada
    const updated = await turso.execute("SELECT * FROM configuration WHERE id = 1")

    // Purge cache
    try {
      revalidatePath('/', 'layout')
    } catch (e) {
      console.warn('Revalidation failed for configuration:', e)
    }

    return NextResponse.json({ configuration: updated.rows[0] })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json({
      error: 'Failed to update configuration',
      details: (error as Error).message || String(error)
    }, { status: 500 })
  }
}