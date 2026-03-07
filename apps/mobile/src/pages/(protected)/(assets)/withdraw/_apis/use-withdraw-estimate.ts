import { useQuery } from '@tanstack/react-query'

import { depositRequest } from '@/v1/utils/deposit-request'

export interface WithdrawEstimateParams {
  /** 出金金额（USD） */
  amount: number
  /** 目标链 */
  toChain: string
  /** 代币类型 */
  token: string
}

export interface WithdrawEstimateResponse {
  /** 输入金额 */
  inputAmount: string
  /** 链 ID */
  chainId: string
  /** 网络手续费 */
  networkFee: string
  /** 手续费代币 */
  feeToken: string
  /** 预计到账时间 */
  estimatedTime: string
  /** 是否需要审批 */
  requiresApproval: boolean
  /** 审批阈值 */
  approvalThreshold: string
}

/**
 * 获取出金手续费与时间估算
 */
export function useWithdrawEstimate(params: WithdrawEstimateParams, enabled = true) {
  return useQuery({
    queryKey: ['withdraw', 'estimate', params.amount, params.toChain, params.token],
    queryFn: async () => {
      const response = await depositRequest<WithdrawEstimateResponse>('/api/fund-flow/withdraw-estimate', {
        method: 'GET',
        params: {
          amount: params.amount,
          toChain: params.toChain,
          token: params.token,
        },
      })
      return response.data
    },
    enabled: enabled && params.amount > 0,
  })
}
