import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { SignatureStatus } from '../../../_comps/wallet-deposit-card/signature-status-modal'

import { Button } from '@/components/ui/button'
import { IconAppLogoCircle } from '@/components/ui/icons/set/app-logo-circle'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { useWalletInfo } from '@/lib/appkit'
import { formatAddress, renderFallback } from '@mullet/utils/format'
import { BNumber } from '@mullet/utils/number'

import { useSelectedTokenConfig } from '../../_hooks/use-selected-balance-info'
import { SignatureStatusModal } from '../../../_comps/wallet-deposit-card/signature-status-modal'
import { useDepositState } from '../../../_hooks/use-deposit-state'
import { useSelectedDepositAccount } from '../../../_hooks/use-selected-account'

const COUNTDOWN_SECONDS = 30

const UsdcConfirmScreen = observer(function UsdcConfirmScreen() {
  const { fromWalletAddress, toWalletAddress, depositAmount } = useDepositState()
  const selectedAccount = useSelectedDepositAccount()
  const selectedTokenConfig = useSelectedTokenConfig()

  // Web3 wallet state
  const { walletInfo } = useWalletInfo()

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle')
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // const isConnectedWallet = useMemo(() => {
  //   if (!connectedWalletAddress || !toWalletAddress) return false
  //   return connectedWalletAddress.toLowerCase() === toWalletAddress.toLowerCase()
  // }, [connectedWalletAddress, toWalletAddress])

  const formattedAmount = BNumber.toFormatNumber(depositAmount, {
    volScale: selectedTokenConfig?.displayDecimals,
  })

  // 倒计时
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

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
      // 返回到钱包转入列表页
      router.back()
      router.back()
    }
  }, [signatureStatus])

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
        <View className="border-brand-default rounded-small px-xl py-medium border">
          <View className="gap-xs">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>付</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                {walletInfo?.icon && (
                  <Image source={{ uri: walletInfo.icon }} style={{ width: 24, height: 24, borderRadius: 4 }} />
                )}
                <View className="gap-xs">
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
          </View>
        </View>

        {/* 收款信息 */}
        <View className="border-brand-default rounded-small px-xl py-medium border">
          <View className="gap-xs">
            <Text className="text-paragraph-p3 text-content-1">
              <Trans>收</Trans>
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="gap-medium flex-row items-center">
                <IconAppLogoCircle width={24} height={24} />
                <View className="gap-xs">
                  <Text className="text-paragraph-p2 text-content-1">{renderFallback(selectedAccount?.id)}</Text>
                  <Text className="text-paragraph-p3 text-content-4">{formatAddress(toWalletAddress)}</Text>
                </View>
              </View>
              <Text className="text-paragraph-p2 text-content-1">
                {BNumber.toFormatNumber(depositAmount, {
                  positive: false,
                  forceSign: true,
                  unit: selectedTokenConfig?.symbol,
                  volScale: selectedTokenConfig?.displayDecimals,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* 交易详情 */}
        <View className="gap-medium">
          <InfoRow label={<Trans>兑换率</Trans>} value="1 : 1" />
          <InfoRow label={<Trans>到账时间</Trans>} value="≈1分钟" />
          <InfoRow label={<Trans>Gas费</Trans>} value="0.0001 SOL" />
          <InfoRow
            label={<Trans>预计到账</Trans>}
            value={`${formattedAmount} ${selectedTokenConfig?.symbol ?? 'USDC'}`}
          />
          <InfoRow label={<Trans>服务费</Trans>} value={<Trans>免费</Trans>} />
        </View>
      </View>

      {/* 底部按钮 */}
      <SafeAreaView edges={['bottom']}>
        <View className="px-5">
          <Button block size="lg" color="primary" onPress={handleConfirmTransfer} disabled={countdown <= 0}>
            <Text>
              <Trans>确定</Trans>
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
        sendToken={selectedTokenConfig?.symbol ?? 'USDC'}
        receiveAmount={formattedAmount}
        receiveToken={selectedTokenConfig?.symbol ?? 'USDC'}
      />
    </View>
  )
})

export default UsdcConfirmScreen

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-paragraph-p2 text-content-4">{label}</Text>
      <Text className="text-paragraph-p2 text-content-1">{value}</Text>
    </View>
  )
}
