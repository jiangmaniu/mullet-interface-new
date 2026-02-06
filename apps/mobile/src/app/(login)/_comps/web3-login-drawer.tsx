import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'

import { cn } from '@/lib/utils'
import { useAppKit, useAccount, useAppKitState, useProvider } from '@/lib/appkit'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useWalletAuth, WalletAuthError } from '../_hooks/use-wallet-auth'
import { useBackendLogin } from '../_hooks/use-backend-login'
import { IconSpecialFail, IconSpecialSuccess } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Spinning } from '@/components/ui/spinning'
import { Trans } from '@lingui/react/macro'
import { useAppKitEventSubscription } from '@reown/appkit-react-native'

// 登录流程状态
type LoginFlowState =
  | 'idle'           // 初始状态
  | 'connecting'     // 连接钱包中
  | 'signing'        // 签名中
  | 'login_backend'  // 后端登录中
  | 'signature_failed'  // 签名失败
  | 'login_failed'      // 后端登录失败

// 步骤状态
type StepStatus = 'pending' | 'loading' | 'completed' | 'error'

interface StepState {
  status: StepStatus
  error?: string | null
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

  // 登录流程状态
  const [flowState, setFlowState] = useState<LoginFlowState>('idle')

  // 两个步骤的状态
  const [step1, setStep1] = useState<StepState>({ status: 'pending' })
  const [step2, setStep2] = useState<StepState>({ status: 'pending' })

  // 存储签名结果，用于重试后端登录
  const savedSignatureRef = useRef<string | null>(null)

  // 错误信息
  const [errorMessage, setErrorMessage] = useState<string>('')

  // 当前活动步骤 (1, 2)
  const currentStep = step1.status !== 'completed' ? 1 : 2

  // 重置所有状态
  const resetSteps = useCallback(() => {
    setStep1({ status: 'pending' })
    setStep2({ status: 'pending' })
    setFlowState('idle')
    setErrorMessage('')
    savedSignatureRef.current = null
    isSigningRef.current = false
  }, [])

  // 关闭抽屉并重置状态
  const handleClose = useCallback(() => {
    resetSteps()
    onCloseProp()
  }, [resetSteps, onCloseProp])

  // 后端登录 hook
  const {
    loginToBackend,
    error: backendError,
  } = useBackendLogin({
    onSuccess: handleClose,
    redirectOnSuccess: true,
  })

  // 钱包授权 hook
  const {
    signAndLoginPrivy,
    error: walletAuthError,
    isPrivyLoggedIn,
  } = useWalletAuth()

  // 监听 AppKit 对话框关闭事件
  useEffect(() => {
    // 当 AppKit 对话框从打开变为关闭，且钱包未连接时，重置步骤和按钮连接状态
    if (prevAppKitOpen.current && !isAppKitOpen && step1.status === 'loading') {
      setStep1({ status: 'pending' })
      setFlowState('idle')
    }
    prevAppKitOpen.current = isAppKitOpen
  }, [isAppKitOpen, step1.status])

