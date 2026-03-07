import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { router } from 'expo-router'

import { Button } from '@/components/ui/button'
import { IconifyEmailIn } from '@/components/ui/icons/iconify'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useStores } from '@/v1/provider/mobxProvider'

import { useSendOtp } from '../../_apis/use-send-otp'
import { useSolanaTransfer } from '../../_apis/use-solana-transfer'
import { useSelectedWithdrawAccount } from '../../_hooks/use-selected-account'
import { useSelectedChainInfo } from '../../_hooks/use-selected-chain-info'
import { useWithdrawActions, useWithdrawState } from '../../_hooks/use-withdraw-state'
import { WithdrawSuccessModal } from '../usdc/_comps/withdraw-success-modal'

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60 // seconds
const CODE_MOCK = '123456'

const VerifyScreen = observer(function VerifyScreen() {
  const { user } = useStores()
  const { mutateAsync: sendOtpAsync, isPending: isSending } = useSendOtp()
  const [code, setCode] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { reset } = useWithdrawActions()

  // 出金相关数据
  const selectedAccount = useSelectedWithdrawAccount()
  const { withdrawAddress, withdrawAmount, selectedAccountId } = useWithdrawState()
  const { tokenInfo } = useSelectedChainInfo()
  const { mutate: transfer, isPending: isTransferring } = useSolanaTransfer()

  const userEmail = user.currentUser.userInfo?.email
  const userId = user.currentUser.userInfo?.id

  // 页面加载时自动发送验证码
  useEffect(() => {
    const initSendOtp = async () => {
      if (!userId) {
        console.error('User ID not found')
        return
      }

      try {
        const result = await sendOtpAsync({ userId: String(userId), email: userEmail })
        setCountdown(RESEND_COOLDOWN)
        // 开发环境自动填充验证码
        if (__DEV__) {
          console.log('Dev mode - OTP code:', result.code || CODE_MOCK)
          setCode(result.code || CODE_MOCK)
        }
      } catch (error: any) {
        console.error('Failed to send OTP:', error)
        toast.error(error?.msg || <Trans>发送验证码失败</Trans>)
      }
    }

    initSendOtp()
  }, [userId, sendOtpAsync, userEmail])

  // Auto-blur on code complete
  const ref = useBlurOnFulfill({ value: code, cellCount: CODE_LENGTH })

  // Clear cell on focus
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  })

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [countdown])

  const handleResend = useCallback(async () => {
    if (countdown > 0 || !userId) return

    try {
      await sendOtpAsync({ userId: String(userId), email: userEmail })
      setCountdown(RESEND_COOLDOWN)
      setCode('') // 清空之前的验证码
    } catch (error: any) {
      console.error('Failed to resend OTP:', error)
      toast.error(error?.msg || <Trans>重新发送失败</Trans>)
    }
  }, [countdown, userId, sendOtpAsync, userEmail])

  const handleConfirm = useCallback(async () => {
    if (code.length !== CODE_LENGTH) return

    // 验证成功后调用出金接口
    if (!selectedAccount?.id || !withdrawAddress || !withdrawAmount || !tokenInfo) {
      toast.error(<Trans>缺少必要参数</Trans>)
      return
    }

    transfer(
      {
        tradeAccountId: selectedAccount.id,
        toAddress: withdrawAddress,
        token: tokenInfo.symbol,
        amount: withdrawAmount,
        verifyCode: code,
      },
      {
        onSuccess: (data) => {
          console.log('Transfer success:', data)
          setShowSuccessModal(true)
        },
        onError: (error: any) => {
          console.error('Transfer failed:', error)
          toast.error(error?.msg || <Trans>提现失败</Trans>)
          router.back()
        },
      },
    )
  }, [code, selectedAccount, withdrawAddress, withdrawAmount, tokenInfo, transfer])

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    const accountId = selectedAccountId
    reset() // 重置 store 状态
    router.replace({ pathname: '/(protected)/(assets)/withdraw', params: { accountId } }) // 跳转到 提现 页面
  }

  const isCodeComplete = code.length === CODE_LENGTH
  const isLoading = isSending || isTransferring

  return (
    <View className="bg-background-secondary flex-1">
      <ScreenHeader content={<Trans>安全验证</Trans>} />

      <View className="gap-4xl flex-1 px-6 pt-8">
        {/* 头部 */}
        <View className="gap-xs items-center">
          <IconifyEmailIn width={40} height={40} className="text-content-1" />
          <Text className="text-paragraph-p2 text-content-1">
            <Trans>请输入邮箱验证码</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-4 text-center">
            <Trans>请检查邮箱{userEmail}，查看来自Mullet的邮件，并在下方输入您的验证码</Trans>
          </Text>
        </View>

        {/* 验证码输入框 */}
        <CodeField
          ref={ref}
          {...props}
          value={code}
          onChangeText={setCode}
          cellCount={CODE_LENGTH}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          renderCell={({ index, symbol, isFocused }) => (
            <TextInput
              key={index}
              value={symbol}
              onLayout={getCellOnLayoutHandler(index)}
              editable={false}
              className={cn('text-title-h2 text-content-1 rounded-small h-10 w-10 border text-center', {
                'border-brand-important': isFocused,
                'border-brand-default': !isFocused,
              })}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </TextInput>
          )}
        />

        {/* 重新发送 */}
        <View className="gap-xs flex-row items-center justify-center">
          <Text className="text-paragraph-p3 text-content-1">
            <Trans>没有收到验证码？</Trans>
          </Text>
          <Pressable onPress={handleResend} disabled={countdown > 0}>
            <Text className={`text-paragraph-p3 ${countdown > 0 ? 'text-content-4' : 'text-brand-primary'}`}>
              {countdown > 0 ? `${countdown}s` : <Trans>重新发送</Trans>}
            </Text>
          </Pressable>
        </View>

        {/* 确认按钮 */}
        <View className="items-center">
          <Button
            block
            size="lg"
            color="primary"
            disabled={!isCodeComplete || isLoading}
            onPress={handleConfirm}
            className="w-full"
          >
            <Text>
              <Trans>{isLoading ? '处理中...' : '确认'}</Trans>
            </Text>
          </Button>
        </View>
      </View>

      <WithdrawSuccessModal visible={showSuccessModal} onClose={handleCloseSuccessModal} />
    </View>
  )
})

export default VerifyScreen
