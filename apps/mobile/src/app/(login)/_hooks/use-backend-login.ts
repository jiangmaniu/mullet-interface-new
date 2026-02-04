import { useMutation } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/expo'
import { router } from 'expo-router'
import { Alert } from 'react-native'

import { useAuthStore } from '@/stores/auth'
import { setLocalUserInfo } from '@/v1/utils/storage'
import { stores } from '@/v1/provider/mobxProvider'

interface UseBackendLoginOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  redirectOnSuccess?: boolean
}

/**
 * 登录成功后导航
 * 如果有上一页则返回，否则跳转首页
 */
const navigateAfterLogin = () => {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace('/' as '/')
  }
}

/**
 * 后端登录 Hook
 * 使用 Privy token 登录后端
 * 可用于 Web3 钱包登录和 Privy 邮箱登录
 */
export function useBackendLogin(options: UseBackendLoginOptions = {}) {
  const { onSuccess, onError, redirectOnSuccess = true } = options

  const { getAccessToken: getPrivyAccessToken } = usePrivy()
  const { loginWithPrivy: loginBackend } = useAuthStore()

  const mutation = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async () => {
      // 获取 Privy token
      const privyToken = await getPrivyAccessToken()
      if (!privyToken) {
        throw new Error('Failed to get Privy token')
      }

      console.log('Privy token obtained for backend login')

      // 登录后端（传入 token）
      const userinfo = await loginBackend(privyToken)

      // 缓存用户信息
      await setLocalUserInfo(userinfo)

      // 重新获取用户信息
      await stores.user.handleLoginSuccess(userinfo)

      console.log('Backend login successful')

      return userinfo
    },
    onSuccess: () => {
      onSuccess?.()

      if (redirectOnSuccess) {
        Alert.alert('成功', '登录成功！', [
          {
            text: '确定',
            onPress: () => {
              navigateAfterLogin()
            },
          },
        ])
      }
    },
    onError: (err: Error) => {
      console.error('Backend login failed:', err)
      onError?.(err.message || '登录失败')
    },
  })

  return {
    loginToBackend: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    clearError: mutation.reset,
    // 额外暴露 mutation 状态
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
  }
}
