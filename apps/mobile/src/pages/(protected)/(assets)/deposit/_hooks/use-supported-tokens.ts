import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface TokenInfo {
  iconUrl: string
  symbol: string
  contractAddress: string
  decimals: number
  displayName: string
  displayDecimals: number
  supportedChains: string[] // 该代币支持的链列表
}

/**
 * 获取全局代币配置（包含每个代币支持的链列表）
 * @param chainId 可选，按链筛选（Solana），不传则返回全局去重 token 列表
 */
export function useSupportedTokens(chainId?: string) {
  return useQuery({
    queryKey: ['deposit', 'tokens', chainId],
    queryFn: async () => {
      const response = await depositRequest<TokenInfo[]>('/api/deposit/supportedTokens', {
        method: 'GET',
        params: chainId ? { chain: chainId } : undefined,
      })
      return response.data
    },
  })
}
