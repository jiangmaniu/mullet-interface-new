import { Trans } from '@lingui/react/macro'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { IconMail } from '@/components/ui/icons/set'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { LoginType } from '@/stores/user-slice/authSlice'
import { usePrivy } from '@privy-io/expo'
import { useLogin } from '@privy-io/expo/ui'

import { useBackendLogin } from '../_hooks/use-backend-login'

export function Web2LoginSection() {
  const { login: privyLogin } = useLogin()
  const { user: privyUser, isReady: privyReady } = usePrivy()

  // 是否正在进行 Web2 登录流程
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  // 用于追踪是否是当前组件触发的登录
  const loginTriggeredRef = useRef(false)

  // 后端登录 hook
  const { loginToBackend, isLoading: isBackendLoading, error: backendError } = useBackendLogin({})

  // 重置登录状态
  const resetLoginState = useCallback(() => {
    setIsLoggingIn(false)
    loginTriggeredRef.current = false
  }, [])

  // 监听 Privy 登录成功后，自动登录后端
  useEffect(() => {
    const handlePrivyLoginSuccess = async () => {
      if (privyReady && privyUser && loginTriggeredRef.current && !isBackendLoading) {
        // console.log('Web2 login: Privy authenticated, logging into backend...')
        try {
          await loginToBackend(LoginType.Web2)
        } catch (error) {
          console.error('Backend login failed:', error)
        } finally {
          resetLoginState()
        }
      }
    }

    handlePrivyLoginSuccess()
  }, [privyReady, privyUser, isBackendLoading, loginToBackend, resetLoginState])

  // Web2 登录（Email 等）
  const handleWeb2Login = async () => {
    // 检查 Privy 是否已准备好
    if (!privyReady) {
      toast.error(<Trans>登录服务正在初始化，请检查网络</Trans>)
      return
    }

    setIsLoggingIn(true)
    loginTriggeredRef.current = true

    // 如果已登录 Privy（后端登录失败后重试的场景），直接登录后端
    if (privyUser) {
      try {
        await loginToBackend(LoginType.Web2)
      } catch (error) {
        console.error('Backend login failed:', error)
      } finally {
        resetLoginState()
      }
      return
    }

    try {
      await privyLogin({ loginMethods: ['email'] })
    } catch (error: any) {
      console.error('Privy login failed:', error)
      toast.error(error?.message || '登录失败，请重试')
      resetLoginState()
    }
  }

  const isLoading = isLoggingIn || isBackendLoading

  return (
    <View className={cn('w-full')}>
      <Pressable
        onPress={handleWeb2Login}
        disabled={isLoading}
        className={cn(
          'flex-row',
          'items-center',
          'gap-medium',
          'px-xl',
          'py-medium',
          'w-full',
          'border',
          'border-brand-default',
          'rounded-small',
          'active:opacity-80',
        )}
      >
        <View className={cn('flex-1 flex-row justify-center', 'items-center', 'gap-medium')}>
          <View className="gap-medium flex-1 flex-row items-center justify-start">
            <IconMail width={24} height={24} color="#FFFFFF" />
            <Text className={cn('text-white', 'text-paragraph-p2')}>电子邮箱登录/注册</Text>
          </View>
          {isLoading && <ActivityIndicator size="small" color="#fff" />}
        </View>
      </Pressable>

      {backendError && (
        <Text className={cn('text-center', 'mt-medium', 'text-red-500', 'text-paragraph-p3')}>{backendError}</Text>
      )}
    </View>
  )
}

export default Web2LoginSection
