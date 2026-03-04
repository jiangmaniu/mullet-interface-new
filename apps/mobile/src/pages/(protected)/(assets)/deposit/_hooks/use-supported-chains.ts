import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface ChainTokenInfo {
  symbol: string
  contractAddress: string
  decimals: number
  displayName: string
}

export interface ChainInfo {
  chainId: string
  displayName: string
  shortName: string
  iconUrl: string // 链的图标 URL
  nativeToken: string
  minDeposit: string
  estimatedTime: string
  requiresBridge: boolean
  supportedTokens: ChainTokenInfo[]
}

interface ChainsResponse {
  success: boolean
  data: ChainInfo[]
}

/**
 * 获取支持的链列表（包含每个链支持的代币）
 */
export function useSupportedChains() {
  return useQuery({
    queryKey: ['deposit', 'chains'],
    queryFn: async () => {
      const response = await depositRequest<ChainsResponse>('/api/deposit/supportedChains', {
        method: 'GET',
      })
      return response.data
    },
  })
}
