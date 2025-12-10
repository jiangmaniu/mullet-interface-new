import { getAccessToken, useLogin, useLogout } from '@privy-io/react-auth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAtom, useSetAtom } from 'jotai'

import { activeAccountIdAtom } from '@/atoms/user/account'
import { loginInfoAtom, loginUserInfoAtom } from '@/atoms/user/login-info'
import { useAccountLoginApiMutation } from '@/services/api/blade-auth/hooks/oauth/use-account-login'

export const useWalletLogin = () => {
  const setLoginInfoAtom = useSetAtom(loginInfoAtom)
  const setLoginUserInfoAtom = useSetAtom(loginUserInfoAtom)
  const setActiveAccountIdAtom = useSetAtom(activeAccountIdAtom)

  const loginAccountMutationResult = useAccountLoginApiMutation()
  const { login } = useLogin({
    onComplete: async (params) => {
      accountLogin()
    },
  })

  const accountLogin = async () => {
    const { loginInfo } = await loginAccountMutationResult.mutateAsync({
      grant_type: 'privy_token',
    })

    // loginUserInfo

    setLoginInfoAtom(loginInfo)
    // setLoginUserInfoAtom(loginUserInfo)
    // setActiveAccountIdAtom(loginUserInfo?.accountList?.[0]?.id)
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
