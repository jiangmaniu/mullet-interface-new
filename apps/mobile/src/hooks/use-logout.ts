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
 * 清除后端 token、Privy 登录状态、Reown 钱包连接，并重定向到登录页面
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
      // 1. 清除后端 API token（调用后端登出接口 + 清除本地存储）
      await authLogout()

      // 2. 确保本地 token 已清除
      await tokenStorage.clearAll()

      // 3. 断开 Reown 钱包连接
      try {
        await disconnectWallet()
      } catch (error) {
        console.warn('Failed to disconnect wallet:', error)
        // 继续执行，不阻塞退出流程
      }

      // 4. 登出 Privy
      try {
        await privyLogout()
      } catch (error) {
        console.warn('Failed to logout from Privy:', error)
        // 继续执行，不阻塞退出流程
      }

      // 5. 重定向到登录页面
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
