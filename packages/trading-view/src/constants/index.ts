import getConfig from 'next/config'

// 可以在服务端和客户端使用，需要在nextjs.config.js中配置publicRuntimeConfig
const { publicRuntimeConfig } = getConfig()

export const KEY_TRADINGVIEW_CHART_PROPS = 'tradingview.chartproperties'

export const PLATFORM = 'mullet' as const
export const BASE_PATH = publicRuntimeConfig.BASE_PATH
export const isProd = process.env.NODE_ENV === 'production'

// mullet平台 websocket 地址
export const WEBSOCKET_URLS = ['wss://websocket.stellux.io/websocketServer']
