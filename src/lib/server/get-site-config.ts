import { turso } from '@/lib/db/turso'
import { siteConfig } from '@/lib/config'
import type { SiteConfiguration } from '@/lib/types'

/**
 * Fetches the site configuration from the database server-side.
 * This should be used in Server Components (like RootLayout) to hydrate the client state.
 */
export async function getSiteConfig(): Promise<SiteConfiguration> {
    try {
        const { rows } = await turso.execute("SELECT * FROM configuration LIMIT 1")
        
        if (rows.length === 0) {
            throw new Error('No configuration found')
        }

        const data = rows[0] as any

        // Filter out sensitive data and mix with static config for legacy fields
        return {
            store_name: data.store_name || siteConfig.name,
            store_email: data.store_email || siteConfig.business.contact.email,
            store_description: data.store_description || siteConfig.description,
            shipping_cost: 3000, // Hardcoded in API route
            free_shipping_from: 50000,
            shipping_zones: [...siteConfig.ecommerce.shippingZones],
            admin_email: siteConfig.business.contact.email, // Legacy
            notify_new_orders: true,
            notify_low_stock: true,
            mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '',
            mercadopago_access_token: '', // Never expose access token
            instagram_url: data.instagram_url || siteConfig.links.instagram,
            tiktok_url: data.tiktok_url || siteConfig.links.tiktok,
            store_slogan: 'Atrévete a jugar',
            whatsapp_number: data.whatsapp_number || siteConfig.business.contact.phone,
        }
    } catch (error) {
        // Return safe default configuration on error
        return {
            store_name: siteConfig.name,
            store_email: siteConfig.business.contact.email,
            store_description: siteConfig.description,
            shipping_cost: 3000,
            free_shipping_from: 50000,
            shipping_zones: [...siteConfig.ecommerce.shippingZones],
            admin_email: siteConfig.business.contact.email,
            notify_new_orders: true,
            notify_low_stock: true,
            mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '',
            mercadopago_access_token: '',
            instagram_url: siteConfig.links.instagram,
            tiktok_url: siteConfig.links.tiktok,
            store_slogan: 'Atrévete a jugar',
            whatsapp_number: siteConfig.business.contact.phone
        }
    }
}
