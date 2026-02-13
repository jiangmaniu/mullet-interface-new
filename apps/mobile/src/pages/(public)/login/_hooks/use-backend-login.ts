import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'

import { useLoginAuthStore } from '@/stores/login-auth'
import { stores } from '@/v1/provider/mobxProvider'
import { login } from '@/v1/services/user'
import { setLocalUserInfo } from '@/v1/utils/storage'
import { usePrivy } from '@privy-io/expo'

interface UseBackendLoginOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * 后端登录 Hook
 * 使用 Privy token 登录后端
 * 可用于 Web3 钱包登录和 Privy 邮箱登录
 */
export function useBackendLogin(options: UseBackendLoginOptions = {}) {
  const { onSuccess, onError } = options

  const { getAccessToken: getPrivyAccessToken } = usePrivy()

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
      const userinfo = await login({
        grant_type: 'privy_token',
      })

      useLoginAuthStore.setState({
        accessToken: userinfo.access_token,
        loginInfo: userinfo,
      })

      // 缓存用户信息
      await setLocalUserInfo(userinfo)

      // 重新获取用户信息
      await stores.user.handleLoginSuccess(userinfo)
      console.log('Backend login successful')

      return userinfo
    },
    onSuccess: () => {
      // 登录成功后跳转回原页面
      const { redirectTo, setRedirectTo } = useLoginAuthStore.getState()
      if (redirectTo) {
        setRedirectTo(undefined)
        router.replace(redirectTo as '/')
      } else {
        router.replace('/')
      }

      onSuccess?.()
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
