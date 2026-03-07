import { useCallback, useState } from 'react'
import { router } from 'expo-router'

import { useAppKit } from '@/lib/appkit'
import { useLoginAuthStore } from '@/stores/login-auth'
import { STORAGE_REMOVE_AUTHORIZED, STORAGE_REMOVE_CONF_INFO, STORAGE_REMOVE_ENV } from '@/v1/utils/storage'
import { usePrivy } from '@privy-io/expo'

interface UseClearAuthDataReturn {
  clearAuthData: () => Promise<void>
  isClearing: boolean
}

interface UseLogoutReturn {
  logout: () => Promise<void>
  isLoggingOut: boolean
}

/**
 * 清除登录数据 hook（不跳转路由）
 * 并行清除后端 token、Privy 登录状态、Reown 钱包连接
 */
export function useClearAuthData(): UseClearAuthDataReturn {
  const [isClearing, setIsClearing] = useState(false)
  const { logout: privyLogout } = usePrivy()
  const { disconnect: disconnectWallet } = useAppKit()
  const { logout: authLogout } = useLoginAuthStore()

  const clearAuthData = useCallback(async () => {
    if (isClearing) return

    setIsClearing(true)

    try {
      // 清除 redirectTo，防止重新登录后跳转回退出前的页面
      useLoginAuthStore.getState().setRedirectTo(undefined)

      await STORAGE_REMOVE_CONF_INFO()
      await STORAGE_REMOVE_ENV()
      await STORAGE_REMOVE_AUTHORIZED()

      // 并行执行所有退出操作
      const results = await Promise.allSettled([
        // 1. 清除后端 API token（调用后端登出接口 + 清除本地存储）
        authLogout(),
        // 2. 断开 Reown 钱包连接
        disconnectWallet(),
        // 3. 登出 Privy
        privyLogout(),
      ])

      // 记录失败的操作（仅用于调试）
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['authLogout', 'disconnectWallet', 'privyLogout']
          console.warn(`Clear auth data operation "${operations[index]}" failed:`, result.reason)
        }
      })
    } catch (error) {
      console.error('Clear auth data failed:', error)
    } finally {
      setIsClearing(false)
    }
  }, [isClearing, authLogout, disconnectWallet, privyLogout])

  return {
    clearAuthData,
    isClearing,
  }
}

/**
 * 退出登录 hook（清除数据 + 跳转到登录页）
 */
export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { clearAuthData } = useClearAuthData()

  const logout = useCallback(async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await clearAuthData()
      router.replace('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, clearAuthData])

  return {
    logout,
    isLoggingOut,
  }
}

/**
 * 后端自动退出登录（用于 401 等场景）
 * 清除所有认证数据并跳转到登录页
 */
export const onBackendLogout = async () => {
  // 清除 redirectTo，防止重新登录后跳转回退出前的页面
  useLoginAuthStore.getState().setRedirectTo(undefined)

  await Promise.all([
    STORAGE_REMOVE_CONF_INFO(),
    STORAGE_REMOVE_ENV(),
    STORAGE_REMOVE_AUTHORIZED(),
    useLoginAuthStore.getState().logout(),
  ])

  router.replace('/login')
}
