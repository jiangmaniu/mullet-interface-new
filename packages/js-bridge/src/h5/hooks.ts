/**
 * @mullet/js-bridge/h5/hooks — React Hooks
 */

import { useEffect, useState } from 'react'
import { fetchDeviceInfo, getAuth, getContextSync, getUserInfo, isInAppSync } from './api'
import { on } from './core'
import { AppEvent, type AppEventPayloadMap, type BridgeContext, type DeviceInfo, type UserInfo } from '../types'

/** 是否在 App WebView 中（页面加载后不会变化，初始化一次即可） */
export function useIsInApp(): boolean {
  return useState(isInAppSync)[0]
}

/**
 * 同步读取 App 注入的上下文（页面加载前已注入，不会变化）
 *
 * @example
 * ```tsx
 * const ctx = useBridgeContext()
 * // ctx?.token, ctx?.device, ctx?.theme 等页面加载即可用
 * ```
 */
export function useBridgeContext(): BridgeContext | null {
  return useState(getContextSync)[0]
}

/** 监听 App 事件 */
export function useAppEvent<E extends AppEvent>(
  event: E,
  handler: (payload: AppEventPayloadMap[E]) => void,
): void {
  useEffect(() => on(event, handler), [event, handler])
}

/**
 * 认证信息 — 异步获取 + 事件更新
 */
export function useAppAuth() {
  const inApp = useIsInApp()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(inApp)

  useEffect(() => {
    if (!inApp) return

    getAuth()
      .then((auth) => setToken(auth.token))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))

    return on(AppEvent.AuthChanged, ({ token }) => setToken(token))
  }, [inApp])

  return { token, loading }
}

/** 用户信息 — 异步获取 + 事件更新 */
export function useAppUser() {
  const inApp = useIsInApp()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(inApp)

  useEffect(() => {
    if (!inApp) return

    getUserInfo()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))

    return on(AppEvent.UserChanged, ({ user }) => setUser(user))
  }, [inApp])

  return { user, loading }
}

/** 主题 — 同步初始化 + 事件更新（仅返回值，DOM class 由 initTheme 统一管理） */
export function useAppTheme(): 'light' | 'dark' {
  const ctx = useBridgeContext()
  const [theme, setTheme] = useState<'light' | 'dark'>(ctx?.theme ?? 'dark')

  useEffect(() => {
    if (!isInAppSync()) return
    return on(AppEvent.ThemeChanged, ({ theme }) => setTheme(theme))
  }, [])

  return theme
}

/** 设备信息 — 同步初始化，非 App 环境返回 null */
export function useDeviceInfo(): DeviceInfo | null {
  const inApp = useIsInApp()
  const ctx = useBridgeContext()
  const [info, setInfo] = useState<DeviceInfo | null>(ctx?.device ?? null)

  useEffect(() => {
    if (!inApp || info) return
    fetchDeviceInfo().then(setInfo).catch(() => {})
  }, [inApp]) // eslint-disable-line react-hooks/exhaustive-deps

  return info
}

/** 键盘状态（仅 App 内有效） */
export function useKeyboard() {
  const [state, setState] = useState({ visible: false, height: 0 })
  useEffect(() => {
    if (!isInAppSync()) return
    return on(AppEvent.KeyboardChanged, setState)
  }, [])
  return state
}
