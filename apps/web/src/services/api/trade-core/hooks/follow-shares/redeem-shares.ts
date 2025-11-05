import { useMutation } from '@tanstack/react-query'

import { FollowShares } from '../../instance/gen'
import { getTradeCoreApiInstance } from '../../instance'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'
import { getQueryClient } from '@/components/providers/react-query-provider/get-query-client'
import { GetPoolDetailRequestQuery } from '../follow-manage/pool-detail'

export type RedeemSharesApiMutationParams = FollowShares.PostFollowSharesRedeemShares.RequestBody

export const useRedeemSharesApiMutation = () => {
  const redeemSharesApiMutation = useMutation({
    mutationKey: tradeCoreApiQueriesKey.followShares.redeemShares.toKey(),
    mutationFn: async (data: RedeemSharesApiMutationParams) => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followShares.postFollowSharesRedeemShares(data)

      return rs.data
    },
    onSuccess: (data, variables, context) => {
      const queryClient = getQueryClient()
      const poolDetailQuery: GetPoolDetailRequestQuery = {
        followManageId: variables.followManageId,
        tradeAccountId: variables.tradeAccountId
      } as GetPoolDetailRequestQuery
      queryClient.invalidateQueries({ queryKey: tradeCoreApiQueriesKey.followManage.poolDetail.toKeyWithArgs(poolDetailQuery) })
    }
  })

  return redeemSharesApiMutation
}
