/**
 * 消息通信基础设施
 *
 * callNative — H5 → App RPC 调用
 * on         — 监听 App 推送事件
 * init / destroy — 生命周期管理
 */

import {
  H5Action,
  type AppEvent,
  type AppEventPayloadMap,
  type BridgeEnvelope,
  type BridgeEvent,
  type BridgeRequest,
  type BridgeResponse,
  type H5ActionPayloadMap,
  type H5ActionResultMap,
  type H5ReceivedMessage,
} from '../types'

import { isInAppSync } from './api'

// ─── 内部状态 ─────────────────────────────────────────────────

type PendingCallback = {
  resolve: (data: unknown) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

const pendingCalls = new Map<string, PendingCallback>()
const eventListeners = new Map<string, Set<(payload: unknown) => void>>()
let callIdCounter = 0
let initialized = false

const DEFAULT_TIMEOUT = 10_000

// ─── callNative ──────────────────────────────────────────────

/** H5 → App RPC 调用（内部使用，外部请用具名 API） */
export function callNative<A extends H5Action>(
  action: A,
  ...args: H5ActionPayloadMap[A] extends undefined ? [] : [payload: H5ActionPayloadMap[A]]
): Promise<H5ActionResultMap[A]> {
  const payload = args[0] as H5ActionPayloadMap[A]

  return new Promise<H5ActionResultMap[A]>((resolve, reject) => {
    if (!isInAppSync()) {
      reject(new Error(`[Bridge] Not in App WebView, cannot call: ${action}`))
      return
    }

    const callId = `h5_${++callIdCounter}_${Date.now()}`

    const timer = setTimeout(() => {
      pendingCalls.delete(callId)
      reject(new Error(`[Bridge] Call timeout: ${action} (${callId})`))
    }, DEFAULT_TIMEOUT)

    pendingCalls.set(callId, {
      resolve: resolve as (data: unknown) => void,
      reject,
      timer,
    })

    const request: BridgeRequest<A> = {
      direction: 'h5-to-app',
      action,
      callId,
      payload,
    }

    const envelope: BridgeEnvelope<BridgeRequest<A>> = {
      v: 1,
      id: callId,
      ts: Date.now(),
      payload: request,
    }

    window.ReactNativeWebView!.postMessage(JSON.stringify(envelope))
  })
}

// ─── on ──────────────────────────────────────────────────────

/**
 * 监听 App 推送事件
 *
 * @returns 取消监听函数
 */
export function on<E extends AppEvent>(
  event: E,
  handler: (payload: AppEventPayloadMap[E]) => void,
): () => void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set())
  }
  const handlers = eventListeners.get(event)!
  handlers.add(handler as (payload: unknown) => void)

  return () => {
    handlers.delete(handler as (payload: unknown) => void)
    if (handlers.size === 0) {
      eventListeners.delete(event)
    }
  }
}

// ─── 消息处理 ─────────────────────────────────────────────────

function handleIncoming(event: MessageEvent) {
  let msg: H5ReceivedMessage
  try {
    const raw = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
    msg = raw?.payload?.direction === 'app-to-h5' ? raw.payload : raw
  } catch {
    return
  }

  if (!msg || (msg as unknown as Record<string, unknown>).direction !== 'app-to-h5') return

  if (msg.type === 'response') {
    const res = msg as BridgeResponse
    const pending = pendingCalls.get(res.callId)
    if (!pending) return
    clearTimeout(pending.timer)
    pendingCalls.delete(res.callId)
    res.success ? pending.resolve(res.data) : pending.reject(new Error(res.error ?? 'Unknown error'))
  } else if (msg.type === 'event') {
    const evt = msg as BridgeEvent
    const handlers = eventListeners.get(evt.event)
    handlers?.forEach((h) => {
      try { h(evt.payload) } catch (e) { console.error(`[Bridge] Event handler error (${evt.event}):`, e) }
    })
  }
}

// ─── 生命周期 ─────────────────────────────────────────────────

export function initBridge() {
  if (initialized) return
  window.addEventListener('message', handleIncoming)
  document.addEventListener('message', handleIncoming as EventListener)
  initialized = true
}

export function destroyBridge() {
  window.removeEventListener('message', handleIncoming)
  document.removeEventListener('message', handleIncoming as EventListener)
  pendingCalls.forEach(({ timer }) => clearTimeout(timer))
  pendingCalls.clear()
  eventListeners.clear()
  initialized = false
}

if (typeof window !== 'undefined') {
  initBridge()
}
