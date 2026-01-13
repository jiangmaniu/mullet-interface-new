import { usePrivy } from '@privy-io/react-auth'
import { useStandardWallets } from '@privy-io/react-auth/solana'

export const useUserWallet = () => {
  const { user } = usePrivy()
  const wallet = user?.wallet
  return wallet
}

export const useUserConnectedWallet = () => {
  const { wallets } = useStandardWallets()
  const wallet = wallets[0]
  return wallet
}
