import { useCallback, useState } from 'react'

import { useAppKit } from '@/lib/appkit'
import { useLoginAuthStore } from '@/stores/login-auth'
import {
  STORAGE_REMOVE_AUTHORIZED,
  STORAGE_REMOVE_CONF_INFO,
  STORAGE_REMOVE_ENV,
  STORAGE_REMOVE_TOKEN,
  STORAGE_REMOVE_USER_INFO,
} from '@/v1/utils/storage'
import { usePrivy } from '@privy-io/expo'

interface UseLogoutReturn {
  logout: () => Promise<void>
  isLoggingOut: boolean
}

/**
 * 统一退出登录 hook
 * 并行清除后端 token、Privy 登录状态、Reown 钱包连接，然后重定向到登录页面
 */
export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout: privyLogout } = usePrivy()
  const { disconnect: disconnectWallet } = useAppKit()
  const { logout: authLogout } = useLoginAuthStore()

  const logout = useCallback(async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await STORAGE_REMOVE_TOKEN()
      await STORAGE_REMOVE_USER_INFO()
      await STORAGE_REMOVE_CONF_INFO()
      await STORAGE_REMOVE_ENV()
      await STORAGE_REMOVE_AUTHORIZED()

      // 并行执行所有退出操作
      const results = await Promise.allSettled([
        // 1. 清除后端 API token（调用后端登出接口 + 清除本地存储）
        authLogout(),
        // 3. 断开 Reown 钱包连接
        disconnectWallet(),
        // 4. 登出 Privy
        privyLogout(),
      ])

      // 记录失败的操作（仅用于调试）
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const operations = ['authLogout', 'tokenStorage.clearAll', 'disconnectWallet', 'privyLogout']
          console.warn(`Logout operation "${operations[index]}" failed:`, result.reason)
        }
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, authLogout, disconnectWallet, privyLogout])

  return {
    logout,
    isLoggingOut,
  }
}
