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
      '@radix-ui/react-accordion',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-toast',
    ],
    serverComponentsExternalPackages: ['sharp'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Configuración de imágenes optimizada (Cloudinary CDN)
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    formats: ['image/webp', 'image/avif'],
  },

  compiler: {
    removeConsole: false,
  },

  swcMinify: true,

  // ⚡ WEBPACK OPTIMIZATIONS
  webpack: (config, { dev }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')

    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          admin: {
            name: 'admin',
            chunks: 'all',
            test: /[\\/]src[\\/]app[\\/]admin/,
            priority: 10,
            enforce: true,
          },
          mercadopago: {
            name: 'mercadopago',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@mercadopago/,
            priority: 15,
            enforce: true,
          },
          radix: {
            name: 'radix-ui',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]@radix-ui/,
            priority: 12,
            enforce: true,
            minSize: 0,
            maxSize: 50000,
          },
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 5,
          },
        },
      }
    }

    return config
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.cl',
  },

  // ⚡ Headers de seguridad y cacheo avanzado
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.mercadopago.com https://http2.mlstatic.com https://www.googletagmanager.com https://connect.facebook.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: res.cloudinary.com https://http2.mlstatic.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss: *.turso.io https://api.mercadopago.com",
              "frame-src 'self' https://sdk.mercadopago.com https://www.mercadopago.cl",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/assets/logo.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
      {
        source: '/assets/(.*).webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/assets/mi-video(.*).mp4',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
