import { useDepositStore } from '../_store'

/**
 * 获取 deposit store 的所有状态（只读）
 */
export function useDepositState() {
  const selectedTokenSymbol = useDepositStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useDepositStore((s) => s.selectedChainId)
  const selectedAccountId = useDepositStore((s) => s.selectedAccountId)
  const depositWalletAddress = useDepositStore((s) => s.depositWalletAddress)

  return {
    selectedTokenSymbol,
    selectedChainId,
    selectedAccountId,
    depositWalletAddress,
  }
}

/**
 * 获取 deposit store 的所有 actions
 */
export function useDepositActions() {
  const setSelectedTokenSymbol = useDepositStore((s) => s.setSelectedTokenSymbol)
  const setSelectedChainId = useDepositStore((s) => s.setSelectedChainId)
  const setSelectedAccountId = useDepositStore((s) => s.setSelectedAccountId)
  const setDepositWalletAddress = useDepositStore((s) => s.setDepositWalletAddress)
  const reset = useDepositStore((s) => s.reset)

  return {
    setSelectedTokenSymbol,
    setSelectedChainId,
    setSelectedAccountId,
    setDepositWalletAddress,
    reset,
  }
}

/**
 * 获取代币和链的选择状态及其 actions
 */
export function useTokenChainSelection() {
  const selectedTokenSymbol = useDepositStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useDepositStore((s) => s.selectedChainId)
  const setSelectedTokenSymbol = useDepositStore((s) => s.setSelectedTokenSymbol)
  const setSelectedChainId = useDepositStore((s) => s.setSelectedChainId)

  return {
    selectedTokenSymbol,
    selectedChainId,
    setSelectedTokenSymbol,
    setSelectedChainId,
  }
}

/**
 * 获取充值地址状态及其 actions
 */
export function useDepositAddress() {
  const depositWalletAddress = useDepositStore((s) => s.depositWalletAddress)
  const setDepositWalletAddress = useDepositStore((s) => s.setDepositWalletAddress)

  return {
    depositWalletAddress,
    setDepositWalletAddress,
  }
}
