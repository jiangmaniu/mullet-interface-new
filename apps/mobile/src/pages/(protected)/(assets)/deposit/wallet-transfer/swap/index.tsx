import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { debounce } from 'lodash-es'
import type { NumberFormatValues } from 'react-number-format'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconSwap } from '@/components/ui/icons/set/swap'
import {
  NumberInputPrimitive,
  NumberInputSourceInfo,
  NumberInputSourceType,
} from '@/components/ui/number-input-primitive'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Spinning } from '@/components/ui/spinning'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { t } from '@lingui/core/macro'
import { renderFallback, renderFallbackPlaceholder } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useSelectedTokenBalance, useSelectedTokenConfig } from '../_hooks/use-selected-balance-info'
import { useUSDCTokenConfig } from '../_hooks/use-token-config'
import { useSwapQuote } from '../../_apis/use-swap-quote'
import { useDepositActions, useDepositState } from '../../_hooks/use-deposit-state'

const PERCENT_OPTIONS = [
  { label: '25%', value: '25' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: 'Max', value: '100' },
]

const QUICK_AMOUNT_OPTIONS = [
  { label: '$200', value: '200' },
  { label: '$500', value: '500' },
  { label: '$1000', value: '1000' },
  { label: '$2000', value: '2000' },
]

