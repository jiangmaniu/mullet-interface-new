import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getTradeCoreApiInstance } from '../../instance'
import { AccountManage1, FollowShares, PoolManage } from '../../instance/_gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'

export type FollowSharesWrapper = Prettify<
  DeepOverride<Omit<AccountManage1, 'id' | 'details'>, object> & Required<Pick<PoolManage, 'id'>> & {}
>

export type GetPoolAccountDetailRequestQuery = FollowShares.GetFollowsharesSharesdetail.RequestQuery

export const useGetPoolAccountDetailApiOptions = (query: GetPoolAccountDetailRequestQuery) => {
  const getPoolAccountDetailApiOptions = queryOptions({
    enabled: !!query.followSharesId,
    queryKey: tradeCoreApiQueriesKey.followShares.poolAccountDetail.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followShares.getFollowsharesSharesdetail(query)

      if (rs.data.data) {
        return {
          ...rs.data.data,
        } as FollowSharesWrapper
      }

      return null
    }, [query]),
  })

  return { getPoolAccountDetailApiOptions }
}
