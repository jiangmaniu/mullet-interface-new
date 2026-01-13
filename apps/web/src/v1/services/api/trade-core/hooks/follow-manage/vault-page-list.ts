import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getTradeCoreApiInstance } from '../../instance'
import { _10, FollowManage, PoolManage } from '../../instance/gen'
import { PageDataResponse } from '../../type'
import { tradeCoreApiQueriesKey } from '../../queries-eache-key'
import dayjs from 'dayjs'
import { TimeParseEnum } from '@/utils/dayjs'
import { BNumber } from '@/utils/b-number'

export type VaultListItemWrapper = Prettify<
  DeepOverride<Omit<_10, 'id' | 'details' | 'status'>, object> & Required<Pick<_10, 'id'>> & { createTime: number; mySharesValue: string }
>

export type GetVaultPageListRequestQuery = FollowManage.GetFollowmanageVaultpageList.RequestQuery

export const useGetVaultListApiOptions = (query: GetVaultPageListRequestQuery) => {
  const getVaultListApiOptions = queryOptions({
    queryKey: tradeCoreApiQueriesKey.followManage.vaultPageList.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()
      const rs = await tradeCoreApi.followManage.getFollowmanageVaultpageList(query)

      if (rs.data.data) {
        const list = (rs.data.data.records || []).map((item) => {
          const createTime = dayjs(item.createTime, TimeParseEnum.default).valueOf()
          const balance = BNumber.from(item.myShares)?.div(item.totalShares)?.multipliedBy(item.tvl)
          return {
            ...item,
            mySharesValue: balance?.toString(),
            createTime
          }
        })

        return {
          ...rs.data.data,
          records: list
        } as PageDataResponse<VaultListItemWrapper>
      }

      return null
    }, [query])
  })

  return { getVaultListApiOptions }
}
