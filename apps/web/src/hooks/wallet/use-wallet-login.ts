import { useLogin, useLogout } from '@privy-io/react-auth'

import { getTradeCoreApiInstance } from '@/services/api/trade-core/instance'

export const useWalletLogin = () => {
  const { login } = useLogin({
    onComplete: async (params) => {
      console.log(params)
    },
  })
  return login
}

export const useWalletLogout = () => {
  const { logout } = useLogout()
  return logout
}
