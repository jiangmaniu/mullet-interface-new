import type { IChartingLibraryWidget } from 'public/static/charting_library'

import { BridgeIncoming, BridgeOutgoing, InvokeTarget, type AppToWebMessage, type WebToAppMessage } from './types'

// ── 发送消息到宿主 App ──

function postToApp(msg: WebToAppMessage) {
  ;(window as any).ReactNativeWebView?.postMessage(JSON.stringify(msg))
}

// ── Bridge 实例 ──

let tvWidget: IChartingLibraryWidget | null = null
let listening = false

function handleMessage(event: MessageEvent) {
  let msg: AppToWebMessage
  try {
    msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
  } catch {
    return
  }
  if (!msg || !msg.type) return

  switch (msg.type) {
    case BridgeIncoming.Invoke: {
      if (!tvWidget) return
      const obj: any = msg.target === InvokeTarget.Chart ? tvWidget.activeChart() : tvWidget
      const fn = obj[msg.method]
      if (typeof fn !== 'function') return
      const result = fn.apply(obj, msg.args || [])
      if (msg.callId) {
        Promise.resolve(result).then((data) => {
          postToApp({ type: BridgeOutgoing.InvokeResult, callId: msg.callId!, data })
        })
      }
      break
    }
    case BridgeIncoming.SyncQuote:
      // TODO: 对接实时行情推送到 ws store
      break
    case BridgeIncoming.ChangeSymbol:
      // TODO: 对接品种切换逻辑
      break
  }
}

// ── 公开 API ──

export function initBridge(widget: IChartingLibraryWidget) {
  tvWidget = widget
  if (!listening) {
    window.addEventListener('message', handleMessage)
    document.addEventListener('message', handleMessage as EventListener)
    listening = true
  }
}

export function destroyBridge() {
  window.removeEventListener('message', handleMessage)
  document.removeEventListener('message', handleMessage as EventListener)
  tvWidget = null
  listening = false
}

export { BridgeOutgoing, postToApp }
export type { WebToAppMessage } from './types'
