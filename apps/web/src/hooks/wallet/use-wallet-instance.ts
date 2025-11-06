import { usePrivy } from '@privy-io/react-auth'

export const useConnectedActiveWallet = () => {
  const { user } = usePrivy()
  const wallet = user?.wallet
  return wallet
}
