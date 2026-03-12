const BASE_PATH = process.env.BASE_PATH || ''
const KLINE_API_BASE = process.env.KLINE_API_BASE || 'https://mt.cd-ex.io'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 转译 workspace 包
  transpilePackages: ['@mullet/utils'],
  // https://nextjs.org/docs/pages/api-reference/next-config-js/runtime-configuration
  // 注入server、client公用的环境变量，通过const { publicRuntimeConfig } = getConfig()访问
  publicRuntimeConfig: { BASE_PATH, PLATFORM: 'mullet', KLINE_API_BASE },
  reactStrictMode: false,
  trailingSlash: true,
  // 导出目录
  distDir: 'dist',
  // 配置跨域代理
  async rewrites() {
    return {
      fallback: [
        // 获取k线历史数据接口转发
        { source: '/kline/:path*', destination: 'https://client.stellux.io/kline/:path*' }
      ]
    }
  }
}

if (BASE_PATH) {
  // 指定项目的根路径
  nextConfig.basePath = BASE_PATH
  // 指定静态资源的路径
  nextConfig.assetPrefix = BASE_PATH
}

if (process.env.NODE_ENV === 'production') {
  // 启用静态导出
  nextConfig.output = 'export'
  // 未指定 BASE_PATH 时使用相对路径，确保在 WebView 等非根路径环境下资源可正常加载
  if (!BASE_PATH) {
    nextConfig.assetPrefix = '.'
  }
}

module.exports = nextConfig
