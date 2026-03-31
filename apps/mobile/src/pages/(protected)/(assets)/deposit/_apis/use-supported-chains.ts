import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/utils/deposit-request'

export interface DepositChainTokenInfo {
  symbol: string
  contractAddress: string
  decimals: number
  displayName: string
}

export interface DepositChainInfo {
  chainId: string
  displayName: string
  shortName: string
  iconUrl: string // 链的图标 URL
  nativeToken: string
  minDeposit: string
  estimatedTime: string
  requiresBridge: boolean
  supportedTokens: DepositChainTokenInfo[]
}

/**
 * 获取入金支持的链列表（包含每个链支持的代币）
 * @param tokenSymbol 可选，按币种过滤（USDC / USDT）
 */
export function useDepositSupportedChains(tokenSymbol?: string) {
  return useQuery({
    queryKey: ['deposit', 'chains', tokenSymbol],
    queryFn: async () => {
      const response = await depositRequest<DepositChainInfo[]>('/api/deposit/supportedChains', {
        method: 'GET',
        params: tokenSymbol ? { token: tokenSymbol } : undefined,
      })
      return response.data
    },
  })
}
