import type { NextConfig } from 'next'
import nextra from 'nextra'

const withNextra = nextra({})

const nextConfig: NextConfig = withNextra({
  eslint: {
    ignoreDuringBuilds: true,
  },
})

export default nextConfig
