import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useMutation } from '@tanstack/react-query'

import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage } from '../../instance/_gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'
import { GetPoolDetailRequestQuery } from './pool-detail'

export type PoolVaultDivvyApiMutationParams = FollowManage.PostFollowManageVaultDivvy.RequestBody

export const usePoolVaultDivvyApiMutation = () => {
  const divvyVaultApiMutation = useMutation({
    mutationKey: tradeCoreApiQueriesKey.followManage.poolVaultDivvy.toKey(),
    mutationFn: async (data: PoolVaultDivvyApiMutationParams) => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.postFollowManageVaultDivvy(data)

      return rs.data
    },
    onSuccess: (data, variables, context) => {
      const queryClient = getQueryClient()
      queryClient.invalidateQueries({
        queryKey: tradeCoreApiQueriesKey.followManage.poolDetail.toKeyWithArgs({
          followManageId: variables.followManageId!,
        } as GetPoolDetailRequestQuery),
      })

      if (data.success && data.data) {
        return data.data
      }

      return null
    },
  })

  return divvyVaultApiMutation
}
