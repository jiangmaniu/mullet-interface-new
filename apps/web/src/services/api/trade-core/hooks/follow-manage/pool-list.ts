import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage, PoolManage } from '../../instance/gen'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'
import { PageDataResponse } from '../../type'

export type PoolManageWrapper = Prettify<
  DeepOverride<Omit<PoolManage, 'id' | 'details' | 'status'>, object> & Required<Pick<PoolManage, 'id'>> & {}
>

export type GetPoolPageListRequestQuery = FollowManage.GetFollowmanagePoollist.RequestQuery

export const useGetPoolPageListApiOptions = (query?: GetPoolPageListRequestQuery) => {
  const getPoolPageListApiOptions = queryOptions({
    queryKey: tradeCoreApiQueriesKey.followManage.poolList.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.getFollowmanagePoollist(query)

      if (rs.data.data) {
        const list = (rs.data.data.records || []).map((item) => {
          return {
            ...item,
          }
        })

        return {
          ...rs.data.data,
          records: list,
        } as PageDataResponse<PoolManageWrapper>
      }

      return null
    }, [query]),
  })

  return { getPoolPageListApiOptions }
}
