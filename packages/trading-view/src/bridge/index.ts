import type { IChartingLibraryWidget } from 'public/static/charting_library'

import { getWidget, registerWidget, unregisterWidget } from '@/core/bridge/widget-registry'
import type { BridgeHistoryProvider } from '@/core/datafeed/bridge/bridge-history-provider'
import type { BridgeSymbolProvider } from '@/core/datafeed/bridge/bridge-symbol-provider'
import quoteStore from '@/stores/quote-store'

import {
  type AppToWebMessage,
  BridgeIncoming,
  BridgeOutgoing,
  type MessageEnvelope,
  type WebToAppMessage,
} from './types'

// ── 发送消息到宿主 App ──

function postToApp(msg: WebToAppMessage) {
  const rnWebView = (window as Window & { ReactNativeWebView?: { postMessage: (s: string) => void } }).ReactNativeWebView

  if (!rnWebView) {
    console.error('[Bridge] ReactNativeWebView not found, message not sent:', msg.type)
    return
  }

  try {
    const payload = JSON.stringify(msg)
    console.log('[Bridge] Sending message:', msg.type, 'callId' in msg ? msg.callId : '')
    rnWebView.postMessage(payload)
  } catch (err) {
    console.error('[Bridge] Failed to send message:', err, msg)
  }
}

// ── Bridge 状态 ──

let listening = false
let watermarkCallback: ((base64: string) => void) | null = null
let historyProviderRef: BridgeHistoryProvider | null = null
let symbolProviderRef: BridgeSymbolProvider | null = null

function isEnvelope(raw: unknown): raw is MessageEnvelope<AppToWebMessage> {
  if (raw == null || typeof raw !== 'object') return false
  const o = raw as Record<string, unknown>
  const pl = o.payload
  // payload 为对象且内含 type → 视为信封（v 默认为 1）
  return typeof pl === 'object' && pl !== null && 'type' in pl
}

function handleMessage(event: MessageEvent) {
  let raw: unknown
  try {
    raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
  } catch (err) {
    console.warn('[Bridge] Failed to parse message:', err)
    return
  }
  const msg: AppToWebMessage = isEnvelope(raw) ? raw.payload : (raw as AppToWebMessage)
  if (!msg || !msg.type) {
    console.warn('[Bridge] Invalid message format:', raw)
    return
  }

  console.log('[Bridge] Received message:', msg.type, 'callId' in msg ? msg.callId : '')

  const widget = getWidget()

  switch (msg.type) {
    case BridgeIncoming.ActiveChart:
    case BridgeIncoming.Widget: {
      const callMsg = msg
      const callId = callMsg.callId

      const reply = (data?: unknown, error?: string) => {
        if (callId) {
          postToApp({ type: BridgeOutgoing.ChartCallResult, callId, data, error })
        }
      }

      if (!widget) {
        reply(undefined, 'Widget not ready')
        return
      }

      const obj =
        callMsg.type === BridgeIncoming.Widget ? widget : widget.activeChart()
      const objAny = obj as unknown as Record<string, unknown>
      const fn = objAny[callMsg.method]

      if (typeof fn !== 'function') {
        reply(undefined, `Method not found: ${callMsg.method}`)
        return
      }

      try {
        const result = (fn as (...args: unknown[]) => unknown).apply(
          objAny,
          callMsg.args ?? []
        )
        if (callId) {
          Promise.resolve(result)
            .then((data) => reply(data))
            .catch((err) => reply(undefined, String(err?.message ?? err)))
        }
      } catch (err) {
        reply(undefined, String(err instanceof Error ? err.message : err))
      }
      break
    }
    case BridgeIncoming.SyncQuote:
      if (msg.payload) {
        const items = Array.isArray(msg.payload) ? msg.payload : [msg.payload]
        items.forEach((p) => p && typeof p === 'object' && quoteStore.setQuoteData(p))
      }
      break
    case BridgeIncoming.BarsResponse:
      console.log('[Bridge] BarsResponse received, callId:', msg.callId, 'bars count:', msg.payload.bars?.length)
      if (historyProviderRef && msg.callId) {
        historyProviderRef.handleBarsResponse(msg.callId, msg.payload.bars, msg.payload.noData)
      } else {
        console.warn('[Bridge] BarsResponse ignored - provider or callId missing')
      }
      break
    case BridgeIncoming.SymbolResponse:
      console.log('[Bridge] SymbolResponse received, callId:', msg.callId, 'symbol:', msg.payload.name)
      if (symbolProviderRef && msg.callId) {
        symbolProviderRef.handleSymbolResponse(msg.callId, msg.payload)
      } else {
        console.warn('[Bridge] SymbolResponse ignored - provider or callId missing')
      }
      break
    case BridgeIncoming.SetWatermark:
      watermarkCallback?.(msg.payload)
      break
  }
}

// ── 公开 API ──

export function initBridge(
  widget: IChartingLibraryWidget | null,
  providers?: {
    historyProvider?: BridgeHistoryProvider
    symbolProvider?: BridgeSymbolProvider
  }
) {
  if (widget) registerWidget(widget)
  historyProviderRef = providers?.historyProvider ?? historyProviderRef
  symbolProviderRef = providers?.symbolProvider ?? symbolProviderRef
  if (!listening) {
    console.log('[Bridge] Initializing bridge listeners')
    console.log('[Bridge] ReactNativeWebView available:', !!(window as any).ReactNativeWebView)
    console.log('[Bridge] User Agent:', navigator.userAgent)

    // 同时监听 window 和 document，兼容不同厂商 Android WebView 实现差异
    window.addEventListener('message', handleMessage)
    document.addEventListener('message', handleMessage as EventListener)

    listening = true
  }
}

export function destroyBridge() {
  window.removeEventListener('message', handleMessage)
  document.removeEventListener('message', handleMessage as EventListener)
  unregisterWidget()
  watermarkCallback = null
  historyProviderRef = null
  symbolProviderRef = null
  listening = false
}

export function onWatermark(cb: (base64: string) => void) {
  watermarkCallback = cb
}

export function wrapBridgeMessage<T extends AppToWebMessage>(payload: T): MessageEnvelope<T> {
  return { v: 1, ts: Date.now(), payload }
}

export { BridgeOutgoing, postToApp }
export type { AppToWebMessage, MessageEnvelope, WebToAppMessage } from './types'
