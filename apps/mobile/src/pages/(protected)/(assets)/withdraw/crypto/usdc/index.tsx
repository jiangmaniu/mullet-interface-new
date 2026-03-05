import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1'
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'

import { useWithdrawStore } from '../../_store'

const MOCK_BALANCE = 3532.0
const MOCK_WALLET_ADDRESS = '0x862D...B22A'

const PERCENT_OPTIONS = [
  { label: '25%', value: '25' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: 'Max', value: '100' },
]

const formatCurrency = (num: number): string =>
  num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const UsdcWithdrawScreen = observer(function UsdcWithdrawScreen() {
  const setWithdrawAmount = useWithdrawStore((s) => s.setWithdrawAmount)
  const [amount, setAmount] = useState<number | null>(null)
  const [displayText, setDisplayText] = useState('')
  const [selectedPercent, setSelectedPercent] = useState<string>('')

  const isValid = (amount ?? 0) > 0 && (amount ?? 0) <= MOCK_BALANCE

  const handleTextChange = useCallback((text: string) => {
    const digits = text.replace(/[^0-9.]/g, '')
    if (digits === '') {
      setAmount(null)
      setDisplayText('')
      setSelectedPercent('')
      return
    }
    const num = parseFloat(digits)
    if (!isNaN(num)) {
      setAmount(num)
      setDisplayText(digits)
      setSelectedPercent('')
    }
  }, [])

  const handlePercentChange = useCallback((value: string) => {
    setSelectedPercent(value)
    const pct = Number(value)
    if (pct > 0) {
      const calculated = Math.floor(((MOCK_BALANCE * pct) / 100) * 100) / 100
      setAmount(calculated)
      setDisplayText(formatCurrency(calculated))
    }
  }, [])

  const handleConfirmInput = useCallback(() => {
    if (amount) {
      setWithdrawAmount(amount.toString())
      router.push('/(assets)/withdraw/crypto/usdc/confirm')
    }
  }, [amount, setWithdrawAmount])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>加密货币取现</Trans>} />

      <View className="gap-xl flex-1">
        <View className="px-5">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>余额：${formatCurrency(MOCK_BALANCE)}</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>最低取现 200 USDC</Trans>
          </Text>
        </View>

        <View className="gap-3xl px-5">
          <View className="gap-xl">
            <View className="items-center">
              <IconUSDC1 width={48} height={48} />

              <Text className="text-paragraph-p2 text-content-1 mt-medium">USDC</Text>

              <View className="gap-xs py-3xl flex-row items-center justify-center">
                <TextInput
                  value={displayText}
                  onChangeText={handleTextChange}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#656886"
                  className="text-title-h1 text-content-1 p-0 text-center"
                />
              </View>
            </View>

            <View className="flex-row items-center justify-center">
              <Tabs value={selectedPercent} onValueChange={handlePercentChange}>
                <TabsList variant="solid" size="md">
                  {PERCENT_OPTIONS.map((opt) => (
                    <TabsTrigger key={opt.value} value={opt.value}>
                      <Text>{opt.label}</Text>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </View>
          </View>

          <View className="gap-medium">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>接收地址</Trans>
            </Text>
            <Card className="rounded-small">
              <CardContent className="py-xl px-xl">
                <View className="gap-medium flex-row items-center">
                  <IconOkxWallet width={24} height={24} />
                  <View className="flex-1">
                    <Text className="text-paragraph-p2 text-content-1">OKX Wallet</Text>
                    <Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5">
          <Button block size="lg" color="primary" disabled={!isValid} onPress={handleConfirmInput}>
            <Text>
              <Trans>确定</Trans>
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
})

export default UsdcWithdrawScreen
