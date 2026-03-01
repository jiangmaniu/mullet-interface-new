import { useEffect, useMemo, useState } from 'react'
import type { IEnv } from '@/v1/env'

import { i18n } from '@/locales/i18n'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { getEnv } from '@/v1/env'
import { useStores } from '@/v1/provider/mobxProvider'

import { getTradingviewLocale } from '../utils'

export interface UseTradingviewConfigOpts {
  mode?: 'simple' | 'detail'
}

export function useTradingviewConfig(opts?: UseTradingviewConfigOpts) {
  const { trade } = useStores()

  const [env, setEnv] = useState<IEnv | null>(null)

  // 派生值
  const locale = i18n.locale
  const tvLocale = getTradingviewLocale(locale)
  const symbolName = trade.activeSymbolName
  const symbolItem = trade.symbolMapAll[symbolName]
  const accountGroupId = Number(trade.currentAccountInfo?.accountGroupId ?? 0)
  const colorScheme = useTradeSettingsStore((s) => s.colorScheme)
  const colorType = colorScheme === 'green-up' ? '1' : '2'

  useEffect(() => {
    getEnv().then(setEnv)
  }, [])

  /**
   * URL query 参数 - 实际被 packages/trading-view 消费
   * 通过 getSourceUri(urlQuery) 拼入加载地址，trading-view 的 TVChart 用 useRouter().query 读取
   */
  const urlQuery = useMemo(() => {
    if (!symbolItem) return {} as Record<string, string>
    return {
      name: symbolName,
      lang: tvLocale,
      theme: 'dark',
      colorType,
      // debug: __DEV__ ? '1' : undefined,
      ...(opts?.mode === 'simple' && { mode: 'simple' }),
    }
  }, [symbolItem, symbolName, tvLocale, colorType])

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
