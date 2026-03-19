import { Trans } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { useAccountWithdraw } from '../../../../../_apis/use-account-withdraw'
import { useSelectedWithdrawAccount } from '../../../../../_hooks/use-selected-account'
import { useWithdrawState } from '../../../../../_hooks/use-withdraw-state'

/**
 * Web2 确认按钮
 * 直接调用出金接口
 */
export function Web2Confirm() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { toWalletAddress, withdrawAmount } = useWithdrawState()
  const { mutateAsync: accountWithdraw } = useAccountWithdraw()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (!selectedAccount?.id || !withdrawAmount || !toWalletAddress) {
      toast.error(<Trans>参数缺失</Trans>)
      return
    }

    setIsSubmitting(true)
    try {
      await accountWithdraw({
        tradeAccountId: selectedAccount.id,
        amount: withdrawAmount,
        toAddress: toWalletAddress,
        isSwap: false,
      })

      toast.success(<Trans>出金成功</Trans>)
      router.dismissAll()
    } catch (error: any) {
      console.error('[AccountWithdraw] 出金失败:', error)
      toast.error(error?.message ?? error?.msg ?? <Trans>出金失败</Trans>)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedAccount?.id, withdrawAmount, toWalletAddress, accountWithdraw])

  return (
    <Button block size="lg" color="primary" onPress={handleConfirm} loading={isSubmitting} disabled={isSubmitting}>
      <Text>
        <Trans>确定</Trans>
      </Text>
    </Button>
  )
}
