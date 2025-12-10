import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getTradeCoreApiInstance } from '../../instance'
import { AccountManage1, FollowShares, PoolManage } from '../../instance/_gen'
import { Account } from '../../instance/gen'
import { tradeCoreApiQueriesKey } from '../../queries-cache-key'

export type FollowSharesWrapper = Prettify<
  DeepOverride<Omit<AccountManage1, 'id' | 'details'>, object> & Required<Pick<PoolManage, 'id'>> & {}
>

export type GetTradeSymbolListRequestQuery = Account.GetAccountTradesymbollist.RequestQuery

export const useGetTradeSymbolListApiOptions = (query?: GetTradeSymbolListRequestQuery) => {
  const getPoolAccountDetailApiOptions = queryOptions({
    enabled: !!query?.accountId,
    queryKey: tradeCoreApiQueriesKey.account.tradeSymbolList.toKeyWithArgs(query),
    placeholderData: keepPreviousData,
    queryFn: useCallback(async () => {
      const tradeCoreApi = getTradeCoreApiInstance()

      try {
        const rs = await tradeCoreApi.account.getAccountTradesymbollist(query)

        if (rs.data?.data) {
          return rs.data.data
        }

        return null
      } catch (error) {
        console.error('Failed to fetch trade symbol list:', error)
        throw error
      }
    }, [query]),
  })

  return { getPoolAccountDetailApiOptions }
}
