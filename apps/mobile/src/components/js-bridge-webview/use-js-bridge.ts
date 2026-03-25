/**
 * useBridge — Bridge 通信 hook
 *
 * 封装消息收发、分发、同步注入逻辑
 * 组件只需传入 webviewRef 和 UI 回调
 */

import { useCallback, useMemo, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import { useUniwind } from 'uniwind'
import type { AppEvent, BridgeEnvelope, BridgeEvent, BridgeResponse } from '@mullet/js-bridge/types'
import type { RefObject } from 'react'
import type { WebViewMessageEvent } from 'react-native-webview'

import { useI18n } from '@/hooks/use-i18n'

import { handleAction, UIActionCallbacks } from './handlers'
import { buildInjectedScript } from './inject-context'
import { parseRequest } from './utils'

export interface UseBridgeOptions {
  webviewRef: RefObject<WebView | null>
  uiCallbacks?: UIActionCallbacks
}

export interface UseBridgeReturn {
  /** WebView onMessage 处理函数 */
  onMessage: (event: WebViewMessageEvent) => void
  /** 向 H5 推送事件 */
  pushEvent: (event: AppEvent, payload: unknown) => void
  /** 同步注入脚本（injectedJavaScriptBeforeContentLoaded） */
  injectedJS: string
}

export function useJsBridge({ webviewRef, uiCallbacks }: UseBridgeOptions): UseBridgeReturn {
  const uiCallbacksRef = useRef(uiCallbacks)
  uiCallbacksRef.current = uiCallbacks

  const { top: safeAreaTop, bottom: safeAreaBottom } = useSafeAreaInsets()
  const { locale } = useI18n()
  const { theme } = useUniwind()

  // ── 向 H5 发送消息 ──

  const postToH5 = useCallback(
    (message: BridgeResponse | BridgeEvent) => {
      const envelope: BridgeEnvelope = {
        v: 1,
        ts: Date.now(),
        payload: message,
      }
      webviewRef.current?.postMessage(JSON.stringify(envelope))
    },
    [webviewRef],
  )

  // ── 向 H5 推送事件 ──

  const pushEvent = useCallback(
    (event: AppEvent, payload: unknown) => {
      postToH5({
        direction: 'app-to-h5',
        type: 'event',
        event,
        payload,
      } as BridgeEvent)
    },
    [postToH5],
  )

  // ── 处理 H5 消息 ──

  const onMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const request = parseRequest(event.nativeEvent.data)
      if (!request) return

      try {
        const result = await handleAction(request.action, request.payload, uiCallbacksRef.current)
        postToH5({
          direction: 'app-to-h5',
          type: 'response',
          callId: request.callId,
          success: true,
          data: result,
        } as BridgeResponse)
      } catch (err) {
        postToH5({
          direction: 'app-to-h5',
          type: 'response',
          callId: request.callId,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        } as BridgeResponse)
      }
    },
    [postToH5],
  )

  // ── 同步注入脚本 ──

  const injectedJS = useMemo(
    () => buildInjectedScript({ safeAreaTop, safeAreaBottom, locale, theme }),
    [safeAreaTop, safeAreaBottom, locale, theme],
  )

  return { onMessage, pushEvent, injectedJS }
}
