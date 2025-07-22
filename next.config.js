/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
  },
  compiler: {
    // Habilitar styledComponents si lo estás usando
    // styledComponents: true,
    // Deshabilitar la eliminación de console.log en desarrollo para depuración
    removeConsole: false,
  },
};

module.exports = nextConfig;
