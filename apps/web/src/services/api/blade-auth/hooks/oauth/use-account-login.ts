import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useMutation } from '@tanstack/react-query'

import { getBladeAuthApiInstance } from '../../instance/blade-auth'
import { OAuth } from '../../instance/custom-gen'
import { bladeAuthApiQueriesKey } from '../../queries-cache-key'

export type AccountLoginApiMutationParams = OAuth.PostToken.RequestBody

export const useAccountLoginApiMutation = () => {
  const accountLoginApiMutation = useMutation({
    mutationKey: bladeAuthApiQueriesKey.oauth.login.toKey(),
    mutationFn: async (data?: AccountLoginApiMutationParams) => {
      const bladeAuthApi = getBladeAuthApiInstance()
      const rs = await bladeAuthApi.oauth.postToken(data)

      return rs.data
    },
    onSuccess: (data, variables, context) => {
      // const queryClient = getQueryClient()
      // queryClient.invalidateQueries({
      //   queryKey: tradeCoreApiQueriesKey.followManage.poolDetail.toKeyWithArgs({
      //     followManageId: variables.followManageId!,
      //   } as GetPoolDetailRequestQuery),
      // })
      return data
    },
  })

  return accountLoginApiMutation
}
