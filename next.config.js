/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lrsmmfpsbawznjpnllwr.supabase.co',
        pathname: '/storage/v1/object/public/joyas-jp-ecommerce/**',
      },
    ],
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
