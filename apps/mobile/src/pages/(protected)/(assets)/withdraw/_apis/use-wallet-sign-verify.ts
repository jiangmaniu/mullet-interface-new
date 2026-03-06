import { useMutation } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

/**
 * 钱包签名验证请求参数
 */
export interface WalletSignVerifyRequest {
  userId: string
  address: string
  message: string
  signature: string
  chain?: 'SOL' | 'EVM'
}

/**
 * 钱包签名验证响应
 */
export interface WalletSignVerifyResponse {
  verifyToken: string
  expiresIn: number
  message: string
}

/**
 * 通过钱包签名验证出金所有权
 */
export function useWalletSignVerify() {
  return useMutation({
    mutationFn: async (params: WalletSignVerifyRequest) => {
      const response = await depositRequest<WalletSignVerifyResponse>('/api/verify/wallet-sign', {
        method: 'POST',
        data: {
          userId: params.userId,
          address: params.address,
          message: params.message,
          signature: params.signature,
          chain: params.chain || 'SOL',
        },
      })
      return response.data
    },
  })
}
