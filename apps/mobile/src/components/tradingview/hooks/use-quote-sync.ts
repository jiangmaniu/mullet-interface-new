import { useEffect } from 'react'
import { autorun } from 'mobx'
import type { WebView } from 'react-native-webview'

import { useStores } from '@/v1/provider/mobxProvider'
import { BridgeIncoming } from '@mullet/trading-view'

/**
 * 实时推送行情到 WebView
 * 使用 MobX autorun 追踪 quotes 深层属性变化，每次变化立即推送，保证与 Native UI 同步
 */
export function useQuoteSync(webviewRef: React.RefObject<WebView | null>, accountGroupId: number, symbolName: string) {
  const { ws } = useStores()

  // useEffect(() => {
  //   const quoteKey = `${accountGroupId}/${symbolName}`
  //   const dispose = autorun(() => {
  //     const currentQuote = ws.quotes.get(quoteKey)
  //     if (!currentQuote?.priceData) return
  //     const tick = {
  //       n: currentQuote.symbol,
  //       b: currentQuote.priceData.sell,
  //       a: currentQuote.priceData.buy,
  //       t: Math.floor(currentQuote.priceData.id / 1000),
  //     }
  //     webviewRef.current?.postMessage(
  //       JSON.stringify({ payload: { type: BridgeIncoming.SyncQuote, payload: tick } }),
  //     )
  //   })
  //   return dispose
  // }, [ws, accountGroupId, symbolName, webviewRef])
}
