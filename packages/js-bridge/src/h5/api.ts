/**
 * H5 端具名 API
 *
 * 同步 API（Sync 后缀）— 从 window.__BRIDGE_CONTEXT__ 读取
 * 异步 API — 通过 callNative 与 App 通信
 */

import { H5Action, type BridgeContext, type H5ActionPayloadMap } from '../types'
import { callNative } from './core'

// ─── 同步 API ─────────────────────────────────────────────────

/** 是否运行在 App WebView 中 */
export function isInAppSync(): boolean {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView
}

/** 同步读取 App 注入的上下文（页面加载前已可用） */
export function getContextSync(): BridgeContext | null {
  return typeof window !== 'undefined' ? window.__BRIDGE_CONTEXT__ ?? null : null
}

/** 同步读取 token */
export function getTokenSync(): string | null {
  return getContextSync()?.token ?? null
}

/** 同步读取设备信息 */
export function getDeviceInfoSync() {
  return getContextSync()?.device ?? null
}

/** 同步读取主题 */
export function getThemeSync(): 'light' | 'dark' {
  return getContextSync()?.theme ?? 'dark'
}

// ─── 异步 API ─────────────────────────────────────────────────

/** 获取认证信息 */
export const getAuth = () => callNative(H5Action.GetAuth)

/** 获取用户信息 */
export const getUserInfo = () => callNative(H5Action.GetUserInfo)

/** 异步获取设备信息（区别于同步的 getDeviceInfoSync） */
export const fetchDeviceInfo = () => callNative(H5Action.GetDeviceInfo)

/** 导航到指定路径 */
export const navigate = (path: string, params?: Record<string, string>) =>
  callNative(H5Action.Navigate, { path, params })

/** 返回上一页 */
export const goBack = () => callNative(H5Action.GoBack)

/** 关闭当前页面 */
export const close = () => callNative(H5Action.Close)

/** 分享 */
export const share = (opts: H5ActionPayloadMap[typeof H5Action.Share]) =>
  callNative(H5Action.Share, opts)

/** 复制文本到剪贴板 */
export const copyToClipboard = (text: string) =>
  callNative(H5Action.CopyToClipboard, { text })

/** 触觉反馈 */
export const haptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') =>
  callNative(H5Action.HapticFeedback, { type })

/** 显示 Toast */
export const showToast = (message: string, opts?: { type?: 'success' | 'error' | 'info' | 'warning'; duration?: number }) =>
  callNative(H5Action.ShowToast, { message, ...opts })

/** 扫描二维码 */
export const scanQR = () => callNative(H5Action.ScanQR)

/** 打开外部链接 */
export const openExternal = (url: string) =>
  callNative(H5Action.OpenExternal, { url })

/** 埋点上报 */
export const trackEvent = (event: string, props?: Record<string, unknown>) =>
  callNative(H5Action.TrackEvent, { event, props })

/** 设置页面标题 */
export const setTitle = (title: string) =>
  callNative(H5Action.SetTitle, { title })

/** 设置导航栏样式 */
export const setNavBarStyle = (opts: H5ActionPayloadMap[typeof H5Action.SetNavBarStyle]) =>
  callNative(H5Action.SetNavBarStyle, opts)

/** 设置状态栏 */
export const setStatusBar = (opts: H5ActionPayloadMap[typeof H5Action.SetStatusBar]) =>
  callNative(H5Action.SetStatusBar, opts)
