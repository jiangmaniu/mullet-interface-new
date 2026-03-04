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

interface TokensResponse {
  success: boolean
  data: TokenInfo[]
}

/**
 * 获取全局代币配置（包含每个代币支持的链列表）
 */
export function useSupportedTokens() {
  return useQuery({
    queryKey: ['deposit', 'tokens', 'global'],
    queryFn: async () => {
      const response = await depositRequest<TokensResponse>('/api/deposit/supportedTokens', {
        method: 'GET',
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  })
}
