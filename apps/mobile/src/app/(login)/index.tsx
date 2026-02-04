import { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useLogin } from '@privy-io/expo/ui'
import { usePrivy } from '@privy-io/expo'
import { router, useNavigation } from 'expo-router'

import { useAuthStore } from '@/stores/auth'
import { Web3LoginDrawer } from './_comps/web3-login-drawer'

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
  const { login: privyLogin } = useLogin()
  const { isReady: privyReady, user: privyUser, getAccessToken } = usePrivy()

  // 后端认证状态
  const {
    isAuthenticated: isBackendAuthenticated,
    isLoading: isBackendLoading,
    loginWithPrivy: loginBackend,
  } = useAuthStore()

  // Web3 登录抽屉状态
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)

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
        !backendLoginAttemptedRef.current &&
        !isDrawerVisible // 不在抽屉流程中
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
  }, [privyReady, privyUser, isBackendAuthenticated, isBackendLoading, loginBackend, isDrawerVisible, getAccessToken])

  // Web2 登录（Email/Google 等）
  const handleWeb2Login = () => {
    privyLogin({ loginMethods: ['email', 'sms', 'google'] })
  }

  // 打开 Web3 登录抽屉
  const handleOpenWeb3Login = () => {
    setIsDrawerVisible(true)
  }



  return (
    <View className="flex-1 items-center justify-center bg-background gap-6 px-6">

      {/* Web2 登录 */}
      <View className="w-full">
        <Text className="text-foreground text-center text-sm mb-3 opacity-60">社交账号登录</Text>
        <Pressable
          onPress={handleWeb2Login}
          className="bg-primary px-8 py-4 rounded-lg active:opacity-80 w-full"
        >
          <Text className="text-primary-foreground text-lg font-semibold text-center">
            Email / Google 登录
          </Text>
        </Pressable>
      </View>

      {/* 分割线 */}
      <View className="flex-row items-center w-full">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-muted-foreground px-4">或</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Web3 登录 */}
      <View className="w-full">
        <Text className="text-foreground text-center text-sm mb-3 opacity-60">钱包登录</Text>
        <Pressable
          onPress={handleOpenWeb3Login}
          className="bg-secondary px-8 py-4 rounded-lg active:opacity-80 w-full"
        >
          <Text className="text-secondary-foreground text-lg font-semibold text-center">
            连接钱包
          </Text>
        </Pressable>
      </View>

      {/* Web3 登录抽屉 */}
      <Web3LoginDrawer
        visible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </View>
  )
}

export default Login
