import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getTradeCrmApiInstance } from '../../instance'
import { Account, Client, ClientAccountListVO } from '../../instance/gen'
import { tradeCrmApiQueriesKey } from '../../queries-cache-key'

export type ClientUserInfo = NonNullable<Client.GetClientDetail.ResponseBody['data']>

export type ClientUserAccount = NonNullable<ClientAccountListVO>

export type ClientUserInfoWrapper = Prettify<
  DeepOverride<Omit<ClientUserInfo, 'id' | 'details'>, object> & Required<Pick<ClientUserInfo, 'id'>> & {}
>

export type GetClientUserInfoRequestQuery = Partial<Client.GetClientDetail.RequestQuery>

export const useGetUserInfoApiOptions = (query: GetClientUserInfoRequestQuery) => {
  const getUserInfoApiOptions = queryOptions({
    enabled: !!query.id,
    queryKey: tradeCrmApiQueriesKey.client.userInfo.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCrmApi = getTradeCrmApiInstance()
      const rs = await tradeCrmApi.client.getClientDetail(query as Client.GetClientDetail.RequestQuery)

      if (rs.data?.data) {
        return rs.data.data as ClientUserInfoWrapper
      }

      return null
    }, [query]),
  })

  return { getUserInfoApiOptions }
}
