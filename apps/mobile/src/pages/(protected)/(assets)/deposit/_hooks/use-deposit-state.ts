import { useDepositStore } from '../_store'

/**
 * 获取 deposit store 的所有状态（只读）
 */
export function useDepositState() {
  const selectedTokenSymbol = useDepositStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useDepositStore((s) => s.selectedChainId)
  const selectedAccountId = useDepositStore((s) => s.selectedAccountId)
  const fromWalletAddress = useDepositStore((s) => s.fromWalletAddress)
  const toWalletAddress = useDepositStore((s) => s.toWalletAddress)
  const depositAmount = useDepositStore((s) => s.depositAmount)

  return {
    selectedTokenSymbol,
    selectedChainId,
    selectedAccountId,
    fromWalletAddress,
    toWalletAddress,
    depositAmount,
  }
}

/**
 * 获取 deposit store 的所有 actions
 */
export function useDepositActions() {
  const setSelectedTokenSymbol = useDepositStore((s) => s.setSelectedTokenSymbol)
  const setSelectedChainId = useDepositStore((s) => s.setSelectedChainId)
  const setSelectedAccountId = useDepositStore((s) => s.setSelectedAccountId)
  const setFromWalletAddress = useDepositStore((s) => s.setFromWalletAddress)
  const setToWalletAddress = useDepositStore((s) => s.setToWalletAddress)
  const setDepositAmount = useDepositStore((s) => s.setDepositAmount)
  const reset = useDepositStore((s) => s.reset)

  return {
    setSelectedTokenSymbol,
    setSelectedChainId,
    setSelectedAccountId,
    setFromWalletAddress,
    setToWalletAddress,
    setDepositAmount,
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
