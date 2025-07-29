/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  // Forzar recarga de assets cacheados cambiando buildId
  generateBuildId: async () => {
    return 'clean-build-' + Date.now()
  },
  
  // Compresión optimizada
  compress: true,
  
  // Minificación optimizada (swcMinify removido en Next.js 15)
  poweredByHeader: false,
  
  // Optimización de build
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs'
    ],
  },
  
  
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: false,
    // Tamaños optimizados para dispositivos específicos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache más agresivo para imágenes optimizadas
    minimumCacheTTL: 86400, // 24 horas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lrsmmfpsbawznjpnllwr.supabase.co',
        pathname: '/storage/v1/object/public/joyas-jp-ecommerce/**',
      },
    ],
  },

  // Enterprise-level headers for advanced caching
  async headers() {
    return [
      // Static assets (images, fonts, etc.)
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      // Critical images (logo, hero)
      {
        source: '/assets/(logo|hero-poster|nosotros).webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, s-maxage=2592000, immutable', // 30 days
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Priority',
            value: 'high',
          },
        ],
      },
      // Product images with smart caching
      {
        source: '/assets/Products/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=259200', // 7 days, stale 3 days
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding, Accept',
          },
        ],
      },
      // Service Worker
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // API routes with smart caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // HTML pages with dynamic content
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configuracion de trailing slash
  trailingSlash: true,
  
  // ESLint configuration
  
  webpack: (config) => {
    config.resolve.alias['@/hooks'] = path.resolve(__dirname, 'src/hooks');
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'src/components');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    
    // Chunk splitting simplificado para evitar problemas de build
    if (config.optimization?.splitChunks) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig
