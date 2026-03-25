/**
 * @mullet/js-bridge — App ↔ H5 通信协议 (单一类型来源)
 *
 * 两种通信模式：
 * 1. 同步注入 — App 在 WebView 加载前注入 BridgeContext 到 window.__BRIDGE_CONTEXT__
 * 2. 异步通信 — 具名 API（showToast / getAuth / ...） → Promise / on(event) → callback
 */

// ═══════════════════════════════════════════════════════════════════
//  同步注入上下文
// ═══════════════════════════════════════════════════════════════════

/**
 * App 在 WebView 加载前同步注入的环境上下文
 *
 * 只包含环境/设备信息，不含 token / user（通过异步 GetAuth / GetUserInfo 获取）
 */
export interface BridgeContext {
  /** 硬件/系统信息（不随运行时变化） */
  device: DeviceInfo
  /** 视口/布局信息（随屏幕旋转等变化） */
  window: WindowInfo
  /** 当前主题 */
  theme: 'light' | 'dark'
  /** 当前语言 */
  locale: string
  /** 注入时间戳 */
  ts: number
}

declare global {
  interface Window {
    __BRIDGE_CONTEXT__?: BridgeContext
    ReactNativeWebView?: { postMessage: (message: string) => void }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  异步通信协议
// ═══════════════════════════════════════════════════════════════════

// ─── 消息信封 ───────────────────────────────────────────────────

export interface BridgeEnvelope<T = unknown> {
  v: 1
  id?: string
  ts: number
  payload: T
}

// ─── H5 → App 请求 ─────────────────────────────────────────────

export const H5Action = {
  GetAuth: 'getAuth',
  GetUserInfo: 'getUserInfo',
  GetDeviceInfo: 'getDeviceInfo',

  Navigate: 'navigate',
  GoBack: 'goBack',
  Close: 'close',

  Share: 'share',
  CopyToClipboard: 'copy',
  HapticFeedback: 'haptic',
  ShowToast: 'showToast',

  ScanQR: 'scanQR',
  OpenExternal: 'openExternal',

  TrackEvent: 'trackEvent',

  SetTitle: 'setTitle',
  SetNavBarStyle: 'setNavBarStyle',
  SetStatusBar: 'setStatusBar',
} as const

export type H5Action = (typeof H5Action)[keyof typeof H5Action]

export interface H5ActionPayloadMap {
  [H5Action.GetAuth]: undefined
  [H5Action.GetUserInfo]: undefined
  [H5Action.GetDeviceInfo]: undefined

  [H5Action.Navigate]: { path: string; params?: Record<string, string> }
  [H5Action.GoBack]: undefined
  [H5Action.Close]: undefined

  [H5Action.Share]: { title: string; text?: string; url?: string; image?: string }
  [H5Action.CopyToClipboard]: { text: string }
  [H5Action.HapticFeedback]: { type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' }
  [H5Action.ShowToast]: { message: string; type?: 'success' | 'error' | 'info' | 'warning'; duration?: number }

  [H5Action.ScanQR]: undefined
  [H5Action.OpenExternal]: { url: string }

  [H5Action.TrackEvent]: { event: string; props?: Record<string, unknown> }

  [H5Action.SetTitle]: { title: string }
  [H5Action.SetNavBarStyle]: { visible?: boolean; transparent?: boolean; backgroundColor?: string }
  [H5Action.SetStatusBar]: { style: 'light' | 'dark'; backgroundColor?: string }
}

export interface H5ActionResultMap {
  [H5Action.GetAuth]: { token: string | null; refreshToken?: string | null }
  [H5Action.GetUserInfo]: UserInfo | null
  [H5Action.GetDeviceInfo]: DeviceInfo

  [H5Action.Navigate]: void
  [H5Action.GoBack]: void
  [H5Action.Close]: void

  [H5Action.Share]: { success: boolean }
  [H5Action.CopyToClipboard]: void
  [H5Action.HapticFeedback]: void
  [H5Action.ShowToast]: void

  [H5Action.ScanQR]: { data: string } | null
  [H5Action.OpenExternal]: void

  [H5Action.TrackEvent]: void

  [H5Action.SetTitle]: void
  [H5Action.SetNavBarStyle]: void
  [H5Action.SetStatusBar]: void
}

// ─── App → H5 事件 ─────────────────────────────────────────────

export const AppEvent = {
  AuthChanged: 'authChanged',
  UserChanged: 'userChanged',
  ThemeChanged: 'themeChanged',
  LocaleChanged: 'localeChanged',
  VisibilityChanged: 'visibilityChanged',
  NetworkChanged: 'networkChanged',
  BackPressed: 'backPressed',
  KeyboardChanged: 'keyboardChanged',
} as const

export type AppEvent = (typeof AppEvent)[keyof typeof AppEvent]

export interface AppEventPayloadMap {
  [AppEvent.AuthChanged]: { token: string | null }
  [AppEvent.UserChanged]: { user: UserInfo | null }
  [AppEvent.ThemeChanged]: { theme: 'light' | 'dark' }
  [AppEvent.LocaleChanged]: { locale: string }
  [AppEvent.VisibilityChanged]: { visible: boolean }
  [AppEvent.NetworkChanged]: { online: boolean; type?: string }
  [AppEvent.BackPressed]: undefined
  [AppEvent.KeyboardChanged]: { height: number; visible: boolean }
}

// ─── 通信格式 ─────────────────────────────────────────────────

export interface BridgeRequest<A extends H5Action = H5Action> {
  direction: 'h5-to-app'
  action: A
  callId: string
  payload: H5ActionPayloadMap[A]
}

export interface BridgeResponse<A extends H5Action = H5Action> {
  direction: 'app-to-h5'
  type: 'response'
  callId: string
  success: boolean
  data?: H5ActionResultMap[A]
  error?: string
}

export interface BridgeEvent<E extends AppEvent = AppEvent> {
  direction: 'app-to-h5'
  type: 'event'
  event: E
  payload: AppEventPayloadMap[E]
}

export type H5ReceivedMessage = BridgeResponse | BridgeEvent

// ═══════════════════════════════════════════════════════════════════
//  共享数据结构
// ═══════════════════════════════════════════════════════════════════

export interface UserInfo {
  uid: string
  nickname?: string
  avatar?: string
  email?: string
  walletAddress?: string
}

export interface DeviceInfo {
  platform: 'ios' | 'android'
  osVersion: string
  appVersion: string
  deviceModel: string
}

export interface WindowInfo {
  screenWidth: number
  screenHeight: number
  safeAreaTop: number
  safeAreaBottom: number
}
