import { useAccountInfo } from '@/hooks/account/use-account-info'

import { useWithdrawStore } from '../_store'

/**
 * 获取当前选中的提现账户
 */
export function useSelectedWithdrawAccount() {
  const selectedAccountId = useWithdrawStore((s) => s.selectedAccountId)
  return useAccountInfo(selectedAccountId)
}
