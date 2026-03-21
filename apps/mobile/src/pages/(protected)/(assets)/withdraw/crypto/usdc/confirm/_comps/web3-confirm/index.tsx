import { Trans } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { router } from 'expo-router'

import { WithdrawSuccessModal } from '@/components/modals/withdraw-success-modal'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { useAccountWithdraw } from '../../../../../_apis/use-account-withdraw'
import { useSelectedWithdrawAccount } from '../../../../../_hooks/use-selected-account'
import { useSelectedTokenConfig } from '../../../../../_hooks/use-selected-chain-info'
import { useWithdrawState } from '../../../../../_hooks/use-withdraw-state'
import { SignatureFailModal } from '../../../../../../deposit/wallet-transfer/_comps/signature-fail-modal'

type TxStatus = 'idle' | 'submitting' | 'success' | 'failed'

/**
 * Web3 确认按钮
 * 直接调用出金接口
 */
export function Web3Confirm() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { toWalletAddress, withdrawAmount } = useWithdrawState()
  const selectedTokenConfig = useSelectedTokenConfig()

  const { mutateAsync: accountWithdraw } = useAccountWithdraw()

  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [showModal, setShowModal] = useState(false)

  const isLoading = txStatus === 'submitting'

  const handleConfirm = useCallback(async () => {
    if (!toWalletAddress) {
      toast.error(<Trans>请输入钱包地址</Trans>)
      return
    }
    if (!selectedAccount?.id || !withdrawAmount) {
      toast.error(<Trans>缺少必要参数</Trans>)
      return
    }

    setShowModal(true)
    setTxStatus('submitting')
    try {
      await accountWithdraw({
        tradeAccountId: selectedAccount.id,
        amount: withdrawAmount,
        toAddress: toWalletAddress,
        isSwap: false,
      })
      // console.log('[USDCWithdraw] 出金成功')

      setTxStatus('success')
    } catch (error: any) {
      setTxStatus('failed')
      console.error('[USDCWithdraw] 出金失败:', error)
      toast.error(error?.msg ?? error?.message ?? <Trans>提现失败</Trans>)
    }
  }, [selectedAccount, toWalletAddress, withdrawAmount, accountWithdraw])

  const handleCloseSuccessModal = () => {
    setShowModal(false)
    setTxStatus('idle')
    router.dismissAll()
  }

  const handleCloseFailModal = () => {
    setShowModal(false)
    setTxStatus('idle')
  }

  return (
    <>
      <Button block size="lg" color="primary" disabled={isLoading} loading={isLoading} onPress={handleConfirm}>
        <Text>{txStatus === 'submitting' ? <Trans>提交中</Trans> : <Trans>确定</Trans>}</Text>
      </Button>

      <WithdrawSuccessModal
        visible={showModal && txStatus === 'success'}
        onClose={handleCloseSuccessModal}
        address={toWalletAddress}
        amount={withdrawAmount}
        tokenConfig={selectedTokenConfig}
      />
      <SignatureFailModal
        visible={showModal && txStatus === 'failed'}
        onClose={handleCloseFailModal}
        onRetry={handleConfirm}
        showRetryButton
        loading={isLoading}
      />
    </>
  )
}
