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
  /** 输入的出金金额（USDC） */
  inputAmount: string
  /** 目标链 */
  chainId: string
  /** 链上 Gas 费用（原生代币计价，如 SOL / ETH） */
  networkFee: string
  /** Gas 费用代币符号 */
  feeToken: string
  /** Gas 费用折合 USDC 的近似值（仅供展示用，实际从原生代币钱包扣除） */
  networkFeeUsdc: string
  /** 平台服务费率（固定 0.01%） */
  serviceFeeRate: string
  /** 本次出金的服务费金额（USDC，从出金金额中扣除） */
  serviceFee: string
  /** 预计到账 USDC 数量（= 出金金额 − 服务费，Gas 另由原生代币支付） */
  estimatedReceiveAmount: string
  /** 预计到账时间 */
  estimatedTime: string
  /** 是否需要人工审批（≥ 10000 USDC 触发） */
  requiresApproval: boolean
  /** 人工审批阈值（USDC） */
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
