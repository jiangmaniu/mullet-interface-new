import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { BuildSwapTxParams } from '../_hooks/use-swap-transaction'

import { AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { useWalletInfo } from '@/lib/appkit'
import { getImgSource } from '@/utils/img'
import { t } from '@lingui/core/macro'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

import { useSwapTransaction } from '../_hooks/use-swap-transaction'
import { SignatureFailModal } from '../../_comps/signature-fail-modal'
import { SignatureSuccessModal } from '../../_comps/signature-success-modal'
import { useSelectedTokenConfig } from '../../_hooks/use-selected-balance-info'
import { useUSDCTokenConfig } from '../../_hooks/use-token-config'
import { useSwapQuote } from '../../../_apis/use-swap-quote'
import { useDepositState } from '../../../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../../../_hooks/use-selected-account'

const COUNTDOWN_SECONDS = 30

const SwapConfirmScreen = observer(function SwapConfirmScreen() {
  const { fromWalletAddress, toWalletAddress, depositAmount } = useDepositState()
  const selectedAccount = useSelectedDepositAccount()
  const selectedTokenConfig = useSelectedTokenConfig()
  const usdcTokenConfig = useUSDCTokenConfig()

  // Web3 wallet state
  const { walletInfo } = useWalletInfo()

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 使用 useSwapTransaction Hook
  const {
    swapTransaction,
    signatureStatus,
    isBuilding,
    buildAndSendTransaction,
    sendTransaction,
    clearTransaction,
    resetStatus,
  } = useSwapTransaction()

  // 构建询价参数
  const quoteParams = useMemo(() => {
    if (
      !depositAmount ||
      BNumber.from(depositAmount).lte(0) ||
      !selectedTokenConfig ||
      !usdcTokenConfig ||
      !fromWalletAddress
    ) {
      return null
    }
    const decimals = selectedTokenConfig.decimals
    const amountInSmallestUnit = BNumber.from(depositAmount).multipliedBy(Math.pow(10, decimals)).toFixed(0)
    return {
      fromToken: selectedTokenConfig.symbol,
      toToken: usdcTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress,
    }
  }, [depositAmount, selectedTokenConfig, usdcTokenConfig, fromWalletAddress])

  // 调用询价接口
  const {
    data: quoteData,
    isLoading: isQuoting,
    refetch: refetchQuote,
  } = useSwapQuote(quoteParams, {
    enabled: !!quoteParams,
    refetchInterval: false, // 由倒计时手动控制刷新
  })

  // 从询价结果计算接收金额
  const receiveAmount = useMemo(() => {
    if (!quoteData?.expectedOutputAmount || !usdcTokenConfig) {
      return
    }
    const decimals = usdcTokenConfig.decimals
    return BNumber.from(quoteData.expectedOutputAmount).dividedBy(Math.pow(10, decimals)).toString()
  }, [quoteData, usdcTokenConfig])

  // 倒计时归零时的处理：清除交易订单 + 刷新报价 + 重置倒计时
  const handleCountdownExpire = useCallback(() => {
    clearTransaction()
    refetchQuote()
  }, [clearTransaction, refetchQuote])

  // 刷新倒计时（用于确认交易后重置）
  const refreshCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SECONDS)
  }, [])

  // 倒计时循环：到 0 自动刷新 quote 并重新开始
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleCountdownExpire()
          return COUNTDOWN_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [handleCountdownExpire])

  const handleConfirmSwap = useCallback(async () => {
    if (!toWalletAddress || !quoteParams) {
      console.error('Missing required parameters')
      return
    }

    setShowSignatureModal(true)

    try {
      // 检查是否已有交易订单
      if (swapTransaction) {
        // 直接发送已有交易
        await sendTransaction(swapTransaction)
      } else {
        // 构建并发送新交易
        const buildParams: BuildSwapTxParams = {
          fromToken: quoteParams.fromToken,
          toToken: quoteParams.toToken,
          amount: quoteParams.amount,
          fromAddress: quoteParams.fromAddress,
          toAddress: toWalletAddress,
          provider: 'jupiter',
        }
        await buildAndSendTransaction(buildParams, refreshCountdown)
      }
    } catch (error: any) {
      toast.error(error?.message ?? error?.msg ?? <Trans>交易失败</Trans>)
      console.error('Transaction failed:', error)
    }
  }, [toWalletAddress, quoteParams, swapTransaction, sendTransaction, buildAndSendTransaction, refreshCountdown])

  const handleRetrySignature = useCallback(async () => {
    if (!swapTransaction) {
      console.error('No transaction to retry')
      return
    }

    try {
      await sendTransaction(swapTransaction)
    } catch (error) {
      console.error('Retry transaction failed:', error)
    }
  }, [swapTransaction, sendTransaction])

  const handleCloseSignatureModal = useCallback(() => {
    setShowSignatureModal(false)
    resetStatus()
    if (signatureStatus === 'success') {
      // 清除路由堆栈，重定向到资产页面
      router.dismissAll()
    }
  }, [signatureStatus, resetStatus])

  // 确认按钮：回退到选择入金 token 页面
  const handleConfirmSignatureModal = useCallback(() => {
    setShowSignatureModal(false)
    resetStatus()
    // swap/confirm -> swap -> wallet-transfer（选择 token 页面）
    router.back()
    router.back()
  }, [resetStatus])

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
                <AvatarImage source={getImgSource(walletInfo?.icon)} className={'size-6 rounded-full'} />
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
                <AvatarImage source={getImgSource(usdcTokenConfig?.iconUrl)} className={'size-6 rounded-full'} />
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
        {isQuoting && !quoteData ? (
          <View className="py-xl items-center">
            <ActivityIndicator />
          </View>
        ) : (
          <View className="gap-2">
            <FeeRow
              label={<Trans>兑换率</Trans>}
              value={renderFallback(
                quoteData &&
                  `1 ${selectedTokenConfig?.symbol ?? ''}≈${BNumber.toFormatNumber(
                    BNumber.from(quoteData?.expectedOutputAmount).dividedBy(quoteData?.inputAmount),
                    { unit: usdcTokenConfig?.symbol, volScale: usdcTokenConfig?.displayDecimals },
                  )}`,
                { verify: !!quoteData },
              )}
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
              value={BNumber.toFormatNumber(receiveAmount, {
                unit: usdcTokenConfig?.symbol,
                volScale: usdcTokenConfig?.displayDecimals,
              })}
            />
          </View>
        )}

        {/* 兑换服务提示 */}
        <View>
          <Text className="text-paragraph-p3 text-content-4 text-center">
            <Trans>兑换服务由Jup Swap提供</Trans>
          </Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <SafeAreaView edges={['bottom']}>
        <View className="px-5 py-8">
          <Button
            block
            size="lg"
            color="primary"
            onPress={handleConfirmSwap}
            disabled={signatureStatus === 'signing' || isBuilding || countdown <= 0}
            loading={signatureStatus === 'signing' || isBuilding}
          >
            <Text>{signatureStatus === 'signing' || isBuilding ? <Trans>等待签名</Trans> : <Trans>确定</Trans>}</Text>
          </Button>
        </View>
      </SafeAreaView>

      <SignatureSuccessModal
        visible={showSignatureModal && signatureStatus === 'success'}
        onClose={handleCloseSignatureModal}
        onConfirm={handleConfirmSignatureModal}
        confirmText={<Trans>继续充值</Trans>}
        depositAmount={depositAmount}
        receiveAmount={receiveAmount}
        depositTokenConfig={selectedTokenConfig}
        receiveTokenConfig={usdcTokenConfig}
      />
      <SignatureFailModal
        visible={showSignatureModal && signatureStatus === 'failed'}
        onClose={handleCloseSignatureModal}
        onRetry={handleRetrySignature}
        showRetryButton={!!swapTransaction}
        loading={signatureStatus === 'signing'}
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
