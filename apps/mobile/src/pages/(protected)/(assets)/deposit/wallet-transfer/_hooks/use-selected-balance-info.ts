import { useMemo } from 'react'

import { useSolanaWalletBalance } from '../../_apis/use-solana-wallet-balance'
import { useDepositSupportedTokens } from '../../_apis/use-supported-tokens'
import { useDepositState } from '../../_hooks/use-deposit-state'

/**
 * 获取当前选中的代币配置
 * @returns 当前选中的代币配置
 */
export function useSelectedTokenConfig() {
  const { selectedTokenSymbol } = useDepositState()
  const { data: tokensConfig } = useDepositSupportedTokens()

  return useMemo(() => {
    return tokensConfig?.find((t) => t.symbol === selectedTokenSymbol)
  }, [tokensConfig, selectedTokenSymbol])
}

/**
 * 获取当前选中的代币余额
 * @returns 当前选中的代币余额
 */
export function useSelectedTokenBalance() {
  const { fromWalletAddress } = useDepositState()
  const { data: balanceData } = useSolanaWalletBalance(fromWalletAddress)
  const selectedTokenInfo = useSelectedTokenConfig()

  return useMemo(() => {
    return balanceData?.balances.find((b) => b.symbol === selectedTokenInfo?.symbol)
  }, [balanceData, selectedTokenInfo])
}
