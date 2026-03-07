import { useMemo } from 'react'

import { useStores } from '@/v1/provider/mobxProvider'

import { useDepositStore } from '../_store'

/**
 * 获取当前选中的充值账户
 */
export function useSelectedDepositAccount() {
  const { user } = useStores()
  const selectedAccountId = useDepositStore((s) => s.selectedAccountId)

  return useMemo(() => {
    if (!selectedAccountId) return null
    return user.currentUser.accountList?.find((account) => account.id === selectedAccountId) ?? null
  }, [selectedAccountId, user.currentUser.accountList])
}
