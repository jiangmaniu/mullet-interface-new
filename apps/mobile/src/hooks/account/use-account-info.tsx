import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { RootStoreState } from '@/stores'

import { useRootStore } from '@/stores'
import { createAccountInfoSelector } from '@/stores/user-slice/infoSlice'

/**
 * 根据 accountId 获取账户信息
 * 参照 useMarketSymbolInfo 实现
 */
export const useAccountInfo = (accountId?: string | number): User.AccountItem | undefined => {
  const accountInfo = useRootStore(
    useShallow(useCallback((s: RootStoreState) => createAccountInfoSelector(accountId)(s), [accountId])),
  )
  return accountInfo
}
