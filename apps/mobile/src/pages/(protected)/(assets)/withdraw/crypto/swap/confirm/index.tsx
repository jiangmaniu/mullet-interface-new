import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { SOL_TOKEN_SYMBOL } from '@/constants/config/deposit'
import { useSwapQuote } from '@/pages/(protected)/(assets)/deposit/_apis/use-swap-quote'
import { getImgSource } from '@/utils/img'
import { t } from '@lingui/core/macro'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

import { useSwapWithdraw } from '../../../_apis/use-swap-withdraw'
import { useSelectedWithdrawAccount } from '../../../_hooks/use-selected-account'
import { useSelectedTokenConfig } from '../../../_hooks/use-selected-chain-info'
import { useUSDCTokenConfig } from '../../../_hooks/use-token-config'
import { useWithdrawState } from '../../../_hooks/use-withdraw-state'
import { useWithdrawWalletSign } from '../../../_hooks/use-withdraw-wallet-sign'
import { WithdrawSuccessModal } from '../../../../../../../components/modals/withdraw-success-modal'
import { SignatureFailModal } from '../../../../deposit/wallet-transfer/_comps/signature-fail-modal'

const COUNTDOWN_SECONDS = 30

const SwapWithdrawConfirmScreen = observer(function SwapWithdrawConfirmScreen() {
  const { toWalletAddress, withdrawAmount, fromWalletAddress, selectedAccountId } = useWithdrawState()
  const usdcTokenConfig = useUSDCTokenConfig()
  const selectedTokenConfig = useSelectedTokenConfig()
  const selectedAccount = useSelectedWithdrawAccount()

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [showModal, setShowModal] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'signing' | 'submitting' | 'success' | 'failed'>('idle')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { signWithdrawMessage } = useWithdrawWalletSign()
  const { mutateAsync: swapWithdraw } = useSwapWithdraw()

  const isLoading = txStatus === 'signing' || txStatus === 'submitting'

  const quoteParams = useMemo(() => {
    if (
      !withdrawAmount ||
      BNumber.from(withdrawAmount).lte(0) ||
      !usdcTokenConfig ||
      !selectedTokenConfig ||
      !fromWalletAddress
    ) {
      return null
    }
    const decimals = usdcTokenConfig.decimals
    const amountInSmallestUnit = BNumber.from(withdrawAmount).multipliedBy(Math.pow(10, decimals)).toString()
    return {
      fromToken: usdcTokenConfig.symbol,
      toToken: selectedTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress,
    }
  }, [withdrawAmount, usdcTokenConfig, selectedTokenConfig, fromWalletAddress])

  const {
    data: quoteData,
    isLoading: isQuoting,
    refetch: refetchQuote,
  } = useSwapQuote(quoteParams, {
    enabled: !!quoteParams,
    refetchInterval: false,
  })

  const receiveAmount = useMemo(() => {
    if (!quoteData?.expectedOutputAmount || !selectedTokenConfig) return
    const decimals = selectedTokenConfig.decimals
    return BNumber.from(quoteData.expectedOutputAmount).dividedBy(Math.pow(10, decimals)).toString()
  }, [quoteData, selectedTokenConfig])

  const handleCountdownExpire = useCallback(() => {
    refetchQuote()
  }, [refetchQuote])

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
    if (!toWalletAddress || !quoteParams || !selectedAccountId || !selectedTokenConfig) {
      console.error('Missing required parameters')
      return
    }
    setShowModal(true)
    setTxStatus('signing')
    try {
      // 1. 钱包签名
      console.log('[SwapWithdraw] 开始签名流程')
      const signatureData = await signWithdrawMessage()
      console.log('[SwapWithdraw] 签名完成')

      // 2. 调用 swap withdraw API
      setTxStatus('submitting')
      const requestParams = {
        accountId: selectedAccountId,
        toToken: selectedTokenConfig?.symbol,
        usdcAmount: quoteParams.amount,
        destinationAddress: toWalletAddress,
        walletSignature: signatureData.signature,
        slippageBps: quoteData?.slippageBps,
      }
      const result = await swapWithdraw(requestParams)
      console.log('[SwapWithdraw] 出金成功, txHash:', result.txHash)

      setTxStatus('success')
    } catch (error: any) {
      setTxStatus('failed')
      console.error('[SwapWithdraw] 出金失败:', error)
      toast.error(error?.message ?? error?.msg ?? <Trans>交易失败</Trans>)
    }
  }, [
    toWalletAddress,
    quoteParams,
    selectedAccountId,
    signWithdrawMessage,
    swapWithdraw,
    selectedTokenConfig,
    quoteData?.slippageBps,
  ])

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
    <View className="gap-xl flex-1">
      <ScreenHeader
        content={
          <Text className="text-important-1 text-content-1">
            <Trans>订单确认</Trans> <Text className="text-status-danger">{countdown}S</Text>
          </Text>
        }
      />

      <View className="flex-1 gap-3 px-5">
        <Card>
          <CardContent className="gap-1 py-2">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>付</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <AvatarImage source={getImgSource(usdcTokenConfig?.iconUrl)} className="size-6 rounded-full" />
                <View className="gap-1">
                  <Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id}</Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(fromWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(-withdrawAmount, {
                  positive: false,
                  unit: usdcTokenConfig?.symbol,
                  volScale: usdcTokenConfig?.displayDecimals,
                })}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-1 py-2">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>收</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <AvatarImage source={getImgSource(selectedTokenConfig?.iconUrl)} className="size-6 rounded-full" />
                <View className="gap-1">
                  <Text className="text-paragraph-p2 text-content-1">
                    <Trans>接收钱包</Trans>
                  </Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(toWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(receiveAmount, {
                  positive: false,
                  forceSign: true,
                  unit: selectedTokenConfig?.symbol,
                  volScale: selectedTokenConfig?.displayDecimals,
                })}
              </Text>
            </View>
          </CardContent>
        </Card>

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
                  `${BNumber.toFormatNumber(1, { unit: usdcTokenConfig?.symbol })} ≈ ${BNumber.toFormatNumber(
                    BNumber.from(quoteData.expectedOutputAmount)?.dividedBy(quoteData.inputAmount),
                    {
                      unit: selectedTokenConfig?.symbol,
                      volScale: selectedTokenConfig?.displayDecimals,
                    },
                  )}`,
                { verify: !!quoteData },
              )}
            />
            <FeeRow
              label={<Trans>滑点</Trans>}
              value={BNumber.toFormatNumber(quoteData?.slippagePercent, { prefix: t`自动`, unit: '%' })}
            />
            <FeeRow
              label={<Trans>Gas费</Trans>}
              value={renderFallback(
                quoteData &&
                  `${BNumber.toFormatNumber(quoteData?.estimatedGasSOL, {
                    unit: SOL_TOKEN_SYMBOL,
                  })} ≈ ${BNumber.toFormatNumber(quoteData?.estimatedGasUSD, {
                    unit: usdcTokenConfig?.symbol,
                  })}`,
                { verify: !!quoteData },
              )}
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
                unit: selectedTokenConfig?.symbol,
                volScale: selectedTokenConfig?.displayDecimals ?? 6,
              })}
            />
          </View>
        )}

        <View>
          <Text className="text-paragraph-p3 text-content-4 text-center">
            <Trans>兑换服务由Jup Swap提供</Trans>
          </Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5 py-8">
          <Button
            block
            size="lg"
            color="primary"
            onPress={handleConfirmSwap}
            disabled={txStatus !== 'idle' || countdown <= 0}
            loading={txStatus === 'signing' || txStatus === 'submitting'}
          >
            <Text>
              {txStatus === 'signing' ? (
                <Trans>等待签名</Trans>
              ) : txStatus === 'submitting' ? (
                <Trans>提交中</Trans>
              ) : (
                <Trans>确认兑换</Trans>
              )}
            </Text>
          </Button>
        </View>
      </SafeAreaView>

      <WithdrawSuccessModal
        visible={showModal && txStatus === 'success'}
        onClose={handleCloseSuccessModal}
        address={toWalletAddress}
        amount={quoteData?.inputAmount ?? ''}
        tokenConfig={selectedTokenConfig}
      />

      <SignatureFailModal
        visible={showModal && txStatus === 'failed'}
        onClose={handleCloseFailModal}
        onRetry={handleConfirmSwap}
        showRetryButton
        loading={isLoading}
      />
    </View>
  )
})

export default SwapWithdrawConfirmScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
