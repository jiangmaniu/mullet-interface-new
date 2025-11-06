import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useMutation } from '@tanstack/react-query'

import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage } from '../../instance/_gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'
import { GetPoolDetailRequestQuery } from './pool-detail'

export type PoolVaultCloseApiMutationParams = FollowManage.PostFollowManageVaultClose.RequestQuery

export const usePoolCloseVaultApiMutation = () => {
  const closeVaultApiMutation = useMutation({
    mutationKey: tradeCoreApiQueriesKey.followManage.poolVaultClose.toKey(),
    mutationFn: async (data: PoolVaultCloseApiMutationParams) => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.postFollowManageVaultClose(data)

      return rs.data
    },
    onSuccess: (data, variables, context) => {
      const queryClient = getQueryClient()
      queryClient.invalidateQueries({
        queryKey: tradeCoreApiQueriesKey.followManage.poolDetail.toKeyWithArgs({
          followManageId: variables.followManageId!,
        } as GetPoolDetailRequestQuery),
      })
    },
  })

  return closeVaultApiMutation
}
