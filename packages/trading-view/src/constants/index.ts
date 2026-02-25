import getConfig from 'next/config'

// 可以在服务端和客户端使用，需要在nextjs.config.js中配置publicRuntimeConfig
const { publicRuntimeConfig } = getConfig()

export const KEY_TRADINGVIEW_CHART_PROPS = 'tradingview.chartproperties'

type platform = 'cdex' | 'mc' | 'cc'
export const PLATFORM: platform = publicRuntimeConfig.PLATFORM || 'cdex'
export const BASE_PATH = publicRuntimeConfig.BASE_PATH
export const isProd = process.env.NODE_ENV === 'production'

// 默认的ws地址，根据平台区分websocket地址
export const WEBSOCKET_URLS = {
  // 跟部署的域名保持一致，通过/wsurl代理即可
  // cdex: ['wss://tradeapi-cdex.appcdex.com/api/bbtc/noauth/websocks/mt5sock'], // 这个是官网使用的数据源，同www.cd-ex.com官网保持一致
  // cdex: ['wss://tradeapi-cdex-lc.wanliangfan.asia/api/all/noauth/websocks/mt5SockBin'], // 二进制
  cdex: [
    'wss://tradeapi-lc-sh.poejdc.com/api/all/noauth/websocks/mt5SockBin',
    'wss://tradeapi-l-cc.beewd.com/api/all/noauth/websocks/mt5SockBin',
    'wss://tradeapi-lc-sh.poejdc.com/api/all/auth/websocks/mt5SockBin',
    'wss://tradeapi-l-cc.beewd.com/api/all/auth/websocks/mt5SockBin',
    'wss://tradeapi-cc-dl.poejdc.com/api/all/noauth/websocks/mt5SockBin',
    'wss://tradeapi-cc-dl.poejdc.com/api/all/auth/websocks/mt5SockBin'
  ], // 二进制
  //   cdex: [
  //     'wss://tradeapi-cc-dl.anqingduofu.top/api/all/noauth/websocks/mt5SockBin',
  //     'wss://tradeapi-cc-dl.poejdc.com/api/all/noauth/websocks/mt5SockBin',
  //     'wss://tradeapi-cc-dl.anqingduofu.top/api/all/auth/websocks/mt5SockBin',
  //     'wss://tradeapi-cc-dl.poejdc.com/api/all/auth/websocks/mt5SockBin'
  //   ], // 二进制
  // mc项目的从配置文件获取地址 mc项目的旧版本k线地址 https://traderview.mctzglobals.com/klinechart/#/?name=BTCUSDT
  mc: [
    'wss://tradeapi1-hk.jututb6655.com:4434/trade',
    'wss://tradeapi-jf-mc1.mktep555.com:4434/trade',
    'wss://tradeapi-jf-mc2.mcapp188.com:4434/trade',
    'wss://tradeapi-jf-mc4.mcapp188.com:4434/trade',
    'wss://tradeapi-jf-mc3.djueap.com:4434/trade'
  ],
  // 暂时写死
  cc: ['wss://tradeapi-cc.gwskfs.com/api/gw/noauth/websocks/mt5sock', 'wss://tradeapi-cc.beewd.com/api/gw/noauth/websocks/mt5sock']
}[PLATFORM]
