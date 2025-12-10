import { getQueryClient } from '@/components/providers/global/react-query-provider/get-query-client'
import { useMutation } from '@tanstack/react-query'

import { ClientUserInfoWrapper } from '@/services/api/trade-crm/hooks/client/user-info'
import { getTradeCrmApiInstance } from '@/services/api/trade-crm/instance'
import { tradeCrmApiQueriesKey } from '@/services/api/trade-crm/queries-cache-key'

import { getBladeAuthApiInstance } from '../../instance/blade-auth'
import { OAuth } from '../../instance/custom-gen'
import { HttpResponse } from '../../instance/gen'
import { bladeAuthApiQueriesKey } from '../../queries-cache-key'

// export type AccountLoginApiMutationParams = Token.PostToken.RequestBody
export type AccountLoginApiMutationParams = OAuth.PostToken.RequestBody

export type AccountLoginApiMutationResultData = OAuth.PostToken.ResponseBody

export const useAccountLoginApiMutation = () => {
  const accountLoginApiMutation = useMutation({
    mutationKey: bladeAuthApiQueriesKey.oauth.login.toKey(),
    mutationFn: async (data: AccountLoginApiMutationParams) => {
      const bladeAuthApi = getBladeAuthApiInstance()
      const loginRes = (await bladeAuthApi.token.postToken(
        data as any,
      )) as unknown as HttpResponse<OAuth.PostToken.ResponseBody>

      const loginInfo = loginRes.data
      // const tradeCrmApi = getTradeCrmApiInstance()
      // const userInfoRes = await tradeCrmApi.client.getClientDetail({
      //   id: Number(loginInfo?.user_id),
      // })
      // const loginUserInfo = userInfoRes.data.data as ClientUserInfoWrapper
      // return {
      //   loginUserInfo,
      //   loginInfo,
      // }
      return { loginInfo }
    },
    onSuccess: (data, variables, context) => {
      // const queryClient = getQueryClient()
      // if (data.user_id) {
      //   queryClient.fetchQuery({
      //     queryKey: tradeCrmApiQueriesKey.client.userInfo.toKeyWithArgs({
      //       id: Number(data.user_id),
      //     }),
      //   })
      // }

      return data
    },
  })

  return accountLoginApiMutation
}
