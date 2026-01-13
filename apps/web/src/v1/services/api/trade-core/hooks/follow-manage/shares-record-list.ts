import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getTradeCoreApiInstance } from '../../instance'
import { FollowManage, SharesRecord, TwrRecordVO } from '../../instance/gen'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'
import { PageDataResponse } from '../../type'
import dayjs from 'dayjs'
import { TimeParseEnum } from '@/utils/dayjs'

export type SharesRecordWrapper = Prettify<
  DeepOverride<Omit<SharesRecord, 'id'>, object> & { createTime: number } // & Required<Pick<TwrRecordVO, ''>>
>

export type GetSharesRecordListRequestQuery = FollowManage.GetFollowmanageSharesrecordlist.RequestQuery

export const useGetSharesRecordListApiOptions = (query: GetSharesRecordListRequestQuery) => {
  const getSharesRecordListApiOptions = queryOptions({
    queryKey: tradeCoreApiQueriesKey.followManage.sharesRecordList.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.getFollowmanageSharesrecordlist(query)
      return rs.data
    }, [query]),

    select: (rs) => {
      if (rs.data) {
        const list = rs.data?.records?.map((item) => {
          const createTime = dayjs(item.createTime, TimeParseEnum.default).valueOf()
          return {
            ...item,
            createTime
          }
        })

        return {
          ...rs.data,
          records: list
        } as PageDataResponse<SharesRecordWrapper>
      }

      return null
    }
  })

  return { getSharesRecordListApiOptions }
}
