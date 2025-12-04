import { getAccessToken, useLogin, useLogout } from '@privy-io/react-auth'
import { useMutation } from '@tanstack/react-query'

import { useAccountLoginApiMutation } from '@/services/api/blade-auth/hooks/oauth/use-account-login'
import { getTradeCoreApiInstance } from '@/services/api/trade-core/instance'

export const useWalletLogin = () => {
  const loginAccountMutationResult = useAccountLoginApiMutation()
  const { login } = useLogin({
    onComplete: async (params) => {
      console.log(params)
      // mutationResult.mutate()
      accountLogin()
    },
  })

  const accountLogin = async () => {
    const a = await loginAccountMutationResult.mutateAsync({
      grant_type: 'privy_token',
    })
  }
  return {
    connectAndlogin: login,
    accountLogin: accountLogin,
    loginAccountMutationResult,
  }
}

export const useWalletLogout = () => {
  const { logout } = useLogout()
  return logout
}
