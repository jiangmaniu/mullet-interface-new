import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useMutation } from '@tanstack/react-query'

import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage } from '../../instance/_gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'

export type PoolVaultCreateApiMutationParams = FollowManage.PostFollowManageCreatePool.RequestBody

export const usePoolCreateVaultApiMutation = () => {
  const createVaultApiMutation = useMutation({
    mutationKey: tradeCoreApiQueriesKey.followManage.poolVaultCreate.toKey(),
    mutationFn: async (data: PoolVaultCreateApiMutationParams) => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.postFollowManageCreatePool(data)

      return rs.data
    },
    onSuccess: (data, variables, context) => {
      const queryClient = getQueryClient()
      queryClient.invalidateQueries({ queryKey: tradeCoreApiQueriesKey.followManage.poolList.toKey() })
    },
  })

  return createVaultApiMutation
}
