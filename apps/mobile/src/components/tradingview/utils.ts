import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Constants from 'expo-constants'
import { Base64 } from 'js-base64'

import { LOCALE_ZH_CN } from '@/locales/i18n'
import { Config } from '@/v1/platform/config'

export interface SymbolInfo {
  symbol: string
  alias: string
  symbolGroupId: number
  dataSourceCode: string
  dataSourceSymbol: string
  accountGroupId: number
  symbolDecimal: number
  classify: string
  imgUrl: string
  remark: string
}

// ─── 常量 ──────────────────────────────────────────────────────────────

export const RELOAD_THRESHOLD = 5 * 60 * 1000
export const authorization = `Basic ${Base64.encode(`${Config.CLIENT_ID}:${Config.CLIENT_SECRET}`)}`

// ─── 工具函数 ──────────────────────────────────────────────────────────

/** iOS Bundle 内 tradingview 目录路径 */
const IOS_TV_DIR = Platform.OS === 'ios' ? `${RNFS.MainBundlePath}/tradingview` : ''

export function getAllowingReadAccessToURL(): string | undefined {
  if (Platform.OS !== 'ios' || __DEV__) return undefined
  return `file://${IOS_TV_DIR}`
}

export function getSourceUri(query?: Record<string, string>): string {
  let base: string

  if (__DEV__) {
    // 开发环境：走 Metro 中间件，确保始终加载最新构建产物
    const debuggerHost = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri ?? 'localhost:8081'
    const [ip, port] = debuggerHost.split(':')
    base = `http://${ip}:${port}/tradingview/index.html`
  } else if (Platform.OS === 'android') {
    base = 'file:///android_asset/tradingview/index.html'
  } else {
    base = `file://${IOS_TV_DIR}/index.html`
  }

  if (query && Object.keys(query).length > 0) {
    const qs = Object.entries(query)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return `${base}?${qs}`
  }
  return base
}

export function getTradingviewLocale(appLocale: string): string {
  switch (appLocale) {
    case LOCALE_ZH_CN:
      return 'zh'
    default:
      return 'en'
  }
}

export function buildSymbolInfo(
  symbolItem: Account.TradeSymbolListItem,
  accountGroupId: number,
  imgDomain: string,
): SymbolInfo {
  return {
    symbol: symbolItem.symbol,
    alias: symbolItem.alias ?? '',
    symbolGroupId: symbolItem.symbolGroupId ?? 0,
    dataSourceCode: symbolItem.dataSourceCode ?? '',
    dataSourceSymbol: symbolItem.dataSourceSymbol ?? '',
    accountGroupId,
    symbolDecimal: symbolItem.symbolDecimal ?? 2,
    classify: symbolItem.classify ?? '',
    imgUrl: symbolItem.imgUrl ? `${imgDomain}${symbolItem.imgUrl}` : '',
    remark: symbolItem.remark ?? '',
  }
}
