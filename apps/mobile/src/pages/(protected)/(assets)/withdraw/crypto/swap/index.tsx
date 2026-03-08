import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { Option } from '@/components/ui/select'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { IconSolana } from '@/components/ui/icons/set/solana'
import { IconSwap } from '@/components/ui/icons/set/swap'
import { IconUSDT } from '@/components/ui/icons/set/usdt'
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'

import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { SignatureFailModal } from '../../../deposit/wallet-transfer/_comps/signature-fail-modal'
import { SignatureSuccessModal } from '../../../deposit/wallet-transfer/_comps/signature-success-modal'

export type SignatureStatus = 'idle' | 'signing' | 'success' | 'failed'

type PageMode = 'input' | 'confirm'

const MOCK_BALANCE = 10.5
const MOCK_WALLET_ADDRESS = '0x862D...B22A'
const COUNTDOWN_SECONDS = 30

const PERCENT_OPTIONS = [
  { label: '25%', value: '25' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: 'Max', value: '100' },
]

const TOKEN_OPTIONS: Option[] = [{ label: 'SOL', value: 'SOL' }]

const formatCurrency = (num: number): string =>
  num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SwapWithdrawScreen = observer(function SwapWithdrawScreen() {
  const selectedAccount = useSelectedWithdrawAccount()
  const [mode, setMode] = useState<PageMode>('input')
  const [sendAmount, setSendAmount] = useState<number | null>(null)
  const [sendDisplayText, setSendDisplayText] = useState('')
  const [selectedToken, setSelectedToken] = useState<Option>(TOKEN_OPTIONS[0])
  const [selectedPercent, setSelectedPercent] = useState<string>('')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const receiveAmount = sendAmount ? sendAmount * 150 : 0
  const isValid = (sendAmount ?? 0) > 0 && (sendAmount ?? 0) <= MOCK_BALANCE

  const handleTextChange = useCallback((text: string) => {
    const digits = text.replace(/[^0-9.]/g, '')
    if (digits === '') {
      setSendAmount(null)
      setSendDisplayText('')
      setSelectedPercent('')
      return
    }
    const num = parseFloat(digits)
    if (!isNaN(num)) {
      setSendAmount(num)
      setSendDisplayText(digits)
      setSelectedPercent('')
    }
  }, [])

  const handlePercentChange = useCallback((value: string) => {
    setSelectedPercent(value)
    const pct = Number(value)
    if (pct > 0) {
      const calculated = Math.floor(((MOCK_BALANCE * pct) / 100) * 100) / 100
      setSendAmount(calculated)
      setSendDisplayText(formatCurrency(calculated))
    }
  }, [])

  const handleConfirmInput = useCallback(() => {
    setMode('confirm')
    setCountdown(COUNTDOWN_SECONDS)
  }, [])

  useEffect(() => {
    if (mode !== 'confirm') return

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
  }, [mode])

  const handleConfirmSwap = useCallback(() => {
    setShowSignatureModal(true)
    setSignatureStatus('signing')
    setTimeout(() => {
      setSignatureStatus('success')
    }, 3000)
  }, [])

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
      router.push('/(assets)/withdraw/crypto/usdc/verify')
    }
  }, [signatureStatus])

  const formattedSendAmount = sendAmount ? formatCurrency(sendAmount) : '0.00'
  const formattedReceiveAmount = formatCurrency(receiveAmount)

  const tokenIcon = <IconSolana width={20} height={20} />

  if (mode === 'confirm') {
    return (
      <View className="gap-xl flex-1">
        <ScreenHeader
          content={
            <Text>
              <Trans>订单确认</Trans> {countdown}S
            </Text>
          }
        />

        <View className="gap-xl flex-1">
          <View className="gap-medium px-5">
            <Card>
              <CardContent className="py-medium gap-large">
                <View className="flex-row items-center justify-between">
                  <Text className="text-paragraph-p2 text-content-4">
                    <Trans>付</Trans>
                  </Text>
                  <Text className="text-paragraph-p2 text-status-danger">-{formattedSendAmount} SOL</Text>
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
                  <Text className="text-paragraph-p2 text-status-success">+{formattedReceiveAmount} USDT</Text>
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
                <FeeRow label={<Trans>兑换率</Trans>} value="1 SOL ≈ 150 USDT" />
                <FeeRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
                <FeeRow label={<Trans>Gas费</Trans>} value="0.0001 SOL" />
                <FeeRow label={<Trans>预计到账</Trans>} value={`${formattedReceiveAmount} USDT`} />
                <FeeRow label={<Trans>服务费</Trans>} value="免费" />
              </CardContent>
            </Card>
            <Text className="text-paragraph-p3 text-content-4 mt-medium text-center">
              <Trans>兑换服务由 Jup Swap 提供</Trans>
            </Text>
          </View>
        </View>

        <SafeAreaView edges={['bottom']}>
          <View className="px-5">
            <Button block size="lg" color="primary" onPress={handleConfirmSwap} disabled={countdown <= 0}>
              <Text>
                <Trans>确认兑换</Trans>
              </Text>
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
  }

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>加密货币取现</Trans>} />

      <View className="gap-xl flex-1">
        <View className="px-5">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>余额：{MOCK_BALANCE} SOL</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>最低取现 200 USDC</Trans>
          </Text>
        </View>

        <View className="gap-xl px-5">
          <Card className="rounded-small">
            <CardContent className="py-xl px-xl gap-medium">
              <View className="flex-row items-center justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>你将发送</Trans>
                </Text>
                <Text className="text-paragraph-p3 text-content-4">
                  <Trans>可用：{MOCK_BALANCE} SOL</Trans>
                </Text>
              </View>

              <View className="gap-medium flex-row items-center">
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger LeftContent={tokenIcon} placeholder="选择代币">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOKEN_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} label={option.label} />
                    ))}
                  </SelectContent>
                </Select>

                <View className="flex-1">
                  <TextInput
                    value={sendDisplayText}
                    onChangeText={handleTextChange}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#656886"
                    className="text-paragraph-p1 text-content-1 p-0 text-right"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-center">
                <Tabs value={selectedPercent} onValueChange={handlePercentChange}>
                  <TabsList variant="solid" size="sm">
                    {PERCENT_OPTIONS.map((opt) => (
                      <TabsTrigger key={opt.value} value={opt.value}>
                        <Text>{opt.label}</Text>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </View>
            </CardContent>
          </Card>

          <View className="items-center">
            <IconSwap width={24} height={24} className="text-content-4" />
          </View>

          <Card className="rounded-small">
            <CardContent className="py-xl px-xl gap-medium">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>你将收到</Trans>
              </Text>

              <View className="gap-medium flex-row items-center">
                <View className="gap-xs flex-row items-center">
                  <IconUSDT width={20} height={20} />
                  <Text className="text-paragraph-p2 text-content-1">USDT</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-paragraph-p1 text-content-1 text-right">{formattedReceiveAmount}</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        <View className="px-5">
          <Card>
            <CardContent className="py-medium gap-large">
              <FeeRow label={<Trans>兑换率</Trans>} value="1 SOL ≈ 150 USDT" />
              <FeeRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
              <FeeRow label={<Trans>Gas费</Trans>} value="0.0001 SOL" />
              <FeeRow label={<Trans>预计到账</Trans>} value={`${formattedReceiveAmount} USDT`} />
              <FeeRow label={<Trans>服务费</Trans>} value="免费" />
            </CardContent>
          </Card>
          <Text className="text-paragraph-p3 text-content-4 mt-medium text-center">
            <Trans>兑换服务由 Jup Swap 提供</Trans>
          </Text>
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

export default SwapWithdrawScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
