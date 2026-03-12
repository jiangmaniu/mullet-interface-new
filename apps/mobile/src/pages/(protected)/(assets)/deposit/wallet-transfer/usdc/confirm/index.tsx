import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { useSolanaConnection, useSolanaProvider, useWalletInfo } from '@/lib/appkit'
import { renderFallback } from '@mullet/utils/format'
import { formatAddress } from '@mullet/utils/web3'
import { BNumber } from '@mullet/utils/number'

import { SignatureFailModal } from '../../_comps/signature-fail-modal'
import { SignatureSuccessModal } from '../../_comps/signature-success-modal'
import { useConfirmTransactionStatus } from '../../_hooks/use-confirm-transaction'
import { useEstimateGasFee } from '../../_hooks/use-estimate-gas-fee'
import { useSelectedTokenConfig } from '../../_hooks/use-selected-balance-info'
import { TransferTokenResult, useSolanaTransfer } from '../../_hooks/use-solana-transfer'
import { useUSDCTokenConfig } from '../../_hooks/use-token-config'
import { useSolanaWalletBalance } from '../../../_apis/use-solana-wallet-balance'
import { useDepositActions, useDepositState } from '../../../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../../../_hooks/use-selected-account'

// const COUNTDOWN_SECONDS = 30

export type SignatureStatus = 'idle' | 'signing' | 'success' | 'failed'

