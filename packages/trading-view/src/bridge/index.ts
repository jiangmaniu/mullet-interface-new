import type { IChartingLibraryWidget } from 'public/static/charting_library'

import { getWidget, registerWidget, unregisterWidget } from '@/core/bridge/widget-registry'
import wsStore from '@/stores/ws'

import {
  type AppToWebMessage,
  BridgeIncoming,
  BridgeOutgoing,
  type MessageEnvelope,
  type WebToAppMessage,
} from './types'

// ── 发送消息到宿主 App ──

function postToApp(msg: WebToAppMessage) {
  ;(window as Window & { ReactNativeWebView?: { postMessage: (s: string) => void } }).ReactNativeWebView?.postMessage(
    JSON.stringify(msg)
  )
}

// ── Bridge 状态 ──

let listening = false
let watermarkCallback: ((base64: string) => void) | null = null

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
  } catch {
    return
  }
  const msg: AppToWebMessage = isEnvelope(raw) ? raw.payload : (raw as AppToWebMessage)
  if (!msg || !msg.type) return

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
      // App 推送的行情数据，格式需与 setQuoteData 一致：{ n, b, a, t } 或数组
      if (msg.payload) {
        const items = Array.isArray(msg.payload) ? msg.payload : [msg.payload]
        items.forEach((p) => p && typeof p === 'object' && wsStore.setQuoteData(p))
      }
      break
    case BridgeIncoming.SetWatermark:
      watermarkCallback?.(msg.payload)
      break
  }
}

// ── 公开 API ──

export function initBridge(widget: IChartingLibraryWidget) {
  registerWidget(widget)
  if (!listening) {
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
