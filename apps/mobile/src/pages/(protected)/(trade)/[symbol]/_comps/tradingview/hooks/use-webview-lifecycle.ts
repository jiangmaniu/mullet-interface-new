import { useRef, useCallback, useEffect } from 'react'
import type { WebView } from 'react-native-webview'
import type { IEnv } from '@/v1/env'
import {
  STORAGE_GET_TRADINGVIEW_RELOAD_TIME,
  STORAGE_SET_TRADINGVIEW_RELOAD_TIME,
} from '@/v1/utils/storage'
import { useAppState } from '@/hooks/use-app-state'
import { buildSymbolInfo, RELOAD_THRESHOLD } from '../utils'

/**
 * 品种切换 + 前后台生命周期管理
 * - 品种变化 → postMessage('changeSymbol')，不重载 WebView
 * - 进入后台 → 记录时间戳
 * - 回到前台 → 超 5 分钟 reload，否则 changeSymbol
 */
export function useWebviewLifecycle(
  webviewRef: React.RefObject<WebView | null>,
  env: IEnv | null,
  symbolName: string,
  symbolItem: Account.TradeSymbolListItem | undefined,
  accountGroupId: number,
) {
  const prevSymbolRef = useRef('')

  // ─── 品种切换 ───────────────────────────────────────────────────
  useEffect(() => {
    if (!env || !symbolItem) return
    if (prevSymbolRef.current && prevSymbolRef.current !== symbolName) {
      const payload = buildSymbolInfo(
        symbolItem,
        accountGroupId,
        env.imgDomain,
      )
      webviewRef.current?.postMessage(
        JSON.stringify({ type: 'changeSymbol', payload }),
      )
    }
    prevSymbolRef.current = symbolName
  }, [symbolName, symbolItem, accountGroupId, env, webviewRef])

  // ─── 前后台切换 ─────────────────────────────────────────────────
  const handleForeground = useCallback(async () => {
    const shouldReload = await checkShouldReload()
    if (shouldReload) {
      webviewRef.current?.reload()
    } else if (env && symbolItem) {
      const payload = buildSymbolInfo(
        symbolItem,
        accountGroupId,
        env.imgDomain,
      )
      webviewRef.current?.postMessage(
        JSON.stringify({ type: 'changeSymbol', payload }),
      )
    }
  }, [env, symbolItem, accountGroupId, webviewRef])

  const handleBackground = useCallback(() => {
    STORAGE_SET_TRADINGVIEW_RELOAD_TIME(Date.now())
  }, [])

  useAppState(handleForeground, handleBackground)
}

// ─── 内部：重载检查 ──────────────────────────────────────────────────

async function checkShouldReload(): Promise<boolean> {
  const lastTime = await STORAGE_GET_TRADINGVIEW_RELOAD_TIME()
  const elapsed = lastTime ? Date.now() - Number(lastTime) : Infinity
  if (elapsed > RELOAD_THRESHOLD) {
    STORAGE_SET_TRADINGVIEW_RELOAD_TIME(Date.now())
    return true
  }
  return false
}