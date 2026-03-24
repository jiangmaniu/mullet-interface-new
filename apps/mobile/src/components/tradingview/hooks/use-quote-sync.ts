import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { WebView } from 'react-native-webview'

import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { RootStoreState, useRootStore } from '@/stores'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { BridgeIncoming } from '@mullet/trading-view'

/**
 * 实时推送行情到 WebView
 * 从 Zustand quoteMap 读取行情，依赖变化时立即推送，保证与 Native UI 同步
 */
export function useQuoteSync(webviewRef: React.RefObject<WebView | null>, accountGroupId: string, symbolName?: string) {
  const dataSourceKey = useMemo(() => {
    if (!symbolName) return undefined
    return parseDataSourceKey({ accountGroupId, symbol: symbolName })
  }, [accountGroupId, symbolName])

  const currentQuote = useRootStore(
    useShallow(
      useCallback((state: RootStoreState) => createMarketQuoteSelector(dataSourceKey)(state), [dataSourceKey]),
    ),
  )

  useEffect(() => {
    if (!currentQuote?.priceData) return
    const tick = {
      n: currentQuote.symbol,
      b: currentQuote.priceData.sell,
      a: currentQuote.priceData.buy,
      t: Math.floor(currentQuote.priceData.id / 1000),
    }
    webviewRef.current?.postMessage(JSON.stringify({ payload: { type: BridgeIncoming.SyncQuote, payload: tick } }))
  }, [currentQuote, webviewRef])
}
