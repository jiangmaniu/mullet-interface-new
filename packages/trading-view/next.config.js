const BASE_PATH = process.env.BASE_PATH || ''
const PLATFORM = process.env.PLATFORM // 平台 cdex mc cc

// 区分不同k线请求历史数据地址
const getOrigin = () => {
  return {
    cdex: 'mt.cd-ex.com',
    mc: 'traderview.mctzglobals.com',
    cc: 'wap.gwcdf.com',
    mullet: 'client.stellux.io'
  }[PLATFORM]
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // https://nextjs.org/docs/pages/api-reference/next-config-js/runtime-configuration
  // 注入server、client公用的环境变量，通过const { publicRuntimeConfig } = getConfig()访问
  publicRuntimeConfig: {
    BASE_PATH,
    PLATFORM
  },
  reactStrictMode: false,
  trailingSlash: true,
  // 导出目录
  distDir: 'dist',
  // 配置跨域代理
  async rewrites() {
    return {
      fallback: [
        // 获取k线历史数据接口转发
        {
          source: '/kline/:path*',
          destination: `https://${getOrigin()}/kline/:path*`
        }
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
}

module.exports = nextConfig
