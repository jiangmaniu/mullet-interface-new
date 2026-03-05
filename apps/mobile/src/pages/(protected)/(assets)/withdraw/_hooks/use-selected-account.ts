import { useMemo } from 'react'

import { useStores } from '@/v1/provider/mobxProvider'

import { useWithdrawStore } from '../_store'

/**
 * 获取当前选中的提现账户
 */
export function useSelectedWithdrawAccount() {
  const { user } = useStores()
  const selectedAccountId = useWithdrawStore((s) => s.selectedAccountId)

  return useMemo(() => {
    if (!selectedAccountId) return null
    return user.currentUser.accountList?.find((account) => account.id === selectedAccountId) ?? null
  }, [selectedAccountId, user.currentUser.accountList])
}
