import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/expo'
import { router } from 'expo-router'

import { useAppKit } from '@/lib/appkit'
import { useAuthStore } from '@/stores/auth'
import { tokenStorage } from '@/lib/api'

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
  const { logout: authLogout } = useAuthStore()

  const logout = useCallback(async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // 并行执行所有退出操作
      const results = await Promise.allSettled([
        // 1. 清除后端 API token（调用后端登出接口 + 清除本地存储）
        authLogout(),
        // 2. 清除本地 token
        tokenStorage.clearAll(),
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

      // 重定向到登录页面
      router.replace('/(login)')
    } catch (error) {
      console.error('Logout failed:', error)
      // 即使出错也尝试重定向到登录页面
      router.replace('/(login)')
    } finally {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, authLogout, disconnectWallet, privyLogout])

  return {
    logout,
    isLoggingOut,
  }
}
