import { usePrivy } from '@privy-io/react-auth'

export const useWalletAuthState = () => {
  const { authenticated } = usePrivy()
  const loginToken = undefined

  const isAuthenticated = authenticated
  const isLogin = isAuthenticated && !!loginToken
  return {
    isLogin,
    isAuthenticated,
  }
}
