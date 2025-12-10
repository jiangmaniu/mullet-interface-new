import { usePrivy } from '@privy-io/react-auth'
import { useAtomValue } from 'jotai'

import { loginInfoAtom } from '@/atoms/user/login-info'

import { useLoginUserInfo } from '../user/use-login-user-info'

export const useWalletAuthState = () => {
  const { authenticated } = usePrivy()
  const { loginUserInfo } = useLoginUserInfo()
  const loginInfo = useAtomValue(loginInfoAtom)
  const loginToken = loginInfo?.access_token

  const isAuthenticated = authenticated
  const isLogin = isAuthenticated && !!loginToken && !!loginUserInfo
  console.log('isLogin', isAuthenticated, isLogin, loginUserInfo)

  return {
    isLogin,
    isAuthenticated,
  }
}