  // Drawer 状态变化处理
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose()
      }
    },
    [handleClose]
  )

  // 防止重复触发签名流程
  const isSigningRef = useRef(false)

  // 第二步：签名
  const handleSign = useCallback(async () => {
    if (isSigningRef.current) return
    isSigningRef.current = true
    setErrorMessage('')

    try {
      // 如果已登录 Privy，跳过签名步骤
      if (isPrivyLoggedIn) {
        setStep2({ status: 'completed' })
        // 直接进行后端登录
        setFlowState('login_backend')
        const backendSuccess = await loginToBackend()
        if (!backendSuccess) {
          setFlowState('login_failed')
          setErrorMessage(backendError || '登录失败，请重试')
        }
        return
      }

    } catch (error: any) {
      console.error('Sign and login failed:', error)
      const isSignatureError = error.message?.includes('签名') || error.message?.includes('signature')
      if (isSignatureError) {
        setFlowState('signature_failed')
        setStep2({ status: 'error', error: error.message || '签名失败' })
      } else {
        setFlowState('login_failed')
        setErrorMessage(error.message || '登录失败，请重试')
      }
    } finally {
      isSigningRef.current = false
    }

    try {
      setFlowState('signing')
      setStep2({ status: 'loading' })
      // 签名并登录 Privy
      const authResult = await signAndLoginPrivy()
      if (!authResult) {
        setFlowState('signature_failed')
        setStep2({ status: 'error', error: walletAuthError })
        return
      } else {
        setStep2({ status: 'completed' })
      }

      // 保存签名结果
      if (typeof authResult === 'string') {
        savedSignatureRef.current = authResult
      }
    }
    catch (error: any) {
      if (error instanceof WalletAuthError) {
        if (error.type === 'WalletNotConnected') {
          resetSteps()
          setStep1({ status: 'error', error: error.message })
          return
        }
      }

      setFlowState('signature_failed')
      setStep2({ status: 'error', error: error.message })
      return
    }
    finally {
      isSigningRef.current = false
    }


    try {
      // 签名成功，进行后端登录
      setFlowState('login_backend')
      const backendSuccess = await loginToBackend()

      if (!backendSuccess) {
        setFlowState('login_failed')
        setErrorMessage(backendError || '登录失败，请重试')
      }
    } catch (error: any) {
      console.error('Sign and login failed:', error)
      const isSignatureError = error.message?.includes('签名') || error.message?.includes('signature')
      if (isSignatureError) {
        setFlowState('signature_failed')
        setStep2({ status: 'error', error: error.message || '签名失败' })
      } else {
        setFlowState('login_failed')
        setErrorMessage(error.message || '登录失败，请重试')
      }
    } finally {
      isSigningRef.current = false
    }
  }, [isPrivyLoggedIn, signAndLoginPrivy, loginToBackend, backendError, walletAuthError, resetSteps])



  // 第一步：连接钱包
  const handleConnectWallet = useCallback(
    async () => {
      // if (isConnected && address) {
      //   setStep1({ status: 'completed' })
      //   // 继续第二步
      //   handleSign()
      //   return
      // }

      setFlowState('connecting')
      setStep1({ status: 'loading' })
      try {
        open({ view: 'Connect' })
        // 连接结果会通过 useEffect 监听
      } catch (error) {
        console.error('Failed to open wallet modal:', error)
        setStep1({ status: 'error', error: '打开钱包失败' })
        setFlowState('idle')
      }
    }
    , [open])

  // 用 ref 保存最新的 handleSign，避免 useEffect 因函数重建而无限循环
  const handleSignRef = useRef(handleSign)
  handleSignRef.current = handleSign

  // 当抽屉打开时，自动开始第一步
  useEffect(() => {
    if (visible) {
      // 如果已连接，直接标记第一步完成
      if (isConnected && address) {
        setStep1({ status: 'completed' })
        // 如果是自动授权模式，直接开始验证
        if (autoStartAuth) {
          console.log('Auto start auth: wallet connected, starting verification...')
          handleSignRef.current()
        }
      }
    }
  }, [visible, isConnected, address, autoStartAuth])

  useAppKitEventSubscription('CONNECT_SUCCESS', useCallback(event => {
    if (event.data.event === 'CONNECT_SUCCESS') {
      if (!!event.data.address) {
        setStep1({ status: 'completed' })
        handleSignRef.current()
      }
    }
  }, []));

  useEffect(() => {
    if (!visible) {
      resetSteps()
    }
  }, [visible, resetSteps])

  // 获取按钮配置
  const getButtonConfig = () => {
    // 初始状态
    if (flowState === 'idle') {
      if (step1.status === 'completed') {
        return {
          text: <Trans>签名</Trans>,
          onPress: handleSign,
          loading: false,
        }
      }
      return {
        text: <Trans>连接</Trans>,
        onPress: handleConnectWallet,
        loading: false,
      }
    }

    // 连接中
    if (flowState === 'connecting') {
      return {
        text: <Trans>连接中</Trans>,
        onPress: handleConnectWallet,
        loading: true,
      }
    }

    // 签名中
    if (flowState === 'signing') {
      return {
        text: <Trans>签名中</Trans>,
        onPress: handleSign,
        loading: true,
      }
    }

    // 后端登录中
    if (flowState === 'login_backend') {
      return {
        text: <Trans>登录中</Trans>,
        onPress: handleSign,
        loading: true,
      }
    }

    // 签名失败
    if (flowState === 'signature_failed') {
      return {
        text: <Trans>重试</Trans>,
        onPress: handleSign,
        loading: false,
      }
    }

    // 后端登录失败
    if (flowState === 'login_failed') {
      return {
        text: errorMessage || <Trans>登录失败，重试</Trans>,
        onPress: handleSign,
        loading: false,
      }
    }

    return {
      text: <Trans>连接</Trans>,
      onPress: handleConnectWallet,
      loading: false,
    }
  }

  const buttonConfig = getButtonConfig()

  // 渲染步骤图标
  const renderStepIcon = (step: number, state: StepState) => {
    const isActive = currentStep === step
    const isCompleted = state.status === 'completed'
    const isLoading = state.status === 'loading'
    const isError = state.status === 'error'

    if (isLoading) {
      return (
        <Spinning />
      )
    }

    if (isCompleted) {
      return (
        <View className={cn(

        )}>
          <IconSpecialSuccess height={20} width={20} />
        </View>
      )
    }

    if (isError) {
      return (
        <View className={cn(
        )}>
          <IconSpecialFail height={20} width={20} />
        </View>
      )
    }

    return (
      <View className={cn(
        'items-center', 'justify-center',
        'size-5',
        isActive ? "bg-brand-primary" : "bg-button-box",
        'rounded-full',
      )}>
        <Text className={cn(
          'text-paragraph-p2',
          isActive ? "" : "text-content-4"


        )}>
          {step}
        </Text>
      </View>
    )
  }

  return (
    <Drawer open={visible} onOpenChange={handleOpenChange}>
      <DrawerContent className='p-5 gap-4xl pb-8'>
        <View className='gap-4' >
          {/* 标题栏 */}
          <DrawerHeader>
            <DrawerTitle className='text-paragraph-p1 w-full text-center'>
              <Trans>登录</Trans>
            </DrawerTitle>
          </DrawerHeader>

          {/* 副标题 */}
          <DrawerDescription className="text-paragraph-p3 text-content-4">
            <Trans>按照两个简单步骤连接您的钱包到 Mullet。</Trans>
          </DrawerDescription>

          {/* 步骤列表 */}
          <View className={cn('p-4 bg-card rounded-[16px] gap-4', '')}>
            {/* 第一步：连接 */}
            <View className={cn('flex-row gap-2', 'items-start')}>
              <View className="h-full">
                {renderStepIcon(1, step1)}

              </View>
              <View className={cn('flex-1 gap-1', '', '')}>
                <Text className={cn('text-white', 'text-paragraph-p1', '', '')}>
                  <Trans>连接钱包</Trans>
                </Text>
                <Text className={cn('text-content-4', 'text-paragraph-p3', '')}>
                  <Trans>仅作确认您是此钱包的所有权</Trans>
                </Text>
                {step1.status === 'error' && (
                  <Text className={cn('text-red-500', 'text-paragraph-p4', 'mt-1')}>
                    {step1.error}
                  </Text>
                )}
              </View>
            </View>

            {/* 第二步：签名请求 */}
            <View className={cn('flex-row gap-2', 'items-start')}>
              <View className="h-full">
                {renderStepIcon(2, step2)}
              </View>
              <View className={cn('flex-1 gap-1', '', '')}>
                <Text className={cn('text-white', 'text-paragraph-p2', '', '')}>
                  <Trans>签名请求</Trans>
                </Text>
                <Text className={cn('text-content-4', 'text-paragraph-p3', '')}>
                  <Trans>您将收到 1 个安全登录签名请求。签名是免费的，不会触发任何交易。</Trans>
                </Text>
                {step2.status === 'error' && (
                  <Text className={cn('text-red-500', 'text-paragraph-p4', 'mt-1')}>
                    {step2.error}
                  </Text>
                )}
              </View>
            </View>
          </View>

        </View>

        {/* 操作按钮 */}
        <DrawerFooter>
          <View className='flex-1 gap-1'>

            <Button
              variant={'solid'}
              color={'primary'}
              size={'lg'}
              onPress={buttonConfig.onPress}
              loading={buttonConfig.loading}
              className={cn(
                'flex-row', 'items-center', 'justify-center',
                'w-full',
                errorMessage ? "bg-market-fall" : ''
              )}
            >

              <Text className={cn(
                'text-paragraph-p1', 'font-semibold',
                errorMessage ? "text-white" : ''
              )}>
                {buttonConfig.text}
              </Text>

            </Button>
          </View>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
