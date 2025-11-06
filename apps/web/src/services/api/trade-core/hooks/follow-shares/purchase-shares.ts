import { useMutation } from '@tanstack/react-query'

import { getTradeCoreApiInstance } from '../../instance'
import { FollowShares } from '../../instance/_gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'
import { getQueryClient } from '@/import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client''
import { GetPoolDetailRequestQuery } from '../follow-manage/pool-detail'

export type PurchaseSharesApiMutationParams = FollowShares.PostFollowSharesPurchaseShares.RequestBody

export const usePurchaseSharesApiMutation = () => {
  const purchaseSharesApiMutation = useMutation({
    mutationKey: tradeCoreApiQueriesKey.followShares.purchaseShares.toKey(),
    mutationFn: async (data: PurchaseSharesApiMutationParams) => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followShares.postFollowSharesPurchaseShares(data)

      return rs.data
    },
    onSuccess: (rs, variables, context) => {
      const queryClient = getQueryClient()
      const poolDetailQuery: GetPoolDetailRequestQuery = {
        followManageId: variables.followManageId,
        tradeAccountId: variables.tradeAccountId
      } as GetPoolDetailRequestQuery
      queryClient.invalidateQueries({ queryKey: tradeCoreApiQueriesKey.followManage.poolDetail.toKeyWithArgs(poolDetailQuery) })

      return rs?.data
    }
  })

  return purchaseSharesApiMutation
}
