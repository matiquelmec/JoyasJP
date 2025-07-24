/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICO: Static export para Netlify
  output: 'export',
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
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
  }
}

module.exports = nextConfig
