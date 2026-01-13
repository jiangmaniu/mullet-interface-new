import { usePrivy } from '@privy-io/react-auth'
import { useAtomValue } from 'jotai'

import { loginInfoAtom, loginTokenAtom } from '@/atoms/user/login-info'
import { STORAGE_GET_TOKEN } from '@/v1/utils/storage'

// import { useLoginUserInfo } from '../user/use-login-user-info'

export const useWalletAuthState = () => {
  const { authenticated } = usePrivy()
  // const { loginUserInfo } = useLoginUserInfo()
  const loginToken = useAtomValue(loginTokenAtom)

  // const isAuthenticated = authenticated
  // const isLogin = isAuthenticated && !!loginToken && !!loginUserInfo
  // console.log('isLogin', isAuthenticated, isLogin, loginUserInfo)

  const isAuthenticated = authenticated
  const isLogin = isAuthenticated && !!loginToken
  return {
    isLogin,
    isAuthenticated,
  }
}
