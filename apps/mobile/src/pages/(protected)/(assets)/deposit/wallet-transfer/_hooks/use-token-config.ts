import { useMemo } from 'react'

import { USDC_TOKEN_SYMBOL } from '@/constants/config/deposit'

import { useDepositSupportedTokens } from '../../_apis/use-supported-tokens'

export function useUSDCTokenConfig() {
  const { data: tokensConfig } = useDepositSupportedTokens()

  return useMemo(() => {
    return tokensConfig?.find((t) => t.symbol.toUpperCase() === USDC_TOKEN_SYMBOL.toUpperCase())
  }, [tokensConfig])
}
