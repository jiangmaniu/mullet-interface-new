import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/expo'
import { router } from 'expo-router'
import { Alert } from 'react-native'

import { useAuthStore } from '@/stores/auth'

interface UseBackendLoginOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectOnSuccess?: boolean
}

interface UseBackendLoginReturn {
  loginToBackend: () => Promise<boolean>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

/**
 * 后端登录 Hook
 * 使用 Privy token 登录后端
 * 可用于 Web3 钱包登录和 Privy 邮箱登录
 */
export function useBackendLogin(options: UseBackendLoginOptions = {}): UseBackendLoginReturn {
  const { onSuccess, onError, redirectOnSuccess = true } = options

  const { getAccessToken: getPrivyAccessToken } = usePrivy()
  const { loginWithPrivy: loginBackend } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loginToBackend = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // 获取 Privy token
      const privyToken = await getPrivyAccessToken()
      if (privyToken) {
        console.log('Privy token obtained for backend login')
      }

      // 登录后端
      const success = await loginBackend()

      if (success) {
        console.log('Backend login successful')
        onSuccess?.()

        if (redirectOnSuccess) {
          Alert.alert('成功', '登录成功！', [
            {
              text: '确定',
              onPress: () => {
                router.replace('/' as '/')
              },
            },
          ])
        }
        return true
      } else {
        const errorMsg = '登录失败，请重试'
        setError(errorMsg)
        onError?.(errorMsg)
        return false
      }
    } catch (err: any) {
      console.error('Backend login failed:', err)
      const errorMsg = err.message || '登录失败'
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getPrivyAccessToken, loginBackend, onSuccess, onError, redirectOnSuccess])

  return {
    loginToBackend,
    isLoading,
    error,
    clearError,
  }
}
