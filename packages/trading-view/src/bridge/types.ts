/**
 * App(宿主) ↔ trading-view 双向通信协议
 *
 * 宿主侧（RN WebView / iframe 等）通过 postMessage(JSON.stringify(msg)) 发送
 * Web 侧通过 window.ReactNativeWebView?.postMessage / parent.postMessage 发送
 *
 * App → Web 支持消息信封：{ v?, id?, ts?, payload }，未带信封时直接按裸消息处理
 */

// ── 消息信封 ──

export interface MessageEnvelope<T = unknown> {
  /** 协议版本，默认为 1 */
  v?: 1
  id?: string
  ts?: number
  payload: T
}

// ── 消息类型枚举 ──

/** App → Web */
export enum BridgeIncoming {
  /** 调用 activeChart 方法（setSymbol、setResolution 等） */
  ActiveChart = 'activeChart',
  /** 调用 widget 方法 */
  Widget = 'widget',
  SyncQuote = 'syncQuote',
  SetWatermark = 'setWatermark'
}

/** Web → App */
export enum BridgeOutgoing {
  ChartReady = 'chartReady',
  ChartCallResult = 'chartCallResult'
}

// ── App → Web 消息 ──

export interface ActiveChartMessage {
  type: BridgeIncoming.ActiveChart
  method: string
  args?: unknown[]
  /** 需要返回值时传入，bridge 通过 ChartCallResult 回传 */
  callId?: string
}

export interface WidgetMessage {
  type: BridgeIncoming.Widget
  method: string
  args?: unknown[]
  callId?: string
}

/** 行情 tick 格式，与 ws.setQuoteData 一致 */
export interface QuoteTick {
  n: string // symbol name
  b: number // bid
  a: number // ask
  t: number // unix timestamp (seconds)
}

export interface SyncQuoteMessage {
  type: BridgeIncoming.SyncQuote
  payload: QuoteTick | QuoteTick[]
}

export interface SetWatermarkMessage {
  type: BridgeIncoming.SetWatermark
  /** base64 编码的水印图片 */
  payload: string
}

export type AppToWebMessage =
  | ActiveChartMessage
  | WidgetMessage
  | SyncQuoteMessage
  | SetWatermarkMessage

// ── Web → App 消息 ──

export type WebToAppMessage =
  | { type: BridgeOutgoing.ChartReady }
  | { type: BridgeOutgoing.ChartCallResult; callId: string; data?: unknown; error?: string }
