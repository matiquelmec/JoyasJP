import { turso } from '@/lib/db/turso'
import { siteConfig } from '@/lib/config'

export async function getConfiguredMetadata() {
  try {
    const { rows } = await turso.execute("SELECT store_name, store_description, store_email FROM configuration LIMIT 1")
    
    if (rows.length === 0) {
      return {
        storeName: siteConfig.name,
        storeDescription: siteConfig.description,
        storeEmail: siteConfig.business.contact.email,
      }
    }

    const data = rows[0] as any

    return {
      storeName: data.store_name || siteConfig.name,
      storeDescription: data.store_description || siteConfig.description, 
      storeEmail: data.store_email || siteConfig.business.contact.email,
    }
  } catch (error) {
    return {
      storeName: siteConfig.name,
      storeDescription: siteConfig.description,
      storeEmail: siteConfig.business.contact.email,
    }
  }
}