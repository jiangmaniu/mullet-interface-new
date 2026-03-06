import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

/**
 * 检查验证 token 响应
 */
export interface CheckVerifyTokenResponse {
  valid: boolean
  message?: string
}

/**
 * 检查验证 token 是否有效
 */
export function useCheckVerifyToken(verifyToken?: string) {
  return useQuery({
    queryKey: ['verify', 'check-token', verifyToken],
    queryFn: async () => {
      if (!verifyToken) {
        throw new Error('verifyToken is required')
      }

      const response = await depositRequest<CheckVerifyTokenResponse>('/api/verify/check-token', {
        method: 'GET',
        params: { verifyToken },
      })
      return response.data
    },
    enabled: !!verifyToken,
  })
}
