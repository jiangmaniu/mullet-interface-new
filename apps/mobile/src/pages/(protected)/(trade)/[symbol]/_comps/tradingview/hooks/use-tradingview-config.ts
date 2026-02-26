import { useEffect, useMemo, useState } from 'react'
import type { IEnv } from '@/v1/env'

import { i18n } from '@/locales/i18n'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { getEnv } from '@/v1/env'
import { useStores } from '@/v1/provider/mobxProvider'
import { STORAGE_GET_TOKEN } from '@/v1/utils/storage'

import { authorization, buildSymbolInfo, getTradingviewLocale } from '../utils'

// ─── Mock 品种信息 ──────────────────────────────────────────────────
const MOCK_SYMBOL = {
  symbol: 'XAUUSD',
  alias: '黄金',
  symbolGroupId: 1,
  dataSourceCode: 'FXOPEN',
  dataSourceSymbol: 'XAUUSD',
  accountGroupId: 1,
  symbolDecimal: 2,
  classify: 'COMMODITIES',
  imgUrl: '',
  remark: '',
}

// ============ 模拟数据 ============
export function useTradingviewConfig() {
  const [env, setEnv] = useState<IEnv | null>(null)
  const [token, setToken] = useState('')

  const locale = i18n.locale
  const tvLocale = getTradingviewLocale(locale)
  const symbolName = MOCK_SYMBOL.symbol
  const accountGroupId = MOCK_SYMBOL.accountGroupId

  useEffect(() => {
    getEnv().then(setEnv)
    STORAGE_GET_TOKEN().then((t: string) => setToken(t || 'mock-token'))
  }, [])

  const colorScheme = useTradeSettingsStore((s) => s.colorScheme)
  const colorType = colorScheme === 'green-up' ? '1' : '2'

  const urlQuery = useMemo<Record<string, string>>(
    () => ({
      name: symbolName,
      lang: tvLocale,
      theme: 'dark',
      colorType,
    }),
    [symbolName, tvLocale, colorType],
  )

  const injectedJS = useMemo(() => {
    if (!env || !token) return ''
    const params = {
      symbolName,
      dataSourceCode: MOCK_SYMBOL.dataSourceCode,
      dataSourceSymbol: MOCK_SYMBOL.dataSourceSymbol,
      accountGroupId,
      locale: tvLocale,
      colorType,
      token,
      authorization,
      baseUrl: env.baseURL,
      wsUrl: env.ws,
      symbolInfo: MOCK_SYMBOL,
      debug: true,
      watermarkLogoUrl: '',
    }
    return `window.injectParams = ${JSON.stringify(params)}; true;`
  }, [env, token, tvLocale, accountGroupId, symbolName, colorType])

  return {
    env,
    locale,
    urlQuery,
    injectedJS,
    symbolName,
    symbolItem: undefined,
    accountGroupId,
    isReady: !!env && !!token && !!injectedJS,
  }
}

// ============ 真实数据 ============
// export function useTradingviewConfig() {
//   const { trade } = useStores()

//   // 异步状态
//   const [env, setEnv] = useState<IEnv | null>(null)
//   const [token, setToken] = useState('')

//   // 派生值
//   const locale = i18n.locale
//   const tvLocale = getTradingviewLocale(locale)
//   const symbolName = trade.activeSymbolName
//   const symbolItem = trade.symbolMapAll[symbolName]
//   const accountGroupId = Number(
//     trade.currentAccountInfo?.accountGroupId ?? 0,
//   )
//   const colorScheme = useTradeSettingsStore((s) => s.colorScheme)
//   const colorType = colorScheme === 'green-up' ? '1' : '2'

//   // 初始化
//   useEffect(() => {
//     getEnv().then(setEnv)
//     STORAGE_GET_TOKEN().then((t: string) => t && setToken(t))
//   }, [])

//   // 构建 URL query 参数（trading-view 通过 useRouter().query 读取）
//   const urlQuery = useMemo(() => {
//     if (!symbolItem) return {} as Record<string, string>
//     return {
//       name: symbolName,
//       lang: tvLocale,
//       theme: 'dark',
//       colorType,
//     }
//   }, [symbolItem, symbolName, tvLocale, colorType])

//   // 构建 injectedJavaScript
//   const injectedJS = useMemo(() => {
//     if (!env || !token || !symbolItem) return ''

//     const symbolInfo = buildSymbolInfo(
//       symbolItem,
//       accountGroupId,
//       env.imgDomain,
//     )
//     const params = {
//       symbolName,
//       dataSourceCode: symbolItem.dataSourceCode ?? '',
//       dataSourceSymbol: symbolItem.dataSourceSymbol ?? '',
//       accountGroupId,
//       locale: tvLocale,
//       colorType,
//       token,
//       authorization,
//       baseUrl: env.baseURL,
//       wsUrl: env.ws,
//       symbolInfo,
//       debug: __DEV__,
//       watermarkLogoUrl: '',
//     }
//     return `window.injectParams = ${JSON.stringify(params)}; true;`
//   }, [env, token, symbolItem, symbolName, accountGroupId, tvLocale, colorType])

//   return {
//     env,
//     locale,
//     urlQuery,
//     injectedJS,
//     symbolName,
//     symbolItem,
//     accountGroupId,
//     isReady: !!env && !!token && !!injectedJS,
//   }
// }
