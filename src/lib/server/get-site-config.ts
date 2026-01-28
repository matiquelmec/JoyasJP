import { supabase } from '@/lib/supabase-client'
import { siteConfig } from '@/lib/config'
import type { SiteConfiguration } from '@/lib/types'

/**
 * Fetches the site configuration from the database server-side.
 * This should be used in Server Components (like RootLayout) to hydrate the client state.
 */
export async function getSiteConfig(): Promise<SiteConfiguration> {
    try {
        const { data, error } = await supabase
            .from('configuration')
            .select('*')
            .maybeSingle()

        if (error) {
            // console.warn('Error fetching config server-side:', error.message)
            throw error
        }

        if (!data) {
            throw new Error('No configuration found')
        }

        // Filter out sensitive data and mix with static config for legacy fields
        return {
            store_name: data.store_name,
            store_email: data.store_email,
            store_description: data.store_description,
            shipping_cost: 3000, // Hardcoded in API route
            free_shipping_from: 50000,
            shipping_zones: [...siteConfig.ecommerce.shippingZones],
            admin_email: siteConfig.business.contact.email, // Legacy
            notify_new_orders: true,
            notify_low_stock: true,
            mercadopago_public_key: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '',
            mercadopago_access_token: '', // Never expose access token
            instagram_url: data.instagram_url,
            tiktok_url: data.tiktok_url,
            store_slogan: data.store_slogan,
            whatsapp_number: data.whatsapp_number,
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
