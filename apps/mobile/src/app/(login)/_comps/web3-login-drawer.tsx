import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { usePrivy } from '@privy-io/expo'

import { useAppKit, useAccount, useAppKitState } from '@/lib/appkit'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useWalletAuth } from '../_hooks/use-wallet-auth'
import { useBackendLogin } from '../_hooks/use-backend-login'

// 步骤状态
type StepStatus = 'pending' | 'loading' | 'completed' | 'error'

interface StepState {
  status: StepStatus
  error?: string
}

interface Web3LoginDrawerProps {
  visible: boolean
  onClose: () => void
  /**
   * 自动开始授权流程（用于 401 重定向且钱包已连接的情况）
   * 当为 true 时，打开抽屉后会自动开始验证授权流程
   */
  autoStartAuth?: boolean
}

export function Web3LoginDrawer({ visible, onClose: onCloseProp, autoStartAuth = false }: Web3LoginDrawerProps) {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { isOpen: isAppKitOpen } = useAppKitState()

  // 跟踪 AppKit 对话框状态
  const prevAppKitOpen = useRef(false)

  // 两个步骤的状态
  const [step1, setStep1] = useState<StepState>({ status: 'pending' })
  const [step2, setStep2] = useState<StepState>({ status: 'pending' })

  // 当前活动步骤 (1, 2)
  const currentStep = step1.status !== 'completed' ? 1 : 2

  // 重置所有状态
  const resetSteps = useCallback(() => {
    setStep1({ status: 'pending' })
    setStep2({ status: 'pending' })
  }, [])

  // 关闭抽屉并重置状态
  const handleClose = useCallback(() => {
    resetSteps()
    onCloseProp()
  }, [resetSteps, onCloseProp])

  // 后端登录 hook
  const {
    loginToBackend,
    isLoading: isBackendLoading,
    error: backendError,
  } = useBackendLogin({
    onSuccess: handleClose,
    redirectOnSuccess: true,
  })

  // 钱包授权 hook
  const {
    signAndLoginPrivy,
    isLoading: isWalletAuthLoading,
    error: walletAuthError,
    isPrivyLoggedIn,
  } = useWalletAuth()

  // 监听 AppKit 对话框关闭事件
  useEffect(() => {
    // 当 AppKit 对话框从打开变为关闭，且钱包未连接时，重置步骤状态
    if (prevAppKitOpen.current && !isAppKitOpen && !isConnected && step1.status === 'loading') {
      setStep1({ status: 'pending' })
    }
    prevAppKitOpen.current = isAppKitOpen
  }, [isAppKitOpen, isConnected, step1.status])

  // Drawer 状态变化处理
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose()
      }
    },
    [handleClose]
  )

  // 第二步：验证授权（签名 + 登录 Privy + 登录后端）
  const handleVerifyAndLogin = useCallback(async () => {
    setStep2({ status: 'loading' })

    try {
      // 如果已登录 Privy，跳过签名步骤
      if (!isPrivyLoggedIn) {
        const authSuccess = await signAndLoginPrivy()
        if (!authSuccess) {
          setStep2({ status: 'error', error: walletAuthError || '验证失败' })
          return
        }
      }

      // 登录后端
      const backendSuccess = await loginToBackend()


      if (backendSuccess) {
        setStep2({ status: 'completed' })
      } else {
        setStep2({ status: 'error', error: backendError || '登录失败，请重试' })
      }
    } catch (error: any) {
      console.error('Verify and login failed:', error)
      setStep2({
        status: 'error',
        error: error.message || '验证失败',
      })
    }
  }, [isPrivyLoggedIn, signAndLoginPrivy, loginToBackend, walletAuthError, backendError])

  // 第一步：连接钱包
  const handleConnectWallet = useCallback(async () => {
    if (isConnected && address) {
      setStep1({ status: 'completed' })
      // 继续第二步
      handleVerifyAndLogin()
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
  }, [isConnected, address, open, handleVerifyAndLogin])

  // 当抽屉打开时，自动开始第一步
  useEffect(() => {
    if (visible) {
      // 如果已连接，直接标记第一步完成
      if (isConnected && address) {
        setStep1({ status: 'completed' })
        // 如果是自动授权模式，直接开始验证
        if (autoStartAuth) {
          console.log('Auto start auth: wallet connected, starting verification...')
          handleVerifyAndLogin()
        }
      } else {
        // 自动开始连接钱包
        handleConnectWallet()
      }
    } else {
      // 关闭时重置状态
      resetSteps()
    }
  }, [visible, isConnected, address, handleConnectWallet, resetSteps, autoStartAuth, handleVerifyAndLogin])

  // 监听钱包连接状态变化
  useEffect(() => {
    if (visible && isConnected && address && step1.status === 'loading') {
      setStep1({ status: 'completed' })
      // 自动开始第二步
      handleVerifyAndLogin()
    }
  }, [visible, isConnected, address, step1.status, handleVerifyAndLogin])

  // 计算 step2 的错误信息
  const step2Error = step2.error || walletAuthError || backendError

  // 获取按钮文字和处理函数
  const getButtonConfig = () => {
    const isStep2Loading = step2.status === 'loading' || isWalletAuthLoading || isBackendLoading

    if (currentStep === 1) {
      return {
        text: '连接',
        onPress: handleConnectWallet,
        disabled: step1.status === 'loading',
        loading: step1.status === 'loading',
      }
    }
    return {
      text: '验证',
      onPress: handleVerifyAndLogin,
      disabled: isStep2Loading,
      loading: isStep2Loading,
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
        <DrawerDescription className='px-5'>
          按照两个简单步骤连接您的钱包到 Mullet。
        </DrawerDescription>

        {/* 步骤列表 */}
        <View className="mb-8 px-5">
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
            </View>
            <View className="ml-4 flex-1 pt-0.5">
              <Text className="text-white text-paragraph-p1 font-semibold mb-1">
                验证授权
              </Text>
              <Text className="text-content-4 text-paragraph-p2 leading-5">
                请确认您是此钱包的所有者。
              </Text>
              {step2.status === 'error' && step2Error && (
                <Text className="text-red-500 text-paragraph-p3 mt-1">{step2Error}</Text>
              )}
            </View>
          </View>
        </View>

        {/* 操作按钮 */}
        <DrawerFooter>
          <Pressable
            onPress={buttonConfig.onPress}
            disabled={buttonConfig.disabled}
            className={`py-2 h-10 rounded-full w-full items-center justify-center ${buttonConfig.disabled ? 'bg-zinc-700' : 'bg-white active:opacity-80'
              }`}
          >
            {buttonConfig.loading ? (
              <ActivityIndicator size="small" className='text-paragraph-p1' color="#fff" />
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
