import { View, Text, BackHandler } from 'react-native'

import { cn } from '@/lib/utils'
import { ScreenHeader } from '@/components/ui/screen-header'
import { IconLogo, IconPrivy } from '@/components/ui/icons/set'
import { Web2LoginSection } from './_comps/web2-login-section'
import { Web3LoginSection } from './_comps/web3-login-section'
import { useLoginAuthStore } from '@/stores/login-auth'
import { useEffect } from 'react'

const Login = () => {
  const { accessToken, loginInfo } = useLoginAuthStore()
  console.log('accessToken', accessToken, loginInfo)

  // 🚫 禁止 Android 物理返回
  useEffect(() => {
    const onBackPress = () => {
      return true // 阻止默认返回
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    )

    return () => subscription.remove()
  }, [])

  return (
    <View className={cn('flex-1', 'gap-4xl', 'bg-secondary')}>
      {/* Header */}
      <ScreenHeader
        // showBackButton={false}
        center content="登录或注册" />

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
        <Web3LoginSection />

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
