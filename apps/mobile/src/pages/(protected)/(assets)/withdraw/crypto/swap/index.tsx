import { Trans } from '@lingui/react/macro'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { debounce } from 'lodash-es'
import type { NumberFormatValues } from 'react-number-format'

import { AvatarImage } from '@/components/ui/avatar'
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
import { SOL_TOKEN_SYMBOL } from '@/constants/config/deposit'
import { useSwapQuote } from '@/pages/(protected)/(assets)/deposit/_apis/use-swap-quote'
import { getImgSource } from '@/utils/img'
import { t } from '@lingui/core/macro'
import { renderFallback, renderFallbackPlaceholder } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useAccountExtractable } from '../../_apis/use-account-extractable'
import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { useSelectedChainInfo, useSelectedTokenConfig } from '../../_hooks/use-selected-chain-info'
import { useUSDCTokenConfig } from '../../_hooks/use-token-config'
import { useWithdrawActions, useWithdrawState } from '../../_hooks/use-withdraw-state'

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

const SwapWithdrawScreen = function SwapWithdrawScreen() {
  const { setWithdrawAmount } = useWithdrawActions()
  const { toWalletAddress, fromWalletAddress } = useWithdrawState()
  const selectedTokenConfig = useSelectedTokenConfig()
  const { chainInfo } = useSelectedChainInfo()
  const selectedAccount = useSelectedWithdrawAccount()
  const usdcTokenConfig = useUSDCTokenConfig()

  // 获取可提取余额
  const { data: extractableBalance } = useAccountExtractable(selectedAccount?.id)

  const [sendAmount, setSendAmount] = useState<string>('')
  const [receiveAmount, setReceiveAmount] = useState<string>('')
  const [selectedPercent, setSelectedPercent] = useState<string>('')
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<string>('')
  const [editingField, setEditingField] = useState<'send' | 'receive' | null>(null)
  const [latestQuoteData, setLatestQuoteData] = useState<any>(null)

  const initQuoteParams = useMemo(() => {
    if (!selectedTokenConfig || !usdcTokenConfig) return null
    const decimals = usdcTokenConfig.decimals
    const amountInSmallestUnit = BNumber.from(200).multipliedBy(Math.pow(10, decimals)).toString()
    return {
      fromToken: usdcTokenConfig.symbol,
      toToken: selectedTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress || undefined, // 初始询价不强制要求钱包地址
    }
  }, [selectedTokenConfig, usdcTokenConfig, fromWalletAddress])

  const forwardQuoteParams = useMemo(() => {
    if (
      editingField !== 'send' ||
      !sendAmount ||
      BNumber.from(sendAmount).lte(0) ||
      !selectedTokenConfig ||
      !usdcTokenConfig
    ) {
      return null
    }
    const decimals = usdcTokenConfig.decimals
    const amountInSmallestUnit = BNumber.from(sendAmount).multipliedBy(Math.pow(10, decimals)).toString()
    return {
      fromToken: usdcTokenConfig.symbol,
      toToken: selectedTokenConfig.symbol,
      amount: amountInSmallestUnit,
      fromAddress: fromWalletAddress,
    }
  }, [editingField, sendAmount, selectedTokenConfig, usdcTokenConfig, fromWalletAddress])

  const { data: initQuoteData } = useSwapQuote(initQuoteParams, {
    enabled: !!initQuoteParams,
    refetchInterval: 30000,
  })

  const {
    data: forwardQuoteData,
    isLoading: isForwardQuoting,
    refetch: refetchForwardQuote,
  } = useSwapQuote(forwardQuoteParams, {
    enabled: !!forwardQuoteParams,
    refetchInterval: 30000,
  })

  const quoteData = forwardQuoteData || initQuoteData
  const isQuoting = isForwardQuoting

  useEffect(() => {
    if (initQuoteData) setLatestQuoteData(initQuoteData)
  }, [initQuoteData])
  useEffect(() => {
    if (forwardQuoteData) setLatestQuoteData(forwardQuoteData)
  }, [forwardQuoteData])

  const isInsufficientBalance = BNumber.from(sendAmount).gt(extractableBalance ?? 0)
  const isValid = BNumber.from(sendAmount).gt(0) && !isInsufficientBalance && !!quoteData && !!toWalletAddress?.trim()

  useEffect(() => {
    if (!forwardQuoteData?.expectedOutputAmount || !usdcTokenConfig) return
    const decimals = usdcTokenConfig.decimals ?? usdcTokenConfig.displayDecimals ?? 6
    const result = BNumber.from(forwardQuoteData.expectedOutputAmount).dividedBy(Math.pow(10, decimals)).toString()
    setReceiveAmount(result)
  }, [forwardQuoteData, usdcTokenConfig])

  const handleSendAmountChange = useMemo(
    () =>
      debounce((values: NumberFormatValues, { source }: NumberInputSourceInfo) => {
        if (source === NumberInputSourceType.EVENT) {
          setEditingField('send')
          setSendAmount(values.value)
          setSelectedPercent('')
          setSelectedQuickAmount('')
          if (!values.value || values.value === '0') setReceiveAmount('')
        }
      }, 300),
    [],
  )

  const handleReceiveAmountChange = useMemo(
    () =>
      debounce((values: NumberFormatValues, { source }: NumberInputSourceInfo) => {
        if (source === NumberInputSourceType.EVENT) {
          setEditingField('receive')
          setReceiveAmount(values.value)
          setSelectedPercent('')
          setSelectedQuickAmount('')
          if (!values.value || values.value === '0') {
            setSendAmount('')
          } else if (latestQuoteData) {
            const rate = BNumber.from(latestQuoteData.expectedOutputAmount).dividedBy(latestQuoteData.inputAmount)
            const calculatedSendAmount = BNumber.from(values.value).dividedBy(rate).toString()
            setSendAmount(calculatedSendAmount)
          }
        }
      }, 300),
    [latestQuoteData],
  )

  const handlePercentChange = (value: string) => {
    setEditingField('send')
    setSelectedPercent(value)
    setSelectedQuickAmount('')
    const pct = Number(value)
    if (pct > 0) {
      const calculated = BNumber.from(extractableBalance ?? 0)
        .multipliedBy(pct)
        .dividedBy(100)
        .toString()
      setSendAmount(calculated)
      if (!calculated || calculated === '0') setReceiveAmount('0')
    }
  }

  const handleQuickAmountChange = useCallback(
    (value: string) => {
      setEditingField('receive')
      setSelectedQuickAmount(value)
      setSelectedPercent('')
      setReceiveAmount(value)
      if (latestQuoteData) {
        const rate = BNumber.from(latestQuoteData.expectedOutputAmount).dividedBy(latestQuoteData.inputAmount)
        const calculatedSendAmount = BNumber.from(value).dividedBy(rate).toString()
        setSendAmount(calculatedSendAmount)
      }
    },
    [latestQuoteData],
  )

  const handleConfirmInput = useCallback(() => {
    if (sendAmount && isValid) {
      setWithdrawAmount(sendAmount)
      router.push('/(assets)/withdraw/crypto/swap/confirm')
    }
  }, [sendAmount, isValid, setWithdrawAmount])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>加密货币取现</Trans>} />

      <View className="gap-xl flex-1">
        <View className="relative gap-2 px-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p2 text-content-4">
              <Trans>
                余额：
                {BNumber.toFormatNumber(extractableBalance, {
                  unit: selectedAccount?.currencyUnit,
                  volScale: selectedAccount?.currencyDecimal,
                })}
              </Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>
                最低取现
                {BNumber.toFormatNumber(chainInfo?.minWithdraw, {
                  unit: usdcTokenConfig?.symbol,
                  volScale: usdcTokenConfig?.displayDecimals,
                })}
              </Trans>
            </Text>
          </View>

          <Card>
            <CardContent className="gap-medium">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>你将发送</Trans>
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="gap-medium flex-row items-center">
                  <AvatarImage source={getImgSource(usdcTokenConfig?.iconUrl)} className="size-6 rounded-full" />
                  <Text className="text-paragraph-p2 text-content-1">{renderFallback(usdcTokenConfig?.symbol)}</Text>
                </View>
                <View className="border-brand-default flex-1 border-b">
                  <NumberInputPrimitive
                    value={sendAmount}
                    onValueChange={handleSendAmountChange}
                    decimalScale={usdcTokenConfig?.displayDecimals}
                    placeholder={renderFallbackPlaceholder({
                      volScale: usdcTokenConfig?.displayDecimals,
                    })}
                    placeholderTextColor="#656886"
                    className="text-important-1 text-content-1 !leading-small"
                  />
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>
                    可用：
                    {BNumber.toFormatNumber(extractableBalance, {
                      unit: selectedAccount?.currencyUnit,
                      volScale: selectedAccount?.currencyDecimal,
                    })}
                  </Trans>
                </Text>
              </View>
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

          <Card>
            <CardContent className="gap-large relative">
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
                  <AvatarImage source={getImgSource(selectedTokenConfig?.iconUrl)} className="size-6 rounded-full" />
                  <Text className="text-paragraph-p2 text-content-1">
                    {renderFallback(selectedTokenConfig?.symbol)}
                  </Text>
                </View>
                <View className="border-brand-default flex-1 border-b">
                  <NumberInputPrimitive
                    value={receiveAmount}
                    onValueChange={handleReceiveAmountChange}
                    decimalScale={selectedTokenConfig?.displayDecimals}
                    placeholder={renderFallbackPlaceholder({
                      volScale: selectedTokenConfig?.displayDecimals,
                    })}
                    placeholderTextColor="#656886"
                    className="text-important-1 text-content-1 !leading-small"
                  />
                </View>
              </View>
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

        <View className="gap-medium px-5">
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
            value={renderFallback(
              BNumber.toFormatNumber(receiveAmount, {
                unit: selectedTokenConfig?.symbol,
                volScale: selectedTokenConfig?.displayDecimals,
              }),
              { verify: !!quoteData },
            )}
          />
        </View>

        <View className="px-5">
          <Text className="text-paragraph-p3 text-content-4 text-center">
            <Trans>兑换服务由Jup Swap提供</Trans>
          </Text>
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5 py-8">
          <Button block size="lg" color="primary" loading={isQuoting} disabled={!isValid} onPress={handleConfirmInput}>
            <Text>{isInsufficientBalance ? <Trans>余额不足</Trans> : <Trans>继续</Trans>}</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default SwapWithdrawScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
