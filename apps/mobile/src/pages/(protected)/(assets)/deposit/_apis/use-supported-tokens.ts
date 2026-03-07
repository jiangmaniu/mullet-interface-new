import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface DepositTokenInfo {
  iconUrl: string
  symbol: string
  contractAddress: string
  decimals: number
  displayName: string
  displayDecimals: number
  supportedChains: string[] // 该代币支持的链列表
}

/**
 * 获取入金代币配置（包含每个代币支持的链列表）
 * @param chainId 可选，按链筛选（Solana），不传则返回入金支持的全部 token 列表
 */
export function useDepositSupportedTokens(chainId?: string) {
  return useQuery({
    queryKey: ['deposit', 'tokens', chainId],
    queryFn: async () => {
      const response = await depositRequest<DepositTokenInfo[]>('/api/deposit/supportedTokens', {
        method: 'GET',
        params: chainId ? { chain: chainId } : undefined,
      })
      return response.data
    },
  })
}
