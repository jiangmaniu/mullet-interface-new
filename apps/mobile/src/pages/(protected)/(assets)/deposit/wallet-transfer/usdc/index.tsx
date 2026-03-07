import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { SignatureStatus } from '../../_comps/wallet-deposit-card/signature-status-modal'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { IconUSDC1 } from '@/components/ui/icons/set/usdc-1'
import { IconOkxWallet } from '@/components/ui/icons/set/wallet/okx-wallet'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { renderFallback } from '@mullet/utils/fallback'

import { SignatureStatusModal } from '../../_comps/wallet-deposit-card/signature-status-modal'
import { useSelectedDepositAccount } from '../../_hooks/use-selected-account'

type PageMode = 'input' | 'confirm'

const MOCK_BALANCE = 3532.0
const MOCK_WALLET_ADDRESS = '0x862D...B22A'
const COUNTDOWN_SECONDS = 30

const PERCENT_OPTIONS = [
  { label: '25%', value: '25' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: 'Max', value: '100' },
]

const formatCurrency = (num: number): string =>
  num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const UsdcTransferScreen = observer(function UsdcTransferScreen() {
  const selectedAccount = useSelectedDepositAccount()
  const [mode, setMode] = useState<PageMode>('input')
  const [amount, setAmount] = useState<number | null>(null)
  const [displayText, setDisplayText] = useState('')
  const [selectedPercent, setSelectedPercent] = useState<string>('')
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)

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
    setMode('confirm')
    setCountdown(COUNTDOWN_SECONDS)
  }, [])

  // 确认模式倒计时
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

  const handleConfirmTransfer = useCallback(() => {
    setShowSignatureModal(true)
    setSignatureStatus('signing')
    // Mock: 模拟签名过程
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
      setMode('input')
      setAmount(null)
      setDisplayText('')
      setSelectedPercent('')
    }
  }, [signatureStatus])

  const formattedAmount = amount ? formatCurrency(amount) : '0.00'

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
          {/* 付款信息 */}
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
                  <IconOkxWallet width={24} height={24} />
                  <View>
                    <Text className="text-paragraph-p2 text-content-1">OKX Wallet</Text>
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
                  <IconAppLogoCircle width={24} height={24} />
                  <View>
                    <Text className="text-paragraph-p2 text-content-1">{renderFallback(selectedAccount?.id)}</Text>
                    <Text className="text-paragraph-p3 text-content-4">{MOCK_WALLET_ADDRESS}</Text>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>

          {/* 费用明细 */}
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

        {/* 底部按钮 */}
        <SafeAreaView edges={['bottom']}>
          <View className="px-5">
            <Button block size="lg" color="primary" onPress={handleConfirmTransfer} disabled={countdown <= 0}>
              <Text>
                <Trans>确认转入</Trans>
              </Text>
            </Button>
          </View>
        </SafeAreaView>

        <SignatureStatusModal
          visible={showSignatureModal}
          status={signatureStatus}
          onClose={handleCloseSignatureModal}
          onRetry={handleRetrySignature}
          sendAmount={formattedAmount}
          sendToken="USDC"
          receiveAmount={formattedAmount}
          receiveToken="USDC"
        />
      </View>
    )
  }

  return (
    <View className="gap-xl flex-1">
      <ScreenHeader content={<Trans>钱包转入</Trans>} />

      <View className="gap-xl flex-1">
        {/* 余额 */}
        <View className="px-5">
          <Text className="text-paragraph-p2 text-content-4">
            <Trans>余额：${formatCurrency(MOCK_BALANCE)}</Trans>
          </Text>
        </View>

        <View className="gap-3xl px-5">
          {/* 金额输入区域 */}
          <View className="gap-xl">
            <View className="items-center">
              {/* USDC 图标 */}
              <IconUSDC1 width={48} height={48} />

              <Text className="text-paragraph-p2 text-content-1 mt-medium">USDC</Text>

              {/* 金额输入 */}
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

            {/* 百分比选择 */}
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
        </View>
      </View>

      {/* 底部按钮 */}
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

export default UsdcTransferScreen

function FeeRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p3 text-content-4">{label}</Text>
      <Text className="text-paragraph-p3 text-content-1">{value}</Text>
    </View>
  )
}
