import { useShallow } from 'zustand/react/shallow'

import { useAccountAvailableMargin } from '@/hooks/account/use-account-balance'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

import { useOrderMargin } from '../_apis/use-order-margin'

export const useOpenMaxAmount = ({ symbol }: { symbol?: string }) => {
  const accountId = useRootStore(useShallow(userInfoActiveTradeAccountIdSelector))
  // 查询一手需要的保证金，再拿可用保证金去除
  const { data: expectedMargin } = useOrderMargin({ symbol, amount: '1' })

  const availableMargin = useAccountAvailableMargin(accountId)

  return BNumber.from(availableMargin)?.div(BNumber.from(expectedMargin))?.toFixed()
}
