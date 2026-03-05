import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface WithdrawTokenInfo {
  symbol: string
  displayName: string
  iconUrl: string
  supportedChains: string[] // 该代币支持的链列表
  minWithdraw: string
}

/**
 * 获取出金代币配置（包含每个代币支持的链列表）
 * @param chainId 可选，按链筛选（Solana），不传则返回出金支持的全部 token 列表
 */
export function useWithdrawSupportedTokens(chainId?: string) {
  return useQuery({
    queryKey: ['withdraw', 'tokens', chainId],
    queryFn: async () => {
      const response = await depositRequest<WithdrawTokenInfo[]>('/api/withdraw/supportedTokens', {
        method: 'GET',
        params: chainId ? { chain: chainId } : undefined,
      })
      return response.data
    },
  })
}
