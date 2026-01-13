import { getAccessToken, useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAtom, useSetAtom } from 'jotai'

import { activeAccountIdAtom } from '@/atoms/user/account'
import { loginInfoAtom, loginUserInfoAtom } from '@/atoms/user/login-info'
import { useAccountLoginApiMutation } from '@/services/api/blade-auth/hooks/oauth/use-account-login'
import { setLocalUserInfo } from '@/v1/utils/storage'

import { useInitialState } from './use-initial-state'

export const useWalletLogin = () => {
  const setLoginInfoAtom = useSetAtom(loginInfoAtom)
  const setLoginUserInfoAtom = useSetAtom(loginUserInfoAtom)
  const setActiveAccountIdAtom = useSetAtom(activeAccountIdAtom)
  const { fetchUserInfo } = useInitialState()
  const loginAccountMutationResult = useAccountLoginApiMutation()
  const { authenticated } = usePrivy()
  const { login: loginPrivy } = useLogin({
    onComplete: async (params) => {
      accountLogin()
    },
  })

  const connectAndlogin = () => {
    if (!authenticated) {
      loginPrivy()
    } else {
      accountLogin()
    }
  }

  const accountLogin = async () => {
    const { loginInfo } = await loginAccountMutationResult.mutateAsync({
      grant_type: 'privy_token',
    })

    setLocalUserInfo(loginInfo as User.UserInfo)
    setLoginInfoAtom(loginInfo)

    await fetchUserInfo?.()

    // loginUserInfo
    // setLoginUserInfoAtom(loginUserInfo)
    // setActiveAccountIdAtom(loginUserInfo?.accountList?.[0]?.id)
  }
  return {
    connectAndlogin: connectAndlogin,
    accountLogin: accountLogin,
    loginAccountMutationResult,
  }
}

export const useWalletLogout = () => {
  const { logout } = useLogout()
  return logout
}
