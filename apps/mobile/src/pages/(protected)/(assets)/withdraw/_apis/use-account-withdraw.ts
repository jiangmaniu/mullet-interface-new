import { useMutation } from '@tanstack/react-query'

import { request } from '@/v1/utils/request'

/**
 * 交易账户出金请求参数
 */
export interface AccountWithdrawalDTO {
  /** 转出交易账户ID */
  tradeAccountId: string
  /** 金额 */
  amount: string
  /** 转出地址 */
  toAddress?: string
  /** 是否SWAP */
  isSwap: boolean
  /** SWAP到某链 */
  swapChain?: string
  /** SWAP到某链的Token */
  swapChainToken?: string
  /** 备注 */
  remark?: string
}

interface AccountWithdrawResponse {
  code: number
  success: boolean
  data: string
  msg: string
}

/**
 * 交易账户出金
 */
export function useAccountWithdraw() {
  return useMutation({
    mutationFn: async (params: AccountWithdrawalDTO) => {
      const response = await request<AccountWithdrawResponse>('/api/trade-node/coreApi/account/withdraw', {
        method: 'POST',
        data: params,
      })

      return response.data
    },
  })
}
