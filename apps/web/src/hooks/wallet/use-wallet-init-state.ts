import { usePrivy } from '@privy-io/react-auth'

export function useWalletInitState() {
  const { ready } = usePrivy()

  const isReady = ready
  return {
    isReady,
  }
}
