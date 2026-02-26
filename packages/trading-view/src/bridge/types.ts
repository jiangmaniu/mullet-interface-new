/**
 * App(宿主) ↔ trading-view 双向通信协议
 *
 * 宿主侧（RN WebView / iframe 等）通过 postMessage(JSON.stringify(msg)) 发送
 * Web 侧通过 window.ReactNativeWebView?.postMessage / parent.postMessage 发送
 */

// ── 消息类型枚举 ──

/** App → Web */
export enum BridgeIncoming {
  Invoke = 'invoke',
  SyncQuote = 'syncQuote',
  ChangeSymbol = 'changeSymbol',
}

/** Web → App */
export enum BridgeOutgoing {
  ChartReady = 'chartReady',
  InvokeResult = 'invokeResult',
}

/** invoke 调用目标 */
export enum InvokeTarget {
  Chart = 'chart',
  Widget = 'widget',
}

// ── App → Web 消息 ──

export interface InvokeMessage {
  type: BridgeIncoming.Invoke
  target: InvokeTarget
  method: string
  args?: any[]
  /** 需要返回值时传入，bridge 通过 InvokeResult 回传 */
  callId?: string
}

export interface SyncQuoteMessage {
  type: BridgeIncoming.SyncQuote
  payload: any
}

export interface ChangeSymbolMessage {
  type: BridgeIncoming.ChangeSymbol
  payload: any
}

export type AppToWebMessage = InvokeMessage | SyncQuoteMessage | ChangeSymbolMessage

// ── Web → App 消息 ──

export type WebToAppMessage =
  | { type: BridgeOutgoing.ChartReady }
  | { type: BridgeOutgoing.InvokeResult; callId: string; data: any }
