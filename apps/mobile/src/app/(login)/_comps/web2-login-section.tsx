import { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useLogin } from '@privy-io/expo/ui'
import { usePrivy } from '@privy-io/expo'

import { cn } from '@/lib/utils'
import { IconMail } from '@/components/ui/icons/set'
import { useBackendLogin } from '../_hooks/use-backend-login'

export function Web2LoginSection() {
  const { login: privyLogin } = useLogin()
  const { user: privyUser, isReady: privyReady } = usePrivy()

  // 是否正在进行 Web2 登录流程
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  // 用于追踪是否是当前组件触发的登录
  const loginTriggeredRef = useRef(false)

  // 后端登录 hook
  const {
    loginToBackend,
    isLoading: isBackendLoading,
    error: backendError,
  } = useBackendLogin({
    redirectOnSuccess: true,
  })

  // 监听 Privy 登录成功后，自动登录后端
  useEffect(() => {
    const handlePrivyLoginSuccess = async () => {
      if (
        privyReady &&
        privyUser &&
        loginTriggeredRef.current &&
        !isBackendLoading
      ) {
        console.log('Web2 login: Privy authenticated, logging into backend...')
        try {
          await loginToBackend()
        } catch (error) {
          console.error('Backend login failed:', error)
        } finally {
          setIsLoggingIn(false)
          loginTriggeredRef.current = false
        }
      }
    }

    handlePrivyLoginSuccess()
  }, [privyReady, privyUser, isBackendLoading, loginToBackend])

  // Web2 登录（Email 等）
  const handleWeb2Login = async () => {
    setIsLoggingIn(true)
    loginTriggeredRef.current = true

    try {
      await privyLogin({ loginMethods: ['email'] })
    } catch (error) {
      console.error('Privy login failed:', error)
      setIsLoggingIn(false)
      loginTriggeredRef.current = false
    }
  }

  const isLoading = isLoggingIn || isBackendLoading

  return (
    <View className={cn('w-full')}>
      <Pressable
        onPress={handleWeb2Login}
        disabled={isLoading}
        className={cn(
          'flex-row', 'items-center',
          'gap-medium', 'px-xl', 'py-medium',
          'w-full',
          'border', 'border-brand-default', 'rounded-small',
          'active:opacity-80'
        )}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <IconMail width={24} height={24} color="#FFFFFF" />
            <Text className={cn('text-white', 'text-paragraph-p2')}>
              电子邮箱登录/注册
            </Text>
          </>
        )}
      </Pressable>
      {backendError && (
        <Text className={cn('text-center', 'mt-medium', 'text-red-500', 'text-paragraph-p3')}>
          {backendError}
        </Text>
      )}
    </View>
  )
}
