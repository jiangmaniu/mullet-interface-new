import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * 暂时使用 webbpack 打包， @privy-io/react-auth 在 turbopack 下无法正常打包的问题。
   * @link https://github.com/vercel/next.js/issues/87342
   * @link https://github.com/vercel/next.js/issues/86099#issuecomment-3630980322
   * 当 @privy-io/react-auth 问题解决时使用 trubopack
   */
  webpack: (config) => {
    // 忽略 @lingui 相关的动态依赖警告
    config.ignoreWarnings = [{ module: /node_modules\/cosmiconfig/ }, { module: /node_modules\/jiti/ }]

    config.module.rules.push({
      test: /\.svg$/,
      use: {
        loader: '@svgr/webpack',
      },
    })
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader',
      },
    })
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

      ignore: ['**/*.test.ts', '**/*.test.js', '**/test/**'],
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
