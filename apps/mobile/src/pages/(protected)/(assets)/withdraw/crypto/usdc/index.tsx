import { Trans } from '@lingui/react/macro'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { NumberFormatValues } from 'react-number-format'

import { AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  NumberInputPrimitive,
  NumberInputSourceInfo,
  NumberInputSourceType,
} from '@/components/ui/number-input-primitive'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { getImgSource } from '@/utils/img'
import { renderFallback, renderFallbackPlaceholder } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useAccountExtractable } from '../../_apis/use-account-extractable'
import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { useSelectedChainInfo } from '../../_hooks/use-selected-chain-info'
import { useWithdrawAmount, useWithdrawState } from '../../_hooks/use-withdraw-state'

const PERCENT_OPTIONS = [
  { label: '25%', value: '25' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: 'Max', value: '100' },
]

const UsdcWithdrawScreen = function UsdcWithdrawScreen() {
  const { toWalletAddress } = useWithdrawState()
  const { setWithdrawAmount } = useWithdrawAmount()
  const { tokenInfo } = useSelectedChainInfo()
  const selectedAccount = useSelectedWithdrawAccount()

  // 获取可提取余额
  const { data: extractableBalance } = useAccountExtractable(selectedAccount?.id)

  const [amount, setAmount] = useState<string>('')
  const [selectedPercent, setSelectedPercent] = useState<string>('')

  const accountBalance = extractableBalance
  const minWithdraw = tokenInfo?.minWithdraw

  // 是否余额不足
  const isInsufficientBalance = BNumber.from(amount).gt(accountBalance)
  // 是否满足最低取现
  const isValid = __DEV__ ? true : BNumber.from(amount).gte(minWithdraw) && BNumber.from(amount).lte(accountBalance)

  const handleValueChange = useCallback((values: NumberFormatValues, { source }: NumberInputSourceInfo) => {
    if (source === NumberInputSourceType.EVENT) {
      setAmount(values.value)
      setSelectedPercent('')
    }
  }, [])

  const handlePercentChange = useCallback(
    (value: string) => {
      setSelectedPercent(value)
      const pct = Number(value)
      if (pct > 0) {
        const calculated = BNumber.from(accountBalance ?? 0)
          .multipliedBy(pct)
          .dividedBy(100)
          .toString()
        setAmount(calculated)
      }
    },
    [accountBalance],
  )

  const handleConfirmInput = useCallback(() => {
    if (amount && isValid) {
      setWithdrawAmount(amount)
      router.push('/(assets)/withdraw/crypto/usdc/confirm')
    }
  }, [amount, isValid, setWithdrawAmount])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>加密货币取现</Trans>} />

      <View className="gap-xl flex-1 px-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
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
              {BNumber.toFormatNumber(tokenInfo?.minWithdraw, {
                unit: tokenInfo?.symbol,
                volScale: tokenInfo?.displayDecimals,
              })}
            </Trans>
          </Text>
        </View>

        <View className="gap-3xl">
          <View className="gap-large items-center">
            <View className="gap-xs flex-row items-center">
              <AvatarImage source={getImgSource(tokenInfo?.iconUrl)} className="size-6 rounded-full" />
              <Text className="text-paragraph-p2 text-content-1">{tokenInfo?.symbol}</Text>
            </View>

            <View className="border-brand-default w-full border-b py-4">
              <NumberInputPrimitive
                value={amount}
                onValueChange={handleValueChange}
                decimalScale={tokenInfo?.displayDecimals}
                placeholder={renderFallbackPlaceholder({ volScale: tokenInfo?.displayDecimals })}
                placeholderTextColor="#656886"
                className="text-title-h2 text-content-1 text-center"
              />
            </View>
          </View>

          <View className="w-full flex-row items-center">
            <Tabs value={selectedPercent} onValueChange={handlePercentChange}>
              <TabsList variant="solid" size="sm">
                {PERCENT_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value} className="flex-1">
                    <Text>{opt.label}</Text>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </View>

          <View className="gap-medium">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>接收地址</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">{renderFallback(toWalletAddress)}</Text>
          </View>
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5 py-8">
          <Button block size="lg" color="primary" disabled={!isValid} onPress={handleConfirmInput}>
            <Text>{isInsufficientBalance ? <Trans>余额不足</Trans> : <Trans>继续</Trans>}</Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default UsdcWithdrawScreen
