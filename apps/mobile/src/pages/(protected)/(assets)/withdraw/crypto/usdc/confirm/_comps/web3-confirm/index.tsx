import { Trans } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { WithdrawSuccessModal } from '../../../_comps/withdraw-success-modal'
import { useSolanaTransfer } from '../../../../../_apis/use-solana-transfer'
import { useSelectedWithdrawAccount } from '../../../../../_hooks/use-selected-account'
import { useSelectedChainInfo } from '../../../../../_hooks/use-selected-chain-info'
import { useWithdrawActions, useWithdrawState } from '../../../../../_hooks/use-withdraw-state'

/**
 * Web3 钱包签名确认按钮
 * 处理钱包签名验证流程
 */
export function Web3Confirm() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { withdrawAddress, withdrawAmount, selectedAccountId } = useWithdrawState()
  const { tokenInfo } = useSelectedChainInfo()
  const { reset } = useWithdrawActions()

  // Solana transfer mutation
  const { mutate: transfer, isPending: isTransferring } = useSolanaTransfer()

  // Status modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleConfirm = useCallback(() => {
    // TODO: 暂时直接出金，后续再实现签名验证
    if (!selectedAccount?.id || !withdrawAddress || !withdrawAmount || !tokenInfo) {
      toast.error(<Trans>缺少必要参数</Trans>)
      return
    }

    transfer(
      {
        tradeAccountId: selectedAccount.id,
        toAddress: withdrawAddress,
        token: tokenInfo.symbol,
        amount: withdrawAmount,
        walletSignature: '',
      },
      {
        onSuccess: (data) => {
          console.log('Transfer success:', data)
          setShowSuccessModal(true)
        },
        onError: (error: any) => {
          console.error('Transfer failed:', error)
          toast.error(error?.msg || <Trans>提现失败</Trans>)
        },
      },
    )
  }, [selectedAccount, withdrawAddress, withdrawAmount, tokenInfo, transfer])

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    const accountId = selectedAccountId
    reset() // 重置 store 状态
    router.replace({ pathname: '/(protected)/(assets)/withdraw', params: { accountId } }) // 跳转到 提现 页面
  }

  return (
    <>
      <Button
        block
        size="lg"
        color="primary"
        disabled={isTransferring}
        loading={isTransferring}
        onPress={handleConfirm}
      >
        <Text>{isTransferring ? <Trans>处理中</Trans> : <Trans>确定</Trans>}</Text>
      </Button>

      <WithdrawSuccessModal visible={showSuccessModal} onClose={handleCloseModal} />
    </>
  )
}
