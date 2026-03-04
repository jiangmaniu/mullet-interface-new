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

interface DepositAddressResponse {
  success: boolean
  data: DepositAddressInfo
}

/**
 * 获取用户在指定链上的充值地址
 * @param chain - 链 chainId（如 SOL / ETH / TRON）
 * @param tradeAccountId - 交易账户 ID
 */
export function useDepositAddress(chain: string, tradeAccountId: string) {
  return useQuery({
    queryKey: ['deposit', 'address', chain, tradeAccountId],
    queryFn: async () => {
      const response = await depositRequest<DepositAddressResponse>('/api/deposit/address', {
        method: 'GET',
        params: {
          chain,
          tradeAccountId,
        },
      })
      return response.data
    },
    enabled: !!chain && !!tradeAccountId, // 只有当两个参数都存在时才执行查询
  })
}
