import { useAccountInfo } from '@/hooks/account/use-account-info'

import { useDepositStore } from '../_store'

/**
 * 获取当前选中的充值账户
 */
export function useSelectedDepositAccount() {
  const selectedAccountId = useDepositStore((s) => s.selectedAccountId)
  return useAccountInfo(selectedAccountId) ?? null
}
