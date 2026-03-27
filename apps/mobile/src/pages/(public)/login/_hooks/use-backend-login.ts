import { useMutation } from '@tanstack/react-query'
import { router } from 'expo-router'
import type { LoginType } from '@/stores/user-slice/authSlice'

import { useRootStore } from '@/stores'
import { login } from '@/v1/services/user'
import user from '@/v1/stores/user'
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
    mutationFn: async (loginType?: LoginType) => {
      const privyToken = await getPrivyAccessToken()
      if (!privyToken) {
        throw new Error('Failed to get Privy token')
      }

      // console.log('Privy token obtained for backend login')

      const userinfo = await login({
        grant_type: 'privy_token',
      })

      useRootStore.getState().user.auth.setAuth({
        accessToken: userinfo.access_token,
        loginInfo: userinfo,
        loginType: loginType ?? null,
      })

      // 重新获取用户信息
      await Promise.all([user.fetchUserInfo(true), useRootStore.getState().user.info.fetchLoginClientInfo()])
      const activeTradeAccountId = useRootStore.getState().user.info.activeTradeAccountId
      if (activeTradeAccountId) {
        await useRootStore.getState().market.symbol.fetchInfoList(activeTradeAccountId)
      }

      return userinfo
    },
    onSuccess: () => {
      // 登录成功后跳转回原页面
      const { redirectTo } = useRootStore.getState().user.auth
      if (redirectTo) {
        useRootStore.getState().user.auth.setAuth({ redirectTo: undefined })
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
