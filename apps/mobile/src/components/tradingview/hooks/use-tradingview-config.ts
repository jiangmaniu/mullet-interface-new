import { useEffect, useMemo, useRef, useState } from 'react'
import type { IEnv } from '@/env'

import { getEnv } from '@/env'
import { i18n } from '@/locales/i18n'
import { useRootStore } from '@/stores'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'

import { getTradingviewLocale } from '../utils'

export interface UseTradingviewConfigOpts {
  mode?: 'simple' | 'detail'
  /** simple 模式下由外部传入的 resolution（TradingView 格式，如 '15', '60', '1D'） */
  resolution?: string
}

export function useTradingviewConfig(opts?: UseTradingviewConfigOpts) {
  const currentAccountInfo = useRootStore(userInfoActiveTradeAccountInfoSelector)

  const [env, setEnv] = useState<IEnv | null>(null)

  // 派生值
  const locale = i18n.locale
  const tvLocale = getTradingviewLocale(locale)
  const symbolName = useRootStore(tradeActiveTradeSymbolSelector)
  const symbolItem = useMarketSymbolInfo(symbolName)
  const accountGroupId = Number(currentAccountInfo?.accountGroupId ?? 0)
  const colorScheme = useRootStore((s) => s.trade.setting.colorScheme)
  const colorType = colorScheme === 'green-up' ? '1' : '2'

  // resolution 用 ref 存储，不作为 urlQuery 的依赖
  // → 切换周期时不会触发 URL 变化（走 postMessage）
  // → 切换品种时 urlQuery 因 symbolName 变化而重算，自动带上最新 resolution
  const resolutionRef = useRef(opts?.resolution)
  resolutionRef.current = opts?.resolution

  useEffect(() => {
    getEnv().then(setEnv)
  }, [])

  /**
   * URL query 参数 - 实际被 packages/trading-view 消费
   * 通过 getSourceUri(urlQuery) 拼入加载地址，trading-view 的 TVChart 用 useRouter().query 读取
   *
   * 注意：resolution 通过 ref 读取，不在 deps 中
   * - 切换品种 → symbolName 变 → urlQuery 重算 → WebView 重载，带上当前 resolution
   * - 切换周期 → resolution 变 → urlQuery 不变 → 不重载，走 postMessage
   */
  const urlQuery = useMemo(() => {
    if (!symbolItem) return {} as Record<string, string>
    return {
      name: symbolName ?? '',
      lang: tvLocale,
      theme: 'dark',
      colorType,
      ...(opts?.mode === 'simple' && { mode: 'simple' }),
      ...(resolutionRef.current && { resolution: resolutionRef.current }),
    }
  }, [symbolItem, symbolName, tvLocale, colorType, opts?.mode])

  return {
    env,
    locale,
    urlQuery,
    symbolName,
    symbolItem,
    accountGroupId,
    isReady: !!env && !!symbolItem,
  }
}
