import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
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
}

export default nextConfig
