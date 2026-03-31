import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/utils/deposit-request'

interface WithdrawMessageResponse {
  message: string
  address: string
  timestamp: number
  expiresIn: number
}

/**
 * 获取标准出金签名消息
 * GET /api/verify/withdraw-message
 */
export function useWithdrawMessage(address: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['withdraw', 'message', address],
    queryFn: async () => {
      if (!address) throw new Error('Address is required')
      const response = await depositRequest<WithdrawMessageResponse>('/api/verify/withdraw-message', {
        method: 'GET',
        params: { address },
      })
      return response.data
    },
    // 不要缓存，因为消息需要实时更新
    enabled: !!address && enabled,
    staleTime: 4 * 60 * 1000, // 4分钟，略小于5分钟有效期
    gcTime: 5 * 60 * 1000,
  })
}
