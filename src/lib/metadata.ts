import { supabase } from '@/lib/supabase-client'
import { siteConfig } from '@/lib/config'

export async function getConfiguredMetadata() {
  try {
    // Try to get configuration from database
    const { data, error } = await supabase
      .from('configuration')
      .select('store_name, store_description, store_email')
      .single()

    if (error) {
      // Return default configuration if database config doesn't exist
      return {
        storeName: siteConfig.name,
        storeDescription: siteConfig.description,
        storeEmail: siteConfig.business.contact.email,
      }
    }

    return {
      storeName: data.store_name || siteConfig.name,
      storeDescription: data.store_description || siteConfig.description, 
      storeEmail: data.store_email || siteConfig.business.contact.email,
    }
  } catch (error) {
    // Fallback to default configuration
    return {
      storeName: siteConfig.name,
      storeDescription: siteConfig.description,
      storeEmail: siteConfig.business.contact.email,
    }
  }
}