import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface ChainTokenInfo {
  symbol: string
  contractAddress: string
  decimals: number
  displayDecimals: number
  displayName: string
  iconUrl: string
  minWithdraw: string
}

export interface WithdrawChainInfo {
  chainId: string
  displayName: string
  shortName: string
  icon: string
  iconUrl: string
  addressRegex: string
  addressPlaceholder: string
  requiresBridge: boolean
  estimatedTime: string
  minWithdraw: string
  supportedTokens: ChainTokenInfo[]
}

/**
 * 获取出金支持的链列表（包含每个链支持的代币）
 * @param tokenSymbol 可选，按币种过滤（USDC / USDT）
 */
export function useWithdrawSupportedChains(tokenSymbol?: string) {
  return useQuery({
    queryKey: ['withdraw', 'chains', tokenSymbol],
    queryFn: async () => {
      const response = await depositRequest<WithdrawChainInfo[]>('/api/withdraw/supportedChains', {
        method: 'GET',
        params: tokenSymbol ? { token: tokenSymbol } : undefined,
      })
      return response.data
    },
  })
}
