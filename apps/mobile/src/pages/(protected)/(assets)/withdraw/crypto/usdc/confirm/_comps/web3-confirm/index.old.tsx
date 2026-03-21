import { Trans } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { router } from 'expo-router'

import { WithdrawSuccessModal } from '@/components/modals/withdraw-success-modal'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { useSolanaWithdraw } from '../../../../../_apis/use-solana-transfer'
import { useSelectedWithdrawAccount } from '../../../../../_hooks/use-selected-account'
import { useSelectedTokenConfig } from '../../../../../_hooks/use-selected-chain-info'
import { useWithdrawState } from '../../../../../_hooks/use-withdraw-state'
import { useWithdrawWalletSign } from '../../../../../_hooks/use-withdraw-wallet-sign'
import { SignatureFailModal } from '../../../../../../deposit/wallet-transfer/_comps/signature-fail-modal'

type TxStatus = 'idle' | 'signing' | 'submitting' | 'success' | 'failed'

/**
 * Web3 钱包签名确认按钮
 * 流程：钱包签名 → 调用出金接口 → 状态弹窗
 */
export function Web3Confirm() {
  const selectedAccount = useSelectedWithdrawAccount()
  const { toWalletAddress, withdrawAmount } = useWithdrawState()
  const selectedTokenConfig = useSelectedTokenConfig()

  const { signWithdrawMessage } = useWithdrawWalletSign()
  const { mutateAsync: transfer } = useSolanaWithdraw()

  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [showModal, setShowModal] = useState(false)

  const isLoading = txStatus === 'signing' || txStatus === 'submitting'

  const handleConfirm = useCallback(async () => {
    if (!toWalletAddress) {
      toast.error(<Trans>请输入钱包地址</Trans>)
      return
    }
    if (!selectedAccount?.id || !withdrawAmount || !selectedTokenConfig) {
      toast.error(<Trans>缺少必要参数</Trans>)
      return
    }

    setShowModal(true)
    setTxStatus('signing')
    try {
      // 1. 钱包签名
      // console.log('[USDCWithdraw] 开始签名流程')
      const signatureData = await signWithdrawMessage()
      // console.log('[USDCWithdraw] 签名完成')

      // 2. 调用出金接口
      setTxStatus('submitting')
      const result = await transfer({
        tradeAccountId: selectedAccount.id,
        toAddress: toWalletAddress,
        token: selectedTokenConfig?.symbol,
        amount: withdrawAmount,
        walletSignature: signatureData.signature,
        withdrawMessage: signatureData.message,
      })
      // console.log('[USDCWithdraw] 出金成功, txHash:', result.txHash)

      setTxStatus('success')
    } catch (error: any) {
      setTxStatus('failed')
      console.error('[USDCWithdraw] 出金失败:', error)
      toast.error(error?.msg ?? error?.message ?? <Trans>提现失败</Trans>)
    }
  }, [selectedAccount, toWalletAddress, withdrawAmount, selectedTokenConfig, transfer, signWithdrawMessage])

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
        <Text>
          {txStatus === 'signing' ? (
            <Trans>等待签名</Trans>
          ) : txStatus === 'submitting' ? (
            <Trans>提交中</Trans>
          ) : (
            <Trans>确定</Trans>
          )}
        </Text>
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
