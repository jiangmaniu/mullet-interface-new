import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage, PoolManage } from '../../instance/_gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'

export type PoolManageWrapper = Prettify<
  DeepOverride<Omit<PoolManage, 'id' | 'details'>, object> & Required<Pick<PoolManage, 'id'>> & {}
>

export type GetPoolDetailRequestQuery = FollowManage.GetFollowmanagePooldetail.RequestQuery

export const useGetPoolDetailApiOptions = (query: GetPoolDetailRequestQuery) => {
  const getPoolDetailApiOptions = queryOptions({
    enabled: !!query.followManageId,
    queryKey: tradeCoreApiQueriesKey.followManage.poolDetail.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.getFollowmanagePooldetail(query)

      if (rs.data.data) {
        return {
          ...rs.data.data,
        } as PoolManageWrapper
      }

      return null
    }, [query]),
  })

  return { getPoolDetailApiOptions }
}
