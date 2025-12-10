import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

import { useGetTradeSymbolListApiOptions } from '@/services/api/trade-core/hooks/account/symbol'

import { TradeSymbolPageParams } from '../layout'
import { useActiveAccountInfo } from './use-active-account-info'

export const useActiveTradeSymbolInfo = () => {
  const { activeAccountInfo } = useActiveAccountInfo()
  const { symbol } = useParams<TradeSymbolPageParams>()

  const { getPoolAccountDetailApiOptions } = useGetTradeSymbolListApiOptions({
    accountId: activeAccountInfo?.id,
  })
  const { data: tradeSymbolAllList, isLoading: isLoadingTradeSymbolAllList } = useQuery(getPoolAccountDetailApiOptions)
  const firstTradeSymbolInfo = tradeSymbolAllList?.filter((item) => !!item.symbol)?.[0]
  const activeTradeSymbolInfo = tradeSymbolAllList?.find((item) => item.symbol === symbol)

  return {
    activeTradeSymbolInfo,
    firstTradeSymbolInfo,
    isLoading: isLoadingTradeSymbolAllList,
  }
}
