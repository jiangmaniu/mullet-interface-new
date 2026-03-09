import { useWithdrawStore } from '../_store'

/**
 * 获取 withdraw store 的所有状态（只读）
 */
export function useWithdrawState() {
  const selectedTokenSymbol = useWithdrawStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const withdrawAmount = useWithdrawStore((s) => s.withdrawAmount)
  const fromWalletAddress = useWithdrawStore((s) => s.fromWalletAddress)
  const toWalletAddress = useWithdrawStore((s) => s.toWalletAddress)
  const selectedAccountId = useWithdrawStore((s) => s.selectedAccountId)

  return {
    selectedTokenSymbol,
    selectedChainId,
    withdrawAmount,
    fromWalletAddress,
    toWalletAddress,
    selectedAccountId,
  }
}

/**
 * 获取 withdraw store 的所有 actions
 */
export function useWithdrawActions() {
  const setSelectedTokenSymbol = useWithdrawStore((s) => s.setSelectedTokenSymbol)
  const setSelectedChainId = useWithdrawStore((s) => s.setSelectedChainId)
  const setWithdrawAmount = useWithdrawStore((s) => s.setWithdrawAmount)
  const setFromWalletAddress = useWithdrawStore((s) => s.setFromWalletAddress)
  const setToWalletAddress = useWithdrawStore((s) => s.setToWalletAddress)
  const setSelectedAccountId = useWithdrawStore((s) => s.setSelectedAccountId)
  const reset = useWithdrawStore((s) => s.reset)

  return {
    setSelectedTokenSymbol,
    setSelectedChainId,
    setWithdrawAmount,
    setFromWalletAddress,
    setToWalletAddress,
    setSelectedAccountId,
    reset,
  }
}

/**
 * 获取代币和链的选择状态及其 actions
 */
export function useTokenChainSelection() {
  const selectedTokenSymbol = useWithdrawStore((s) => s.selectedTokenSymbol)
  const selectedChainId = useWithdrawStore((s) => s.selectedChainId)
  const setSelectedTokenSymbol = useWithdrawStore((s) => s.setSelectedTokenSymbol)
  const setSelectedChainId = useWithdrawStore((s) => s.setSelectedChainId)

  return {
    selectedTokenSymbol,
    selectedChainId,
    setSelectedTokenSymbol,
    setSelectedChainId,
  }
}

/**
 * 获取提现地址状态及其 actions
 */
export function useWithdrawAddress() {
  const toWalletAddress = useWithdrawStore((s) => s.toWalletAddress)
  const setToWalletAddress = useWithdrawStore((s) => s.setToWalletAddress)

  return {
    toWalletAddress,
    setToWalletAddress,
  }
}

/**
 * 获取提现金额状态及其 actions
 */
export function useWithdrawAmount() {
  const withdrawAmount = useWithdrawStore((s) => s.withdrawAmount)
  const setWithdrawAmount = useWithdrawStore((s) => s.setWithdrawAmount)

  return {
    withdrawAmount,
    setWithdrawAmount,
  }
}
