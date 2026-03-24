import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/:path*`,
      },
      {
        source: '/api-docs',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/api-docs`,
      },
      {
        source: '/admin_pages/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/admin_pages/:path*`,
      },
      {
        source: '/participant_pages/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/participant_pages/:path*`,
      },
      {
        source: '/public/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/public/:path*`,
      },
    ]
  },
}

export default nextConfig
