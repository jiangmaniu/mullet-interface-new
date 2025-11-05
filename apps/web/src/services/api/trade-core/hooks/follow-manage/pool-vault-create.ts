import { useMutation } from '@tanstack/react-query'

import { FollowManage } from '../../instance/gen'
import { getTradeCoreApiInstance } from '../../instance'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'
import { getQueryClient } from '@/components/providers/react-query-provider/get-query-client'

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
    }
  })

  return createVaultApiMutation
}
