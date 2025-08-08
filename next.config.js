const path = require('node:path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración híbrida para Netlify con ISR
  output: 'standalone',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,

  // ✅ CONFIGURACIÓN SEGURA PARA PRODUCCIÓN
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
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
    serverComponentsExternalPackages: ['sharp'],
    // Optimización adicional para performance
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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

  // ⚡ Headers de performance y cacheo avanzado
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
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
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
      },
      // Cache API responses
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ],
      },
      // Cache para assets estáticos (imágenes no críticas)
      {
        source: '/assets/nosotros.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800'
          }
        ],
      },
      // Cache más agresivo para logo (cambia raramente)
      {
        source: '/assets/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000'
          }
        ],
      },
      // Cache corto para videos (para ver cambios rápidamente)
      {
        source: '/assets/mi-video(.*).mp4',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          }
        ],
      },
    ]
  }
}

module.exports = nextConfig