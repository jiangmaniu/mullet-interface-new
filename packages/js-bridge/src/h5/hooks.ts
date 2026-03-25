/**
 * @mullet/js-bridge/h5/hooks — React Hooks
 */

import { useEffect, useState, useSyncExternalStore } from 'react'
import { fetchDeviceInfo, getAuth, getContextSync, getUserInfo, isInAppSync } from './api'
import { on } from './core'
import { AppEvent, type AppEventPayloadMap, type BridgeContext, type DeviceInfo, type UserInfo } from '../types'

/** 是否在 App WebView 中 */
export function useIsInApp(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => isInAppSync(),
    () => false,
  )
}

/**
 * 同步读取 App 注入的上下文（无需等待 async）
 *
 * @example
 * ```tsx
 * const ctx = useBridgeContext()
 * // ctx?.token, ctx?.device, ctx?.theme 等页面加载即可用
 * ```
 */
export function useBridgeContext(): BridgeContext | null {
  return useSyncExternalStore(
    () => () => {},
    () => getContextSync(),
    () => null,
  )
}

/** 监听 App 事件 */
export function useAppEvent<E extends AppEvent>(
  event: E,
  handler: (payload: AppEventPayloadMap[E]) => void,
): void {
  useEffect(() => on(event, handler), [event, handler])
}

/**
 * 认证信息 — 同步初始化 + 异步更新
 *
 * 首次渲染即可从注入上下文同步拿到 token，无 loading 闪烁。
 * 后续通过 AppEvent.AuthChanged 实时更新。
 */
export function useAppAuth() {
  const ctx = useBridgeContext()
  const [token, setToken] = useState<string | null>(ctx?.token ?? null)
  const [loading, setLoading] = useState(!ctx)
  const inApp = useIsInApp()

  useEffect(() => {
    if (!inApp) {
      setLoading(false)
      return
    }
    // 如果同步上下文已有 token，跳过 async 请求
    if (ctx?.token !== undefined) {
      setToken(ctx.token)
      setLoading(false)
    } else {
      getAuth()
        .then((auth) => setToken(auth.token))
        .catch(() => setToken(null))
        .finally(() => setLoading(false))
    }

    return on(AppEvent.AuthChanged, ({ token }) => setToken(token))
  }, [inApp, ctx?.token])

  return { token, loading }
}

/** 用户信息 — 同步初始化 + 异步更新 */
export function useAppUser() {
  const ctx = useBridgeContext()
  const [user, setUser] = useState<UserInfo | null>(ctx?.user ?? null)
  const [loading, setLoading] = useState(!ctx)
  const inApp = useIsInApp()

  useEffect(() => {
    if (!inApp) { setLoading(false); return }
    if (ctx?.user !== undefined) {
      setUser(ctx.user)
      setLoading(false)
    } else {
      getUserInfo()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false))
    }
    return on(AppEvent.UserChanged, ({ user }) => setUser(user))
  }, [inApp, ctx?.user])

  return { user, loading }
}

/** 主题 — 同步初始化 + 事件更新 */
export function useAppTheme(): 'light' | 'dark' {
  const ctx = useBridgeContext()
  const [theme, setTheme] = useState<'light' | 'dark'>(ctx?.theme ?? 'dark')

  useEffect(() => {
    return on(AppEvent.ThemeChanged, ({ theme }) => {
      setTheme(theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    })
  }, [])

  return theme
}

/** 设备信息 — 同步初始化 */
export function useDeviceInfo(): DeviceInfo | null {
  const ctx = useBridgeContext()
  const [info, setInfo] = useState<DeviceInfo | null>(ctx?.device ?? null)
  const inApp = useIsInApp()

  useEffect(() => {
    if (!inApp || info) return
    fetchDeviceInfo().then(setInfo).catch(() => {})
  }, [inApp, info])

  return info
}

/** 键盘状态 */
export function useKeyboard() {
  const [state, setState] = useState({ visible: false, height: 0 })
  useEffect(() => on(AppEvent.KeyboardChanged, setState), [])
  return state
}
