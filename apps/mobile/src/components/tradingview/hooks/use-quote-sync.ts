import { useCallback, useEffect, useRef } from 'react'
import type { WebView } from 'react-native-webview'

import { BridgeIncoming } from '@mullet/trading-view'
import { useStores } from '@/v1/provider/mobxProvider'

/**
 * 节流推送实时行情到 WebView
 * WebSocket 行情推送频率很高（每秒数次），100ms 节流只保留最新一帧
 */
export function useQuoteSync(webviewRef: React.RefObject<WebView | null>, accountGroupId: number, symbolName: string) {
  const { ws } = useStores()
  const throttledPost = useThrottledPost(webviewRef)

  const quoteKey = `${accountGroupId}/${symbolName}`
  const currentQuote = ws.quotes.get(quoteKey)

  useEffect(() => {
    if (!currentQuote) return
    throttledPost(JSON.stringify({ payload: { type: BridgeIncoming.SyncQuote, payload: currentQuote } }))
  }, [currentQuote, throttledPost])
}

// ─── 内部：节流 postMessage ─────────────────────────────────────────

function useThrottledPost(webviewRef: React.RefObject<WebView | null>, delay = 100) {
  const lastRef = useRef(0)
  const pendingRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return useCallback(
    (msg: string) => {
      const now = Date.now()
      if (now - lastRef.current >= delay) {
        lastRef.current = now
        webviewRef.current?.postMessage(msg)
      } else {
        pendingRef.current = msg
        if (!timerRef.current) {
          timerRef.current = setTimeout(
            () => {
              if (pendingRef.current) {
                webviewRef.current?.postMessage(pendingRef.current)
                lastRef.current = Date.now()
                pendingRef.current = null
              }
              timerRef.current = null
            },
            delay - (now - lastRef.current),
          )
        }
      }
    },
    [webviewRef, delay],
  )
}
