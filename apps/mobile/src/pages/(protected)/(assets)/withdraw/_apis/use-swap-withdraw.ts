import { useMutation } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

interface SwapWithdrawBaseParams {
  accountId: string
  toToken: string
  usdcAmount: string
  destinationAddress: string
  slippageBps?: number
}

type SwapWithdrawParams = SwapWithdrawBaseParams &
  ({ verifyCode: string; walletSignature?: never } | { verifyCode?: never; walletSignature: string })

interface SwapWithdrawResponse {
  orderId: string
  withdrawId: string
  fromToken: string
  toToken: string
  inputAmount: string
  expectedOutputAmount: string
  minOutputAmount: string
  txHash: string
  status: string
  estimatedTimeSeconds: number
}

interface SwapWithdrawApprovalResponse {
  requiresApproval: true
  approvalId: string
}

/**
 * Swap 出金（USDC → 其他 Token）
 * POST /api/swap/withdraw
 */
export function useSwapWithdraw() {
  return useMutation({
    mutationFn: async (params: SwapWithdrawParams) => {
      console.log('[SwapWithdrawAPI] POST /api/swap/withdraw, params:', JSON.stringify(params, null, 2))
      const response = await depositRequest<SwapWithdrawResponse | SwapWithdrawApprovalResponse>(
        '/api/swap/withdraw',
        {
          method: 'POST',
          data: params,
        },
      )
      console.log('[SwapWithdrawAPI] 响应:', JSON.stringify(response.data, null, 2))
      return response.data
    },
  })
}

export type { SwapWithdrawParams, SwapWithdrawResponse, SwapWithdrawApprovalResponse }
