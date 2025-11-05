import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage, TwrRecordVO } from '../../instance/gen'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'

export type TWRRecordListWrapper = Prettify<
  DeepOverride<Omit<TwrRecordVO, 'id'>, object> & {} // & Required<Pick<TwrRecordVO, ''>>
>

export type GetTWRRecordListRequestQuery = FollowManage.GetFollowmanageTwrrecordlist.RequestQuery

export const useGetTWRRecordListApiOptions = (query: GetTWRRecordListRequestQuery) => {
  const getTWRRecordListApiOptions = queryOptions({
    queryKey: tradeCoreApiQueriesKey.followManage.twrRecordList.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.getFollowmanageTwrrecordlist(query)

      return rs.data
    }, [query])
    // select: (rs) => {
    //   if (rs.data) {
    //     const list = rs.data?.map((item) => {
    //       return {
    //         ...item
    //       }
    //     })

    //     return {
    //       ...rs.data,
    //       records: list
    //     } as TWRRecordListWrapper
    //   }

    //   return null
    // }
  })

  return { getTWRRecordListApiOptions }
}
