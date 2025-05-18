/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Acepta cualquier hostname
      },
      {
        protocol: 'http',
        hostname: '**', // Acepta cualquier hostname
      }
    ],
  },
}

export default nextConfig