const UsdcConfirmScreen = observer(function UsdcConfirmScreen() {
  const { fromWalletAddress, toWalletAddress, depositAmount } = useDepositState()
  const { setDepositAmount } = useDepositActions()
  const selectedAccount = useSelectedDepositAccount()
  const selectedTokenConfig = useSelectedTokenConfig()

  // Web3 wallet state
  const { walletInfo } = useWalletInfo()
  const { connection } = useSolanaConnection()
  const { walletProvider } = useSolanaProvider()
  const usdcTokenConfig = useUSDCTokenConfig()

  const { transferToken } = useSolanaTransfer()

  // 预估 Gas 费
  const { estimatedFee, isLoading: isLoadingGasFee } = useEstimateGasFee({
    connection,
    fromAddress: fromWalletAddress,
    toAddress: toWalletAddress,
    mintAddress: selectedTokenConfig?.contractAddress,
    amount: depositAmount,
    decimals: selectedTokenConfig?.decimals,
    enabled: !!connection && !!fromWalletAddress && !!toWalletAddress && !!selectedTokenConfig,
  })

  const { refetch: refetchBalance } = useSolanaWalletBalance(fromWalletAddress)

  // const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  // const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formattedAmount = BNumber.toFormatNumber(depositAmount, {
    volScale: selectedTokenConfig?.displayDecimals,
  })
  const [transferResult, setTransferResult] = useState<TransferTokenResult | undefined>(undefined)

  // 倒计时
  // useEffect(() => {
  //   timerRef.current = setInterval(() => {
  //     setCountdown((prev) => {
  //       if (prev <= 1) {
  //         if (timerRef.current) clearInterval(timerRef.current)
  //         return 0
  //       }
  //       return prev - 1
  //     })
  //   }, 1000)

  //   return () => {
  //     if (timerRef.current) clearInterval(timerRef.current)
  //   }
  // }, [])

  const handleConfirmTransfer = async () => {
    if (!toWalletAddress) {
      console.error('No to address')
      return
    }

    setShowSignatureModal(true)
    setSignatureStatus('signing')

    try {
      if (!selectedTokenConfig) return

      const result = await transferToken(
        {
          fromAddress: fromWalletAddress,
          toAddress: toWalletAddress,
          amount: depositAmount,
          mintAddress: selectedTokenConfig.contractAddress,
          decimals: selectedTokenConfig.decimals,
        },
        {
          memoContent: {
            app: Constants.expoConfig?.name,
            userId: selectedAccount?.id,
            token: selectedTokenConfig.symbol,
            amount: depositAmount.toString(),
            ts: Date.now(),
          },
          walletProvider,
          connection,
        },
      )

      if (result) {
        setSignatureStatus('success')
        setTransferResult(result)
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setSignatureStatus('failed')
    }
  }

  const handleRetrySignature = useCallback(() => {
    setSignatureStatus('signing')
    setTimeout(() => {
      setSignatureStatus(Math.random() > 0.3 ? 'success' : 'failed')
    }, 3000)
  }, [])

  const handleCloseSignatureModal = useCallback(() => {
    setShowSignatureModal(false)
    setSignatureStatus('idle')
    if (signatureStatus === 'success') {
      // 清除路由堆栈，回到资产页面
      router.dismissAll()
    }
  }, [signatureStatus])

  // 确认按钮：回退到输入数量页面，并清空数量
  const handleConfirmSignatureModal = useCallback(() => {
    setShowSignatureModal(false)
    setSignatureStatus('idle')
    setDepositAmount('')
    // usdc/confirm -> usdc（输入数量页）
    router.back()
  }, [setDepositAmount])

  useConfirmTransactionStatus(transferResult, {
    connection,
    onConfirm: () => {
      refetchBalance()
    },
  })

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader
        content={
          <Text className="text-important-1 text-content-1">
            <Trans>订单确认</Trans>
            {/* <Text className="text-status-danger">{countdown}S
            </Text/}>*/}
          </Text>
        }
      />

      <View className="flex-1 gap-3 px-5">
        {/* 付款信息 */}
        <View className="border-brand-default rounded-small px-xl py-medium border">
          <View className="gap-xs">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>付</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                {walletInfo?.icon && (
                  <Image source={{ uri: walletInfo.icon }} style={{ width: 24, height: 24, borderRadius: 4 }} />
                )}
                <View className="gap-xs">
                  <Text className="text-paragraph-p2 text-content-1">
                    {walletInfo?.name ? walletInfo.name : <Trans>未知钱包</Trans>}
                  </Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(fromWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(-depositAmount, {
                  positive: false,
                  unit: selectedTokenConfig?.symbol,
                  volScale: selectedTokenConfig?.displayDecimals,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 收款信息 */}
        <View className="border-brand-default rounded-small px-xl py-medium border">
          <View className="gap-xs">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>收</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                {selectedTokenConfig?.iconUrl && (
                  <Image source={{ uri: selectedTokenConfig?.iconUrl }} style={{ width: 24, height: 24 }} />
                )}
                <View className="gap-xs">
                  <Text className="text-paragraph-p2 text-content-1">{renderFallback(selectedAccount?.id)}</Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(toWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(depositAmount, {
                  positive: false,
                  forceSign: true,
                  unit: selectedTokenConfig?.symbol,
                  volScale: selectedTokenConfig?.displayDecimals,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 交易详情 */}
        <View className="gap-medium">
          <InfoRow label={<Trans>兑换率</Trans>} value="1 : 1" />
          <InfoRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
          <InfoRow
            label={<Trans>Gas费</Trans>}
            value={isLoadingGasFee ? <Trans>计算中...</Trans> : `${BNumber.toFormatNumber(estimatedFee)} SOL`}
          />
          <InfoRow
            label={<Trans>预计到账</Trans>}
            value={`${formattedAmount} ${selectedTokenConfig?.symbol ?? 'USDC'}`}
          />
          <InfoRow label={<Trans>服务费</Trans>} value={<Trans>免费</Trans>} />
        </View>
      </View>

      {/* 底部按钮 */}
      <SafeAreaView edges={['bottom']}>
        <View className="px-5 py-8">
          <Button
            block
            size="lg"
            color="primary"
            onPress={handleConfirmTransfer}
            disabled={signatureStatus === 'signing'}
            loading={signatureStatus === 'signing'}
          >
            <Text>{signatureStatus === 'signing' ? <Trans>等待签名</Trans> : <Trans>确定</Trans>}</Text>
          </Button>
        </View>
      </SafeAreaView>

      <SignatureSuccessModal
        visible={showSignatureModal && signatureStatus === 'success'}
        onClose={handleCloseSignatureModal}
        onConfirm={handleConfirmSignatureModal}
        confirmText={<Trans>继续充值</Trans>}
        depositAmount={depositAmount}
        depositTokenConfig={selectedTokenConfig}
        receiveAmount={depositAmount}
        receiveTokenConfig={usdcTokenConfig}
      />
      <SignatureFailModal
        visible={showSignatureModal && signatureStatus === 'failed'}
        onClose={handleCloseSignatureModal}
        onRetry={handleRetrySignature}
      />
    </View>
  )
})

export default UsdcConfirmScreen

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p2 text-content-4">{label}</Text>
      <Text className="text-paragraph-p2 text-content-1">{value}</Text>
    </View>
  )
}
