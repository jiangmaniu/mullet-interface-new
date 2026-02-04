import { create, type StateCreator } from 'zustand'

import {
  loginWithPrivyToken,
  apiLogout,
  checkAuthStatus,
  tokenStorage,
  type UserInfo,
} from '@/lib/api'

interface AuthState {
  // 状态
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null

  // Actions
  loginWithPrivy: (privyToken: string) => Promise<UserInfo>
  logout: () => Promise<void>
  checkAuth: (getPrivyAccessToken?: () => Promise<string | null>) => Promise<boolean>
}

const authStoreCreator: StateCreator<AuthState> = (set, get) => {
  return {
    // 初始状态
    isAuthenticated: false,
    isLoading: false,
    user: null,

    // 使用 Privy token 登录后端
    loginWithPrivy: async (privyToken: string) => {
      if (!privyToken) {
        throw new Error('Privy token is required')
      }

      set({ isLoading: true })

      try {
        const response = await loginWithPrivyToken(privyToken)
        set({
          isAuthenticated: true,
          user: response || null,
          isLoading: false,
        })
        return response
      } catch (error) {
        set({
          isLoading: false,
          isAuthenticated: false,
        })
        throw error
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
        })
      }
    },

    // 检查认证状态
    checkAuth: async (getPrivyAccessToken?: () => Promise<string | null>) => {
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
  }
}

export const useAuthStore = create<AuthState>(authStoreCreator)
