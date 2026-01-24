import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.cl'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/checkout/success/',
        '/checkout/failure/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}