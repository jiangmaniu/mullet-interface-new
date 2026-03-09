import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { useWalletInfo } from '@/lib/appkit'
import { t } from '@lingui/core/macro'
import { formatAddress, renderFallback } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

import { SignatureFailModal } from '../../_comps/signature-fail-modal'
import { SignatureSuccessModal } from '../../_comps/signature-success-modal'
import { useSelectedTokenConfig } from '../../_hooks/use-selected-balance-info'
import { useSolanaTransfer } from '../../_hooks/use-solana-transfer'
import { useUSDCTokenConfig } from '../../_hooks/use-token-config'
import { useSwapQuote } from '../../../_apis/use-swap-quote'
import { useDepositState } from '../../../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../../../_hooks/use-selected-account'

const COUNTDOWN_SECONDS = 30

export type SignatureStatus = 'idle' | 'signing' | 'success' | 'failed'

const SwapConfirmScreen = observer(function SwapConfirmScreen() {
  const { fromWalletAddress, toWalletAddress, depositAmount } = useDepositState()
  const selectedAccount = useSelectedDepositAccount()
  const selectedTokenConfig = useSelectedTokenConfig()
  const usdcTokenConfig = useUSDCTokenConfig()

  // Web3 wallet state
  const { walletInfo } = useWalletInfo()
  const { transferToken } = useSolanaTransfer()

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 构建询价参数
  const quoteParams = useMemo(() => {
    if (!depositAmount || BNumber.from(depositAmount).lte(0) || !selectedTokenConfig || !usdcTokenConfig) {
      return null
    }
    const decimals = selectedTokenConfig.displayDecimals
    const amountInSmallestUnit = BNumber.from(depositAmount).multipliedBy(Math.pow(10, decimals)).toFixed(0)
    return {
      fromToken: selectedTokenConfig.symbol,
      toToken: usdcTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress,
    }
  }, [depositAmount, selectedTokenConfig, usdcTokenConfig, fromWalletAddress])

  // 调用询价接口
  const { data: quoteData, isLoading: isQuoting } = useSwapQuote(quoteParams, {
    enabled: !!quoteParams,
    refetchInterval: 30000, // 30 秒自动刷新
  })

  // 从询价结果计算接收金额
  const receiveAmount = useMemo(() => {
    if (!quoteData?.expectedOutputAmount || !usdcTokenConfig) {
      return
    }
    const decimals = usdcTokenConfig.displayDecimals
    return BNumber.from(quoteData.expectedOutputAmount).dividedBy(Math.pow(10, decimals)).toString()
  }, [quoteData, usdcTokenConfig])

  // 倒计时
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleConfirmSwap = useCallback(async () => {
    if (!toWalletAddress) {
      console.error('No to address')
      return
    }

    setShowSignatureModal(true)
    setSignatureStatus('signing')

    try {
      await transferToken({
        fromAddress: fromWalletAddress,
        toAddress: toWalletAddress,
        amount: depositAmount,
      })
      setSignatureStatus('success')
    } catch (error) {
      console.error('Transaction failed:', error)
      setSignatureStatus('failed')
    }
  }, [transferToken, fromWalletAddress, toWalletAddress, depositAmount])

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
      // 返回到钱包转入列表页
      router.back()
      router.back()
    }
  }, [signatureStatus])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader
        content={
          <Text className="text-important-1 text-content-1">
            <Trans>订单确认</Trans> <Text className="text-status-danger">{countdown}S</Text>
          </Text>
        }
      />

      <View className="flex-1 gap-3 px-5">
        {/* 付款信息 */}
        <Card>
          <CardContent className="gap-1 py-2">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>付</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {walletInfo?.icon && (
                  <Image source={{ uri: walletInfo.icon }} style={{ width: 24, height: 24, borderRadius: 4 }} />
                )}
                <View className="gap-1">
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
          </CardContent>
        </Card>

        {/* 收款信息 */}
        <Card>
          <CardContent className="gap-1 py-2">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>收</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {usdcTokenConfig?.iconUrl && (
                  <Image source={{ uri: usdcTokenConfig?.iconUrl }} style={{ width: 24, height: 24 }} />
                )}
                <View className="gap-1">
                  <Text className="text-paragraph-p2 text-content-1">{renderFallback(selectedAccount?.id)}</Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(toWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(receiveAmount, {
                  positive: false,
                  forceSign: true,
                  unit: usdcTokenConfig?.symbol,
                  volScale: usdcTokenConfig?.displayDecimals,
                })}
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* 交易详情 */}
        <View className="gap-2">
          <FeeRow
            label={<Trans>兑换率</Trans>}
            value={
              quoteData
                ? `1 ${selectedTokenConfig?.symbol ?? ''}≈${BNumber.toFormatNumber(
                    BNumber.from(quoteData.expectedOutputAmount).dividedBy(quoteData.inputAmount),
                    { unit: usdcTokenConfig?.symbol, volScale: usdcTokenConfig?.displayDecimals },
                  )}`
                : '-'
            }
          />
          <FeeRow
            label={<Trans>滑点</Trans>}
            value={BNumber.toFormatNumber(quoteData?.slippagePercent, { prefix: t`自动`, unit: '%' })}
          />
          <FeeRow
            label={<Trans>网络费</Trans>}
            value={BNumber.toFormatNumber(quoteData?.estimatedGasUSD, {
              unit: usdcTokenConfig?.symbol,
            })}
          />
          <FeeRow
            label={<Trans>服务费</Trans>}
            value={
              BNumber.from(quoteData?.estimatedFeeUSD)?.eq(0) ? (
                <Trans>免费</Trans>
              ) : (
                BNumber.toFormatNumber(quoteData?.estimatedFeeUSD, {
                  unit: usdcTokenConfig?.symbol,
                })
              )
            }
          />
          <FeeRow
            label={<Trans>预计到账</Trans>}
            value={
              quoteData
                ? BNumber.toFormatNumber(receiveAmount, {
                    unit: usdcTokenConfig?.symbol,
                    volScale: usdcTokenConfig?.displayDecimals,
                  })
                : '-'
            }
          />
        </View>

        {/* 兑换服务提示 */}
        <View>
          <Text className="text-paragraph-p3 text-content-4 text-center">
            <Trans>兑换服务由Jup Swap提供</Trans>
          </Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <SafeAreaView edges={['bottom']}>
        <View className="px-5">
          <Button
            block
            size="lg"
            color="primary"
            onPress={handleConfirmSwap}
            disabled={signatureStatus === 'signing' || countdown <= 0}
            loading={signatureStatus === 'signing'}
          >
            <Text>{signatureStatus === 'signing' ? <Trans>等待签名</Trans> : <Trans>确定</Trans>}</Text>
          </Button>
        </View>
      </SafeAreaView>

      <SignatureSuccessModal
        visible={showSignatureModal && signatureStatus === 'success'}
        onClose={handleCloseSignatureModal}
      />
      <SignatureFailModal
        visible={showSignatureModal && signatureStatus === 'failed'}
        onClose={handleCloseSignatureModal}
        onRetry={handleRetrySignature}
      />
    </View>
  )
})

export default SwapConfirmScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
