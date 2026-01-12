/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.netlify.app',
  generateRobotsTxt: true,
  exclude: ['/admin*', '/api*'], // Excluir rutas de admin y API
  generateIndexSitemap: false, // Para sitios con menos de 50k URLs
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Configuración personalizada por tipo de página
    let priority = 0.7
    let changefreq = 'weekly'

    // Página principal - máxima prioridad
    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    }
    // Páginas de productos - alta prioridad
    else if (path.includes('/productos/') && !path.includes('/productos/success') && !path.includes('/productos/failure')) {
      priority = 0.9
      changefreq = 'weekly'
    }
    // Páginas principales
    else if (['/productos', '/nosotros', '/contacto', '/servicios'].includes(path)) {
      priority = 0.8
      changefreq = 'weekly'
    }
    // Páginas secundarias
    else if (['/favoritos', '/checkout'].includes(path)) {
      priority = 0.6
      changefreq = 'monthly'
    }
    // Páginas de resultado de pago - baja prioridad
    else if (path.includes('/success') || path.includes('/failure') || path.includes('/pending')) {
      priority = 0.3
      changefreq = 'never'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/_next', '/shop/success', '/shop/failure', '/shop/pending']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api', '/_next', '/shop/success', '/shop/failure', '/shop/pending']
      }
    ],
    additionalSitemaps: []
  }
}