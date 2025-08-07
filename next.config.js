const path = require('node:path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración híbrida para Netlify con ISR
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // 🚨 CONFIGURACIÓN TEMPORAL PARA LANZAMIENTO RÁPIDO
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🚀 OPTIMIZACIÓN CRÍTICA: Bundle Splitting
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-accordion'
    ],
    serverComponentsExternalPackages: ['sharp']
  },

  // Configuración de imágenes optimizada
  images: {
    unoptimized: false, // ⚡ CAMBIO: Habilitar optimización de imágenes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lrsmmfpsbawznjpnllwr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    // ⚡ Configuración para Supabase Images
    domains: ['lrsmmfpsbawznjpnllwr.supabase.co'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimización de build
  swcMinify: true,

  // ⚡ WEBPACK OPTIMIZATIONS
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')

    // Solo en producción
    if (!dev) {
      // Separar MercadoPago en chunk separado
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Admin bundle separado
          admin: {
            name: 'admin',
            chunks: 'all',
            test: /[\\/]src[\\/]app[\\/]admin/,
            priority: 10,
            enforce: true
          },
          // MercadoPago separado
          mercadopago: {
            name: 'mercadopago',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@mercadopago/,
            priority: 15,
            enforce: true
          },
          // Radix UI separado
          radix: {
            name: 'radix-ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@radix-ui/,
            priority: 12,
            enforce: true
          },
          // Vendor chunk para otras librerías
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 5
          }
        }
      }
    }

    // Next.js maneja automáticamente los assets estáticos

    return config
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.netlify.app',
  },

  // ⚡ Headers de performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ]
  }
}

module.exports = nextConfig