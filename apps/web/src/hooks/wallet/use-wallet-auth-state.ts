import { usePrivy } from '@privy-io/react-auth'

export const useWalletAuthState = () => {
  const { authenticated } = usePrivy()

  const isAuthenticated = authenticated
  const isLogin = isAuthenticated
  return {
    isLogin,
    isAuthenticated,
  }
}
