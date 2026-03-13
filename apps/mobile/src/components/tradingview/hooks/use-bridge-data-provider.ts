import { useCallback, useRef } from 'react'
import { round } from 'number-precision'
import type { BarData, BridgeSymbolInfo, RequestBarsPayload } from '@mullet/trading-view'
import type { WebView } from 'react-native-webview'

import { useStores } from '@/v1/provider/mobxProvider'
import { request } from '@/v1/utils/request'
import { BridgeIncoming, BridgeOutgoing } from '@mullet/trading-view'

const RESOLUTION_MAP: Record<string, string> = {
  '1': '1min',
  '5': '5min',
  '15': '15min',
  '30': '30min',
  '60': '60min',
  '240': '4hour',
  '1D': '1day',
  '1W': '1week',
  '1M': '1mon',
}

/**
 * Bridge 数据提供者
 * 监听 WebView 的数据请求（历史 K 线、品种信息），从 Native 侧获取数据后返回
 */
export function useBridgeDataProvider(webviewRef: React.RefObject<WebView | null>) {
  const { trade } = useStores()
  const lastBarTimeRef = useRef<number | null>(null)

  const postResponse = useCallback(
    (msg: Record<string, unknown>) => {
      webviewRef.current?.postMessage(JSON.stringify({ payload: msg }))
    },
    [webviewRef],
  )

  /** 获取历史 K 线并返回给 WebView */
  const handleRequestBars = useCallback(
    async (callId: string, payload: RequestBarsPayload) => {
      const { symbol, resolution, to, firstDataRequest } = payload
      const klineType = RESOLUTION_MAP[resolution] || '1min'
      const toTimestamp = firstDataRequest ? to : (lastBarTimeRef.current ?? to)

      try {
        const res = await request<{ data: string[] }>('/api/trade-market/marketApi/kline/symbol/klineList', {
          params: {
            symbol: trade.activeSymbolName,
            klineType,
            size: 300,
            klineTime: toTimestamp * 1000,
          },
        })

        const list = res?.data || []
        if (!list.length) {
          postResponse({ type: BridgeIncoming.BarsResponse, callId, payload: { bars: [], noData: true } })
          return
        }

        const symbolItem = trade.symbolMapAll[symbol]
        const precision = symbolItem?.symbolDecimal ?? 2

        const bars: BarData[] = list
          .map((item) => {
            const [klineTime, open, high, low, close] = (item || '').split(',')
            return {
              time: Number(klineTime),
              open: round(Number(open), precision),
              high: round(Number(high), precision),
              low: round(Number(low), precision),
              close: round(Number(close), precision),
            }
          })
          .reverse()

        if (bars.length > 0) {
          lastBarTimeRef.current = bars[0].time / 1000
        }

        postResponse({
          type: BridgeIncoming.BarsResponse,
          callId,
          payload: { bars, noData: false },
        })
      } catch {
        postResponse({ type: BridgeIncoming.BarsResponse, callId, payload: { bars: [], noData: true } })
      }
    },
    [postResponse, trade],
  )

  /** 返回品种信息给 WebView */
  const handleResolveSymbol = useCallback(
    (callId: string, symbol: string) => {
      const symbolItem = trade.symbolMapAll[symbol]
      const info: BridgeSymbolInfo = {
        name: symbol,
        description: symbolItem?.alias ?? symbol,
        type: symbolItem?.classify ?? 'forex',
        precision: symbolItem?.symbolDecimal ?? 2,
        exchange: symbolItem?.classify ?? '',
      }
      postResponse({ type: BridgeIncoming.SymbolResponse, callId, payload: info })
    },
    [postResponse, trade],
  )

  /** WebView onMessage 处理器 — 处理数据请求 */
  const handleBridgeMessage = useCallback(
    (data: string): boolean => {
      let msg: Record<string, any>
      try {
        msg = JSON.parse(data)
      } catch {
        return false
      }

      switch (msg.type) {
        case BridgeOutgoing.RequestBars:
          handleRequestBars(msg.callId, msg.payload)
          return true
        case BridgeOutgoing.ResolveSymbol:
          handleResolveSymbol(msg.callId, msg.payload?.symbol)
          return true
        case BridgeOutgoing.Subscribe:
        case BridgeOutgoing.Unsubscribe:
          // 订阅/退订由 useQuoteSync 统一管理，这里只需 ack
          return true
        default:
          return false
      }
    },
    [handleRequestBars, handleResolveSymbol],
  )

  return { handleBridgeMessage }
}
