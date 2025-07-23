const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Netlify

  // Configuración de imágenes optimizada
  images: {
    unoptimized: true, // Necesario para export estático
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
    // Configuración para imágenes locales
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },

  compiler: {
    // Habilitar styledComponents si lo estás usando
    // styledComponents: true,
    // Deshabilitar la eliminación de console.log en desarrollo para depuración
    removeConsole: false,
  },

  // Optimización de build
  swcMinify: true,

  // Configuración para assets estáticos
  assetPrefix: '',

  // Webpack config personalizado
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    // Configuración para manejar archivos estáticos
    config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg|webp)$/i,
      exclude: /favicon\.ico$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/images/',
          outputPath: 'static/images/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    // Configuración para videos
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|swf|ogv)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos/',
          outputPath: 'static/videos/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://joyasjp.netlify.app',
  },

  // Optimizaciones adicionales
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
};

module.exports = nextConfig;
