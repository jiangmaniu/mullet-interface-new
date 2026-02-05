import { useEffect, useRef } from 'react'
import { View, Text } from 'react-native'
import { usePrivy } from '@privy-io/expo'
import { router, useLocalSearchParams } from 'expo-router'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { ScreenHeader } from '@/components/ui/screen-header'
import { IconLogo, IconPrivy } from '@/components/ui/icons/set'
import { Web2LoginSection } from './_comps/web2-login-section'
import { Web3LoginSection } from './_comps/web3-login-section'

/**
 * 登录成功后导航
 * 如果有上一页则返回，否则跳转首页
 */
const navigateAfterLogin = () => {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace('/' as '/')
  }
}

const Login = () => {
  const { isReady: privyReady, user: privyUser, getAccessToken } = usePrivy()

  // 获取 URL 参数（用于 401 重定向时的自动授权）
  const { autoAuth } = useLocalSearchParams<{ autoAuth?: string }>()

  // 后端认证状态
  const {
    isAuthenticated: isBackendAuthenticated,
    isLoading: isBackendLoading,
    loginWithPrivy: loginBackend,
  } = useAuthStore()

  // 用于防止后端登录重复触发（自动登录场景）
  const backendLoginAttemptedRef = useRef(false)

  // 如果已登录后端，直接返回或跳转首页
  useEffect(() => {
    if (isBackendAuthenticated) {
      navigateAfterLogin()
    }
  }, [isBackendAuthenticated])

  // 自动登录：当钱包已连接、Privy 已登录但后端未认证时，自动登录后端
  useEffect(() => {
    const autoLogin = async () => {
      if (
        privyReady &&
        privyUser &&
        !isBackendAuthenticated &&
        !isBackendLoading &&
        !backendLoginAttemptedRef.current
      ) {
        backendLoginAttemptedRef.current = true
        console.log('Auto backend login: Privy authenticated, logging into backend...')

        try {
          const privyToken = await getAccessToken()
          if (!privyToken) {
            throw new Error('Failed to get Privy token')
          }
          await loginBackend(privyToken)
          console.log('Backend login successful')
          navigateAfterLogin()
        } catch (error) {
          console.log('Backend login failed:', error)
          backendLoginAttemptedRef.current = false
        }
      }
    }

    autoLogin()

    if (!privyUser) {
      backendLoginAttemptedRef.current = false
    }
  }, [privyReady, privyUser, isBackendAuthenticated, isBackendLoading, loginBackend, getAccessToken])

  return (
    <View className={cn('flex-1', 'gap-4xl', 'bg-secondary')}>
      {/* Header */}
      <ScreenHeader center content="登录或注册" />

      {/* Logo */}
      <View className={cn('items-center', 'justify-center', 'py-3')}>
        <IconLogo width={192} height={51} />
      </View>

      {/* 登录区域 */}
      <View className={cn('flex-1', 'px-3xl', 'gap-xl')}>
        {/* Web2 登录 */}
        <Web2LoginSection />

        {/* 分割线 */}
        <View className={cn('flex-row', 'items-center', 'w-full')}>
          <View className={cn('flex-1', 'h-px', 'bg-brand-divider-line')} />
          <View className={cn('px-small', 'bg-secondary')}>
            <Text className={cn('text-content-5', 'text-paragraph-p3')}>或者</Text>
          </View>
          <View className={cn('flex-1', 'h-px', 'bg-brand-divider-line')} />
        </View>

        {/* Web3 登录 */}
        <Web3LoginSection autoAuth={autoAuth === 'true'} />

        {/* 免责声明 */}
        <Text className={cn('text-left', 'text-content-5', 'text-paragraph-p3')}>
          继续操作即表示您同意条款和条件，并承认您已阅读并理解协议免责声明。
        </Text>

        {/* Protected by Privy */}
        <View className={cn('flex-row', 'items-center', 'justify-center', 'gap-2xl', 'pt-xl')}>
          <Text className={cn('text-content-4', 'text-paragraph-p2')}>Protected by</Text>
          <IconPrivy />
        </View>
      </View>
    </View>
  )
}

export default Login
