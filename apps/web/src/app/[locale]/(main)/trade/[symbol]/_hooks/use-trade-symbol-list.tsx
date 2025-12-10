import { useQuery } from '@tanstack/react-query'

import { useLoginUserInfo } from '@/hooks/user/use-login-user-info'
import { useGetTradeSymbolListApiOptions } from '@/services/api/trade-core/hooks/account/symbol'

import { useActiveAccountInfo } from './use-active-account-info'

export const useActiveAccountTradeSymbolList = () => {
  const { activeAccountInfo } = useActiveAccountInfo()
  const { getPoolAccountDetailApiOptions } = useGetTradeSymbolListApiOptions({
    accountId: activeAccountInfo?.id,
  })
  const tradeSymbolAllListQueryResult = useQuery(getPoolAccountDetailApiOptions)
  return {
    activeAccountTradeSymbolList: tradeSymbolAllListQueryResult.data,
    activeAccountTradeSymbolListQueryResult: tradeSymbolAllListQueryResult,
  }
}
