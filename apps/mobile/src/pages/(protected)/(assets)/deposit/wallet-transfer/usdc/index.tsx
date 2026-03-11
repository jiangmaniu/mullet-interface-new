import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { NumberFormatValues } from 'react-number-format'

import { Button } from '@/components/ui/button'
import {
  NumberInputPrimitive,
  NumberInputSourceInfo,
  NumberInputSourceType,
} from '@/components/ui/number-input-primitive'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { renderFallback, renderFallbackPlaceholder } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

import { useSelectedTokenBalance, useSelectedTokenConfig } from '../_hooks/use-selected-balance-info'
import { useDepositActions } from '../../_hooks/use-deposit-state'

const PERCENT_OPTIONS = [
  { label: '25%', value: '25' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: 'Max', value: '100' },
]

const UsdcDepositScreen = observer(function UsdcDepositScreen() {
  const selectedTokenBalance = useSelectedTokenBalance()
  const selectedTokenConfig = useSelectedTokenConfig()
  const { setDepositAmount } = useDepositActions()

  const [amount, setAmount] = useState<string>('')
  const [selectedPercent, setSelectedPercent] = useState<string>('')

  // 是否余额不足
  const isInsufficientBalance = __DEV__ ? false : BNumber.from(amount).gt(selectedTokenBalance?.amount)
  // 是否满足最低充值
  const isValid = __DEV__
    ? true
    : BNumber.from(amount).gte(selectedTokenBalance?.minAmount) &&
      BNumber.from(amount).lte(selectedTokenBalance?.amount)

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
        const calculated = BNumber.from(selectedTokenBalance?.amount ?? 0)
          .multipliedBy(pct)
          .dividedBy(100)
          .toString()
        setAmount(calculated)
      }
    },
    [selectedTokenBalance?.amount],
  )

  const handleConfirmInput = useCallback(() => {
    if (amount && isValid) {
      setDepositAmount(amount)
      router.push('/(assets)/deposit/wallet-transfer/usdc/confirm')
    }
  }, [amount, isValid, setDepositAmount])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>钱包转入</Trans>} />

      <View className="gap-xl flex-1 px-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>
              余额：
              {BNumber.toFormatNumber(selectedTokenBalance?.amount, {
                unit: selectedTokenConfig?.symbol,
                volScale: selectedTokenConfig?.displayDecimals,
              })}
            </Trans>
          </Text>
        </View>

        <View className="gap-3xl">
          <View className="gap-large items-center">
            <View className="gap-xs flex-row items-center">
              {selectedTokenConfig?.iconUrl ? (
                <Image source={{ uri: selectedTokenConfig?.iconUrl }} style={{ width: 24, height: 24 }} />
              ) : null}
              <Text className="text-paragraph-p2 text-content-1">{renderFallback(selectedTokenConfig?.symbol)}</Text>
            </View>

            <View className="border-brand-default w-full border-b py-4">
              <NumberInputPrimitive
                value={amount}
                onValueChange={handleValueChange}
                decimalScale={selectedTokenConfig?.displayDecimals}
                placeholder={renderFallbackPlaceholder({ volScale: selectedTokenConfig?.displayDecimals })}
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
})

export default UsdcDepositScreen
