import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase-client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.cl'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/favoritos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/carrito`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Get dynamic product pages
  let productPages: MetadataRoute.Sitemap = []

  if (supabase) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })

      if (!error && products) {
        productPages = products.map((product: any) => ({
          url: `${baseUrl}/productos/${product.id}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    } catch (error) {
      // console.error('Error generating sitemap for products:', error)
    }
  }

  return [...staticPages, ...productPages]
}