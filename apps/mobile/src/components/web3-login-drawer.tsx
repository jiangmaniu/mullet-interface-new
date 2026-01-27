import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useLoginWithSiws, usePrivy } from '@privy-io/expo'
import { router } from 'expo-router'
import bs58 from 'bs58';


import { useAppKit, useAccount, useProvider, useAppKitState } from '@/lib/appkit'
import { useAuthStore } from '@/stores/auth'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'

// 步骤状态
type StepStatus = 'pending' | 'loading' | 'completed' | 'error'

interface StepState {
  status: StepStatus
  error?: string
}

interface Web3LoginDrawerProps {
  visible: boolean
  onClose: () => void
}

export function Web3LoginDrawer({ visible, onClose: onCloseProp }: Web3LoginDrawerProps) {
  const { generateMessage, login: loginWithSiws } = useLoginWithSiws()
  const { user: privyUser } = usePrivy()
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { provider } = useProvider()
  const { loginWithPrivy: loginBackend } = useAuthStore()
  const { isOpen: isAppKitOpen } = useAppKitState()

  // 跟踪 AppKit 对话框状态
  const prevAppKitOpen = useRef(false)

  // 三个步骤的状态
  const [step1, setStep1] = useState<StepState>({ status: 'pending' })
  const [step2, setStep2] = useState<StepState>({ status: 'pending' })
  const [step3, setStep3] = useState<StepState>({ status: 'pending' })

  // 当前活动步骤 (1, 2, 3)
  const currentStep =
    step1.status !== 'completed' ? 1 : step2.status !== 'completed' ? 2 : 3

  // 重置所有状态
  const resetSteps = useCallback(() => {
    setStep1({ status: 'pending' })
    setStep2({ status: 'pending' })
    setStep3({ status: 'pending' })
  }, [])

  // 监听 AppKit 对话框关闭事件
  useEffect(() => {
    // 当 AppKit 对话框从打开变为关闭，且钱包未连接时，重置步骤状态
    if (prevAppKitOpen.current && !isAppKitOpen && !isConnected && step1.status === 'loading') {
      setStep1({ status: 'pending' })
    }
    prevAppKitOpen.current = isAppKitOpen
  }, [isAppKitOpen, isConnected, step1.status])

  // 关闭抽屉并重置状态
  const handleClose = useCallback(() => {
    resetSteps()
    onCloseProp()
  }, [resetSteps, onCloseProp])

  // Drawer 状态变化处理
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose()
      }
    },
    [handleClose]
  )

  // 第三步：登录后端 API
  const handleApiLogin = useCallback(async () => {
    setStep3({ status: 'loading' })

    try {
      const success = await loginBackend()
      if (success) {
        setStep3({ status: 'completed' })
        // 登录成功，提示并关闭抽屉
        Alert.alert('成功', '登录成功！', [
          {
            text: '确定',
            onPress: () => {
              handleClose()
              router.replace('/' as '/')
            },
          },
        ])
      } else {
        setStep3({ status: 'error', error: '登录失败，请重试' })
      }
    } catch (error) {
      console.error('API login failed:', error)
      setStep3({
        status: 'error',
        error: error instanceof Error ? error.message : '登录失败',
      })
    }
  }, [loginBackend, handleClose])

  // 第二步：验证钱包（签名 + 登录 Privy）
  const handleVerifyWallet = useCallback(async () => {
    if (privyUser) {
      setStep2({ status: 'completed' })
      // 继续第三步
      handleApiLogin()
      return
    }

    if (!address || !provider) {
      setStep2({ status: 'error', error: '钱包未连接' })
      return
    }

    setStep2({ status: 'loading' })

    try {
      // 1. 生成 SIWS 消息
      const { message } = await generateMessage({
        wallet: { address },
        from: {
          domain: 'mullet.top',
          uri: 'https://mullet.top',
        },
      })

      // 2. 使用 provider 签名消息
      const messageBytes = bs58.encode(new TextEncoder().encode(message))

      const signatureResult = await provider.request({
        method: 'solana_signMessage',
        params: {
          // message: Buffer.from(messageBytes).toString('base64'),
          // message: messageBytes,
          message: messageBytes,
          pubkey: address,
        },
      })


      console.log(signatureResult)


      function base58ToBase64(base58String: string): string {
        const bytes = bs58.decode(base58String);

        const base64String = Buffer.from(bytes).toString('base64');

        return base64String;
      }


      // 获取签名
      const signature =
        typeof signatureResult === 'object' && signatureResult !== null
          ? (signatureResult as { signature?: string }).signature ||
          JSON.stringify(signatureResult)
          : String(signatureResult)

      // 3. 使用签名登录 Privy
      await loginWithSiws({
        signature: base58ToBase64(signature),
        message,
        wallet: {
          walletClientType: 'reown',
          connectorType: 'walletConnect',
        },
      })

      // Privy 登录成功会通过 useEffect 监听
    } catch (error: any) {
      console.error('Verify wallet failed:', error)
      setStep2({
        status: 'error',
        error: error.message || '验证失败',
      })
    }
  }, [privyUser, address, provider, generateMessage, loginWithSiws, handleApiLogin])

  // 第一步：连接钱包
  const handleConnectWallet = useCallback(async () => {
    if (isConnected && address) {
      setStep1({ status: 'completed' })
      // 继续第二步
      handleVerifyWallet()
      return
    }

    setStep1({ status: 'loading' })
    try {
      await open()
      // 连接结果会通过 useEffect 监听
    } catch (error) {
      console.error('Failed to open wallet modal:', error)
      setStep1({ status: 'error', error: '打开钱包失败' })
    }
  }, [isConnected, address, open, handleVerifyWallet])

  // 当抽屉打开时，自动开始第一步
  useEffect(() => {
    if (visible) {
      // 如果已连接，直接标记第一步完成
      if (isConnected && address) {
        setStep1({ status: 'completed' })
        // 如果 Privy 已登录，标记第二步完成
        // if (privyUser) {
        setStep2({ status: 'completed' })
        // }
      } else {
        // 自动开始连接钱包
        handleConnectWallet()
      }
    } else {
      // 关闭时重置状态
      resetSteps()
    }
  }, [visible, isConnected, address, privyUser, handleConnectWallet, resetSteps])

  // 监听钱包连接状态变化
  useEffect(() => {
    if (visible && isConnected && address && step1.status === 'loading') {
      setStep1({ status: 'completed' })
      // 自动开始第二步
      handleVerifyWallet()
    }
  }, [visible, isConnected, address, step1.status, handleVerifyWallet])

  // 监听 Privy 登录状态变化
  useEffect(() => {
    if (visible && privyUser && step2.status === 'loading') {
      setStep2({ status: 'completed' })
      // 自动开始第三步
      handleApiLogin()
    }
  }, [visible, privyUser, step2.status, handleApiLogin])

  // 获取按钮文字和处理函数
  const getButtonConfig = () => {
    if (currentStep === 1) {
      return {
        text: '连接',
        onPress: handleConnectWallet,
        disabled: step1.status === 'loading',
        loading: step1.status === 'loading',
      }
    }
    if (currentStep === 2) {
      return {
        text: '验证',
        onPress: handleVerifyWallet,
        disabled: step2.status === 'loading',
        loading: step2.status === 'loading',
      }
    }
    return {
      text: '登录',
      onPress: handleApiLogin,
      disabled: step3.status === 'loading',
      loading: step3.status === 'loading',
    }
  }

  const buttonConfig = getButtonConfig()

  // 渲染步骤图标
  const renderStepIcon = (step: number, state: StepState) => {
    const isActive = currentStep === step
    const isCompleted = state.status === 'completed'
    const isLoading = state.status === 'loading'

    if (isLoading) {
      return (
        <View className="w-10 h-10 rounded-full border-2 border-green-500 items-center justify-center">
          <ActivityIndicator size="small" color="#2ebc84" />
        </View>
      )
    }

    if (isCompleted) {
      return (
        <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center">
          <Text className="text-white text-lg font-bold">✓</Text>
        </View>
      )
    }

    return (
      <View
        className={`w-10 h-10 rounded-full border-2 items-center justify-center ${isActive ? 'border-green-500' : 'border-zinc-300/50'
          }`}
      >
        <Text
          className={`text-paragraph-p1 font-semibold ${isActive ? 'text-green-500' : 'text-content-4'
            }`}
        >
          {step}
        </Text>
      </View>
    )
  }

  // 渲染步骤连接线
  const renderStepLine = (state: StepState) => {
    const isCompleted = state.status === 'completed'
    return (
      <View
        className={`w-0.5 h-6 ml-5 mb-1 rounded-b-full ${isCompleted ? 'bg-green-500' : 'bg-zinc-300/50'
          }`}
      />
    )
  }

  return (
    <Drawer open={visible} onOpenChange={handleOpenChange}>
      <DrawerContent>
        {/* 标题栏 */}
        <DrawerHeader>
          <DrawerTitle>登录</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>

        {/* 副标题 */}
        <DrawerDescription>
          按照三个简单步骤连接您的钱包到 Mullet。
        </DrawerDescription>

        {/* 步骤列表 */}
        <View className="mb-8">
          {/* 第一步：连接 */}
          <View className="flex-row items-start">
            <View className="h-full">
              {renderStepIcon(1, step1)}
              <View
                className={`w-0.5 rounded-t-full flex-1 ml-5 mt-1 ${step1.status === 'completed' ? 'bg-green-500' : 'bg-zinc-300/50'
                  }`}
              />
            </View>
            <View className="ml-4 flex-1 pt-0.5">
              <Text className="text-white text-paragraph-p1 font-semibold mb-1">
                连接钱包
              </Text>
              <Text className="text-content-4 text-paragraph-p2 leading-5">
                您将收到 1 个签名请求。签名是免费的，不会触发任何交易。
              </Text>
              {step1.status === 'error' && (
                <Text className="text-red-500 text-paragraph-p3 mt-1">{step1.error}</Text>
              )}
            </View>
          </View>

          {renderStepLine(step1)}

          {/* 第二步：验证 */}
          <View className="flex-row items-start">
            <View className="h-full">
              {renderStepIcon(2, step2)}
              <View
                className={`w-0.5 rounded-t-full flex-1 ml-5 mt-1 ${step2.status === 'completed' ? 'bg-green-500' : 'bg-zinc-300/50'
                  }`}
              />
            </View>
            <View className="ml-4 flex-1 pt-0.5">
              <Text className="text-white text-paragraph-p1 font-semibold mb-1">
                验证授权
              </Text>
              <Text className="text-content-4 text-paragraph-p2 leading-5">
                请确认您是此钱包的所有者。
              </Text>
              {step2.status === 'error' && (
                <Text className="text-red-500 text-paragraph-p3 mt-1">{step2.error}</Text>
              )}
            </View>
          </View>

          {renderStepLine(step2)}

          {/* 第三步：启用交易 */}
          <View className="flex-row items-start">
            <View className="h-full">{renderStepIcon(3, step3)}</View>
            <View className="ml-4 flex-1 pt-0.5">
              <Text className="text-white text-paragraph-p1 font-semibold mb-1">
                启用交易
              </Text>
              <Text className="text-content-4 text-paragraph-p2 leading-5">
                为我们的 API 启用安全访问，以便快速交易。
              </Text>
              {step3.status === 'error' && (
                <Text className="text-red-500 text-paragraph-p3 mt-1">{step3.error}</Text>
              )}
            </View>
          </View>
        </View>

        {/* 操作按钮 */}
        <DrawerFooter>
          <Pressable
            onPress={buttonConfig.onPress}
            disabled={buttonConfig.disabled}
            className={`py-2 rounded-full items-center justify-center ${buttonConfig.disabled ? 'bg-zinc-700' : 'bg-white active:opacity-80'
              }`}
          >
            {buttonConfig.loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                className={`text-paragraph-p1 font-semibold ${buttonConfig.disabled ? 'text-zinc-500' : 'text-black'
                  }`}
              >
                {buttonConfig.text}
              </Text>
            )}
          </Pressable>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