const SwapTransferScreen = observer(function SwapTransferScreen() {
  const { setDepositAmount } = useDepositActions()
  const { fromWalletAddress } = useDepositState()
  const selectedTokenBalance = useSelectedTokenBalance()
  const selectedTokenConfig = useSelectedTokenConfig()
  const usdcTokenConfig = useUSDCTokenConfig()

  const [sendAmount, setSendAmount] = useState<string>('')
  const [receiveAmount, setReceiveAmount] = useState<string>('')
  const [selectedPercent, setSelectedPercent] = useState<string>('')
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<string>('')
  const [editingField, setEditingField] = useState<'send' | 'receive'>('send')

  // 正向查询参数：sendAmount -> receiveAmount
  const forwardQuoteParams = useMemo(() => {
    if (!sendAmount || BNumber.from(sendAmount).lte(0) || !selectedTokenConfig || !usdcTokenConfig) {
      return null
    }
    const decimals = selectedTokenConfig.displayDecimals
    const amountInSmallestUnit = BNumber.from(sendAmount).multipliedBy(Math.pow(10, decimals)).toFixed(0)
    return {
      fromToken: selectedTokenConfig.symbol,
      toToken: usdcTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress,
    }
  }, [sendAmount, selectedTokenConfig, usdcTokenConfig, fromWalletAddress])

  // 反向查询参数：receiveAmount -> sendAmount
  const reverseQuoteParams = useMemo(() => {
    if (!receiveAmount || BNumber.from(receiveAmount).lte(0) || !selectedTokenConfig || !usdcTokenConfig) {
      return null
    }
    const decimals = usdcTokenConfig.displayDecimals
    const amountInSmallestUnit = BNumber.from(receiveAmount).multipliedBy(Math.pow(10, decimals)).toFixed(0)
    return {
      fromToken: usdcTokenConfig.symbol,
      toToken: selectedTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress,
    }
  }, [receiveAmount, selectedTokenConfig, usdcTokenConfig, fromWalletAddress])

  // 正向查询
  const {
    data: forwardQuoteData,
    isLoading: isForwardQuoting,
    refetch: refetchForwardQuote,
  } = useSwapQuote(forwardQuoteParams, {
    enabled: editingField === 'send' && !!forwardQuoteParams,
    refetchInterval: 30000,
  })

  // 反向查询
  const { data: reverseQuoteData, isLoading: isReverseQuoting } = useSwapQuote(reverseQuoteParams, {
    enabled: editingField === 'receive' && !!reverseQuoteParams,
    refetchInterval: 30000,
  })

  // 当前使用的询价数据
  const quoteData = editingField === 'send' ? forwardQuoteData : reverseQuoteData
  const isQuoting = editingField === 'send' ? isForwardQuoting : isReverseQuoting

  // 是否余额不足
  const isInsufficientBalance = BNumber.from(sendAmount).gt(selectedTokenBalance?.amount)
  // 是否有效
  const isValid = BNumber.from(sendAmount).gt(0) && !isInsufficientBalance && !isQuoting && !!quoteData

  // 正向查询：更新 receiveAmount
  useEffect(() => {
    if (!forwardQuoteData?.expectedOutputAmount || !usdcTokenConfig || editingField !== 'send') {
      return
    }
    const decimals = usdcTokenConfig.displayDecimals
    const result = BNumber.from(forwardQuoteData.expectedOutputAmount).dividedBy(Math.pow(10, decimals)).toString()
    setReceiveAmount(result)
  }, [forwardQuoteData, editingField, usdcTokenConfig])

  // 反向查询：更新 sendAmount
  useEffect(() => {
    if (!reverseQuoteData || !selectedTokenConfig || editingField !== 'receive') {
      return
    }
    const decimals = selectedTokenConfig.displayDecimals

    const result = BNumber.from(reverseQuoteData.inputAmount)
      .dividedBy(Math.pow(10, decimals))
      .plus(reverseQuoteData.estimatedFeeUSD) // +服务费
      .plus(reverseQuoteData.estimatedGasUSD) // +gas费
      .toString()
    setSendAmount(result)
  }, [reverseQuoteData, editingField, selectedTokenConfig])

  // 处理发送金额变化（防抖 300ms）
  const handleSendAmountChange = useMemo(
    () =>
      debounce((values: NumberFormatValues, { source }: NumberInputSourceInfo) => {
        if (source === NumberInputSourceType.EVENT) {
          setEditingField('send')
          setSendAmount(values.value)
          setSelectedPercent('')
          setSelectedQuickAmount('')

          // 如果清空了 sendAmount，也清空 receiveAmount
          if (!values.value || values.value === '0') {
            setReceiveAmount('')
          }
        }
      }, 300),
    [],
  )

  // 处理接收金额变化（防抖 300ms）
  const handleReceiveAmountChange = useMemo(
    () =>
      debounce((values: NumberFormatValues, { source }: NumberInputSourceInfo) => {
        if (source === NumberInputSourceType.EVENT) {
          setEditingField('receive')
          setReceiveAmount(values.value)
          setSelectedPercent('')
          setSelectedQuickAmount('')

          // 如果清空了 receiveAmount，也清空 sendAmount
          if (!values.value || values.value === '0') {
            setSendAmount('')
          }
        }
      }, 300),
    [],
  )

  // 处理百分比选择
  const handlePercentChange = useCallback(
    (value: string) => {
      setEditingField('send')
      setSelectedPercent(value)
      setSelectedQuickAmount('')
      const pct = Number(value)
      if (pct > 0) {
        const calculated = BNumber.from(selectedTokenBalance?.amount ?? 0)
          .multipliedBy(pct)
          .dividedBy(100)
          .toString()
        setSendAmount(calculated)
      }
    },
    [selectedTokenBalance?.amount],
  )

  // 处理快捷金额选择
  const handleQuickAmountChange = useCallback((value: string) => {
    setEditingField('receive')
    setSelectedQuickAmount(value)
    setSelectedPercent('')
    setReceiveAmount(value)
  }, [])

  const handleConfirmInput = useCallback(() => {
    if (sendAmount && isValid) {
      setDepositAmount(sendAmount)
      router.push('/(assets)/deposit/wallet-transfer/swap/confirm')
    }
  }, [sendAmount, isValid, setDepositAmount])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>兑换转入</Trans>} />

      <View className="gap-xl flex-1">
        <View className="relative gap-2 px-5">
          {/* 发送框 */}
          <Card>
            <CardContent className="gap-medium">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>你将发送</Trans>
              </Text>

              <View className="flex-row items-center gap-4">
                {/* Token 图标 */}
                <View className="gap-medium flex-row items-center">
                  {selectedTokenConfig?.iconUrl ? (
                    <Image source={{ uri: selectedTokenConfig?.iconUrl }} style={{ width: 24, height: 24 }} />
                  ) : null}
                  <Text className="text-paragraph-p2 text-content-1">
                    {renderFallback(selectedTokenConfig?.symbol)}
                  </Text>
                </View>

                {/* 金额输入 */}
                <View className="border-brand-default flex-1 border-b">
                  <NumberInputPrimitive
                    value={sendAmount}
                    onValueChange={handleSendAmountChange}
                    decimalScale={selectedTokenConfig?.displayDecimals}
                    placeholder={renderFallbackPlaceholder({ volScale: selectedTokenConfig?.displayDecimals })}
                    placeholderTextColor="#656886"
                    className="text-important-1 text-content-1 !leading-small h-9"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>
                    可用：
                    {BNumber.toFormatNumber(selectedTokenBalance?.amount, {
                      unit: selectedTokenConfig?.symbol,
                      volScale: selectedTokenConfig?.displayDecimals,
                    })}
                  </Trans>
                </Text>
              </View>

              {/* 百分比选择 */}
              <View className="flex-row items-center justify-center">
                <Tabs value={selectedPercent} onValueChange={handlePercentChange}>
                  <TabsList variant="solid" size="md">
                    {PERCENT_OPTIONS.map((opt) => (
                      <TabsTrigger key={opt.value} value={opt.value} className="flex-1 px-0">
                        <Text>{opt.label}</Text>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </View>
            </CardContent>
          </Card>

          {/* 接收框 */}
          <Card>
            <CardContent className="gap-large relative">
              {/* 兑换图标 */}
              <View className="top-xl absolute left-1/2 z-10 -translate-x-1/2">
                {isQuoting ? (
                  <Spinning width={24} height={24} />
                ) : (
                  <Pressable onPress={() => refetchForwardQuote()}>
                    <IconSwap width={24} height={24} />
                  </Pressable>
                )}
              </View>

              <Text className="text-paragraph-p3 text-content-4">
                <Trans>你将收到</Trans>
              </Text>

              <View className="flex-row items-center gap-4">
                <View className="gap-medium flex-row items-center">
                  {usdcTokenConfig?.iconUrl ? (
                    <Image source={{ uri: usdcTokenConfig?.iconUrl }} style={{ width: 24, height: 24 }} />
                  ) : null}
                  <Text className="text-paragraph-p2 text-content-1">{renderFallback(usdcTokenConfig?.symbol)}</Text>
                </View>

                <View className="border-brand-default flex-1 border-b">
                  <NumberInputPrimitive
                    value={receiveAmount}
                    onValueChange={handleReceiveAmountChange}
                    decimalScale={2}
                    placeholder={renderFallbackPlaceholder({ volScale: 2 })}
                    placeholderTextColor="#656886"
                    className="text-important-1 text-content-1 !leading-small h-9"
                  />
                </View>
              </View>

              {/* 快捷金额选择 */}
              <View className="flex-row items-center justify-center">
                <Tabs value={selectedQuickAmount} onValueChange={handleQuickAmountChange}>
                  <TabsList variant="solid" size="md">
                    {QUICK_AMOUNT_OPTIONS.map((opt) => (
                      <TabsTrigger key={opt.value} value={opt.value} className="flex-1 px-0">
                        <Text>{opt.label}</Text>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* 费用明细 */}
        <View className="gap-medium px-5">
          <FeeRow
            label={<Trans>兑换率</Trans>}
            value={
              quoteData
                ? `${BNumber.toFormatNumber(1, { unit: selectedTokenConfig?.symbol })}≈${BNumber.toFormatNumber(
                    BNumber.from(quoteData?.expectedOutputAmount).dividedBy(quoteData?.inputAmount),
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
        <View className="px-5">
          <Text className="text-paragraph-p3 text-content-4 text-center">
            <Trans>兑换服务由Jup Swap提供</Trans>
          </Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <SafeAreaView edges={['bottom']}>
        <View className="px-5">
          <Button block size="lg" color="primary" disabled={!isValid} onPress={handleConfirmInput}>
            <Text>{isInsufficientBalance ? <Trans>余额不足</Trans> : <Trans>继续</Trans>}</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
})

export default SwapTransferScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
