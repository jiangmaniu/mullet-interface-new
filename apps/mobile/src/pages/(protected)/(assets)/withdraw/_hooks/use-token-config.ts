import { useMemo } from 'react'

import { DEPOSIT_SOLANA_CHAIN_ID, USDC_TOKEN_SYMBOL } from '@/constants/config/deposit'

import { useWithdrawSupportedTokens } from '../_apis/use-supported-tokens'

export function useUSDCTokenConfig() {
  const { data: tokensConfig } = useWithdrawSupportedTokens(DEPOSIT_SOLANA_CHAIN_ID)

  return useMemo(() => {
    return tokensConfig?.find((t) => t.symbol.toUpperCase() === USDC_TOKEN_SYMBOL.toUpperCase())
  }, [tokensConfig])
}
