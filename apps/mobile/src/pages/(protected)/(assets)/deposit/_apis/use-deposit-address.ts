import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface DepositAddressTokenInfo {
  symbol: string
  contractAddress: string
  decimals: number
  displayDecimals: number
  displayName: string
  iconUrl: string
  minDeposit: string
}

export interface DepositAddressInfo {
  chain: string
  displayName: string
  shortName: string
  iconUrl: string // 链图标 URL
  address: string
  walletId: string
  walletCreated: boolean
  nativeToken: string
  supportedTokens: DepositAddressTokenInfo[]
  requiresBridge: boolean
  minDeposit: string
  estimatedTime: string
  tips: string[]
}

/**
 * 获取用户在指定链上的充值地址
 * @param chainId - 链 chainId（如 SOL / ETH / TRON）
 * @param tradeAccountId - 交易账户 ID
 */
export function useDepositAddress(chainId: string, tradeAccountId: string) {
  return useQuery({
    queryKey: ['deposit', 'address', chainId, tradeAccountId],
    queryFn: async () => {
      const response = await depositRequest<DepositAddressInfo>('/api/deposit/address', {
        method: 'GET',
        params: {
          chain: chainId,
          tradeAccountId,
        },
      })
      return response.data
    },
    enabled: !!chainId && !!tradeAccountId, // 只有当两个参数都存在时才执行查询
  })
}
