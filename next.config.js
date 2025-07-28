/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  // Forzar recarga de assets cacheados cambiando buildId
  generateBuildId: async () => {
    return 'clean-build-' + Date.now()
  },
  
  // Compresión optimizada
  compress: true,
  
  // Minificación optimizada
  swcMinify: true,
  poweredByHeader: false,
  
  // Optimización de build
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // 1 hora de cache
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lrsmmfpsbawznjpnllwr.supabase.co',
        pathname: '/storage/v1/object/public/joyas-jp-ecommerce/**',
      },
    ],
    loader: 'default',
    loaderFile: '',
  },
  
  // Configuracion de trailing slash
  trailingSlash: true,
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true
  },
  webpack: (config) => {
    config.resolve.alias['@/hooks'] = path.resolve(__dirname, 'src/hooks');
    config.resolve.alias['@/components'] = path.resolve(__dirname, 'src/components');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'src/lib');
    return config;
  },
}

module.exports = nextConfig
