import { useMutation } from '@tanstack/react-query'

import { FollowManage } from '../../instance/gen'
import { getTradeCoreApiInstance } from '../../instance'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'
import { getQueryClient } from '@/components/providers/react-query-provider/get-query-client'
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
          followManageId: variables.followManageId!
        } as GetPoolDetailRequestQuery)
      })
    }
  })

  return closeVaultApiMutation
}
