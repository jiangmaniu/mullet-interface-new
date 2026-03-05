import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'

import { useWithdrawStore } from '../../../_store'

const MOCK_WALLET_ADDRESS = '0x862D...B22A'
const COUNTDOWN_SECONDS = 30

const formatCurrency = (num: number): string =>
  num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const UsdcWithdrawConfirmScreen = observer(function UsdcWithdrawConfirmScreen() {
  const withdrawSourceAccount = useWithdrawStore((s) => s.withdrawSourceAccount)
  const withdrawAmount = useWithdrawStore((s) => s.withdrawAmount)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)

  const selectedAccount = withdrawSourceAccount
  const amount = parseFloat(withdrawAmount) || 0
  const formattedAmount = formatCurrency(amount)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleConfirmWithdraw = useCallback(() => {
    router.push('/(assets)/withdraw/crypto/usdc/verify')
  }, [])

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>订单确认</Trans>} />

      <View className="gap-xl flex-1">
        <View className="gap-medium px-5">
          <Card>
            <CardContent className="py-medium gap-large">
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>付</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-status-danger">-{formattedAmount} USDC</Text>
              </View>
              <View className="gap-medium flex-row items-center">
                <IconAppLogoCircle width={24} height={24} />
                <View>
                  <Text className="text-paragraph-p2 text-content-1">{selectedAccount?.id ?? '-'}</Text>
                  <Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-medium gap-large">
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p2 text-content-4">
                  <Trans>收</Trans>
                </Text>
                <Text className="text-paragraph-p2 text-status-success">+{formattedAmount} USDC</Text>
              </View>
              <View className="gap-medium flex-row items-center">
                <IconOkxWallet width={24} height={24} />
                <View>
                  <Text className="text-paragraph-p2 text-content-1">
                    <Trans>未知钱包</Trans>
                  </Text>
                  <Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        <View className="px-5">
          <Card>
            <CardContent className="py-medium gap-large">
              <FeeRow label={<Trans>兑换率</Trans>} value="1：1" />
              <FeeRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
              <FeeRow label={<Trans>Gas费</Trans>} value="0.0001 SOL" />
              <FeeRow label={<Trans>预计到账</Trans>} value={`${formattedAmount} USDC`} />
              <FeeRow label={<Trans>服务费</Trans>} value="免费" />
            </CardContent>
          </Card>
        </View>
      </View>

      <SafeAreaView edges={['bottom']}>
        <View className="px-5">
          <Button block size="lg" color="primary" onPress={handleConfirmWithdraw} disabled={countdown <= 0}>
            <Text>
              <Trans>确认取现</Trans>
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </View>
  )
})

export default UsdcWithdrawConfirmScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
