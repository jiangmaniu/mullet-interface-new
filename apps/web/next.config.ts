import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack 配置（仅在非 Turbopack 模式下使用）
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.globalObject = 'self'
    }
    return config
  },

  // Turbopack 配置
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      '*.po': {
        loaders: ['@lingui/loader'],
        as: '*.js',
      },
    },
  },

  experimental: {
    swcPlugins: [['@lingui/swc-plugin', {}]],
  },

  // 图片域名配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'file-test.mullet.top',
      },
    ],
  },

  // API 代理配置
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!apiBaseUrl) {
      console.warn('NEXT_PUBLIC_API_BASE_URL is not set, API rewrites will be disabled')
      return []
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
