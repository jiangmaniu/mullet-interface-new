import { useCallback, useState } from 'react'
import { router } from 'expo-router'
import { CommonActions } from '@react-navigation/native'

import { useAppKit } from '@/lib/appkit'
import { useRootStore } from '@/stores'
import { storageRemove } from '@/lib/storage/storage'
import { STORAGE_KEY_AUTHORIZED, STORAGE_KEY_USER_CONF_INFO, STORAGE_KEY_ENV } from '@/lib/storage/keys'
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
  const { logout: authLogout } = useRootStore((s) => s.user.auth)

  const clearAuthData = useCallback(async () => {
    if (isClearing) return

    setIsClearing(true)

    try {
      // 清除 redirectTo，防止重新登录后跳转回退出前的页面
      useRootStore.getState().user.auth.setAuth({ redirectTo: undefined })

      storageRemove(STORAGE_KEY_USER_CONF_INFO)
      storageRemove(STORAGE_KEY_ENV)
      storageRemove(STORAGE_KEY_AUTHORIZED)

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
 * 主动退出登录 hook（清除数据 + 清空路由堆栈跳转到登录页）
 * 使用 CommonActions.reset 清空路由堆栈，防止用户按返回键回到受保护页面
 */
export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { clearAuthData } = useClearAuthData()

  const logout = useCallback(async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // 先清空路由堆栈跳转到登录页，再清除数据，避免 LoginGuard 检测到 token 为空后重复重定向
      router.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: '(public)' }],
        })
      )
      await clearAuthData()
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
  useRootStore.getState().user.auth.setAuth({ redirectTo: undefined })

  storageRemove(STORAGE_KEY_USER_CONF_INFO)
  storageRemove(STORAGE_KEY_ENV)
  storageRemove(STORAGE_KEY_AUTHORIZED)

  await useRootStore.getState().user.auth.logout()

  router.replace('/login')
}
