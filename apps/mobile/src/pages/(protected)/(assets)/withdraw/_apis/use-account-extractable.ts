import { useQuery } from '@tanstack/react-query'

import { request } from '@/utils/request'

interface AccountExtractableResponse {
  code: number
  success: boolean
  data: number
  msg: string
}

/**
 * 获取交易账户可提取余额
 * @param accountId 账户ID
 */
export function useAccountExtractable(accountId?: string) {
  return useQuery({
    queryKey: ['withdraw', 'account', 'extractable', accountId],
    queryFn: async () => {
      const response = await request<AccountExtractableResponse>(
        '/api/trade-node/coreApi/account/account/extractable',
        {
          method: 'GET',
          params: { accountId },
        },
      )
      return response.data
    },
    enabled: !!accountId,
  })
}
