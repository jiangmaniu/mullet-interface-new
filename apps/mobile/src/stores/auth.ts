import { create, type StateCreator } from 'zustand'

import {
  loginWithPrivyToken,
  apiLogout,
  checkAuthStatus,
  tokenStorage,
  setOnTokenExpired,
  type UserInfo,
} from '@/lib/api'
import { setLocalUserInfo } from '@/v1/utils/storage'
import { stores } from '@/v1/provider/mobxProvider'

interface AuthState {
  // 状态
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
  error: string | null

  // Privy token 获取函数（由 Provider 设置）
  getPrivyAccessToken: (() => Promise<string | null>) | null

  // Actions
  setGetPrivyAccessToken: (fn: () => Promise<string | null>) => void
  loginWithPrivy: () => Promise<boolean | UserInfo>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
  clearError: () => void
}

const authStoreCreator: StateCreator<AuthState> = (set, get) => {
  // 设置 token 过期回调
  setOnTokenExpired(async () => {
    const { getPrivyAccessToken } = get()
    if (!getPrivyAccessToken) {
      return false
    }

    try {
      // 尝试获取 Privy token
      const privyToken = await getPrivyAccessToken()
      if (!privyToken) {
        // Privy token 也过期了，需要重新登录
        set({ isAuthenticated: false, user: null })
        return false
      }

      // 使用 Privy token 重新登录后端
      const response = await loginWithPrivyToken(privyToken)

      await setLocalUserInfo(response)
      await stores.user.handleLoginSuccess(response as User.UserInfo)

      set({
        isAuthenticated: true,
        user: response || null,
      })
      return true
    } catch (error) {
      console.error('Auto re-login failed:', error)
      set({ isAuthenticated: false, user: null })
      return false
    }
  })

  return {
    // 初始状态
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
    getPrivyAccessToken: null,

    // 设置 Privy token 获取函数
    setGetPrivyAccessToken: (fn) => {
      set({ getPrivyAccessToken: fn })
    },

    // 使用 Privy token 登录后端
    loginWithPrivy: async () => {
      const { getPrivyAccessToken } = get()
      if (!getPrivyAccessToken) {
        set({ error: 'Privy not initialized' })
        return false
      }

      set({ isLoading: true, error: null })

      try {
        const privyToken = await getPrivyAccessToken()
        if (!privyToken) {
          set({ isLoading: false, error: 'Failed to get Privy token' })
          return false
        }

        const response = await loginWithPrivyToken(privyToken)
        set({
          isAuthenticated: true,
          user: response || null,
          isLoading: false,
        })
        return response
      } catch (error) {
        debugger
        const message = error instanceof Error ? error.message : 'Login failed'
        set({
          isLoading: false,
          error: message,
          isAuthenticated: false,
        })
        return false
      }
    },

    // 登出
    logout: async () => {
      set({ isLoading: true })
      try {
        await apiLogout()
      } finally {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        })
      }
    },

    // 检查认证状态
    checkAuth: async () => {
      set({ isLoading: true })

      try {
        // 先检查本地 token 是否存在
        const token = await tokenStorage.getToken()
        if (!token) {
          set({ isAuthenticated: false, isLoading: false })
          return false
        }

        // 验证 token 是否有效
        const isValid = await checkAuthStatus()
        if (isValid) {
          set({ isAuthenticated: true, isLoading: false })
          return true
        }

        // Token 无效，尝试使用 Privy token 重新登录
        const { getPrivyAccessToken } = get()
        if (getPrivyAccessToken) {
          const privyToken = await getPrivyAccessToken()
          if (privyToken) {
            try {
              const response = await loginWithPrivyToken(privyToken)
              set({
                isAuthenticated: true,
                user: response || null,
                isLoading: false,
              })
              return true
            } catch {
              // Privy token 也无效
            }
          }
        }

        set({ isAuthenticated: false, isLoading: false })
        return false
      } catch {
        set({ isAuthenticated: false, isLoading: false })
        return false
      }
    },

    // 清除错误
    clearError: () => {
      set({ error: null })
    },
  }
}

export const useAuthStore = create<AuthState>(authStoreCreator)
