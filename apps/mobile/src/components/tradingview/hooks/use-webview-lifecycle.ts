import { useCallback, useEffect, useRef } from 'react'
import type { IEnv } from '@/env'
import type { WebView } from 'react-native-webview'

import { useAppState } from '@/hooks/use-app-state'
import { STORAGE_KEY_TRADINGVIEW_RELOAD_TIME } from '@/lib/storage/keys'
import { storageGet, storageSet } from '@/lib/storage/storage'
import { Account } from '@/services/tradeCore/account/typings'
import { BridgeIncoming } from '@mullet/trading-view'

import { buildSymbolInfo, RELOAD_THRESHOLD } from '../utils'

/**
 * 品种切换 + 前后台生命周期管理
 * - 品种变化 → postMessage chart(setSymbol)，不重载 WebView
 * - 进入后台 → 记录时间戳
 * - 回到前台 → 超 5 分钟 reload，否则 chart(setSymbol)
 */
export function useWebviewLifecycle(
  webviewRef: React.RefObject<WebView | null>,
  env: IEnv | null,
  symbolName: string,
  symbolItem: Account.TradeSymbolListItem | undefined,
  accountGroupId: number,
) {
  const prevSymbolRef = useRef('')

  useEffect(() => {
    if (!env || !symbolItem) return
    if (prevSymbolRef.current && prevSymbolRef.current !== symbolName) {
      const payload = buildSymbolInfo(symbolItem, accountGroupId, env.imgDomain)
      webviewRef.current?.postMessage(
        JSON.stringify({
          payload: { type: BridgeIncoming.ActiveChart, method: 'setSymbol', args: [payload.symbol] },
        }),
      )
    }
    prevSymbolRef.current = symbolName
  }, [symbolName, symbolItem, accountGroupId, env, webviewRef])

  const handleForeground = useCallback(async () => {
    const shouldReload = checkShouldReload()
    if (shouldReload) {
      webviewRef.current?.reload()
    } else if (env && symbolItem) {
      const payload = buildSymbolInfo(symbolItem, accountGroupId, env.imgDomain)
      webviewRef.current?.postMessage(
        JSON.stringify({
          payload: { type: BridgeIncoming.ActiveChart, method: 'setSymbol', args: [payload.symbol] },
        }),
      )
    }
  }, [env, symbolItem, accountGroupId, webviewRef])

  const handleBackground = useCallback(() => {
    storageSet(STORAGE_KEY_TRADINGVIEW_RELOAD_TIME, Date.now())
  }, [])

  useAppState({
    onForeground: handleForeground,
    onBackground: handleBackground,
  })
}

function checkShouldReload(): boolean {
  const lastTime = storageGet<number>(STORAGE_KEY_TRADINGVIEW_RELOAD_TIME)
  const elapsed = lastTime ? Date.now() - lastTime : Infinity
  if (elapsed > RELOAD_THRESHOLD) {
    storageSet(STORAGE_KEY_TRADINGVIEW_RELOAD_TIME, Date.now())
    return true
  }
  return false
}
