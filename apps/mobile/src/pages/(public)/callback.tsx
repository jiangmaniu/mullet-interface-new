import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { router, usePathname } from 'expo-router'

import { useLoginAuthStore } from '@/stores/login-auth'
import { useAccount } from '@/lib/appkit'

/**
 * 钱包回调页面
 * 处理从钱包 App 返回后的路由跳转
 *
 * 工作流程：
 * 1. 钱包操作完成后跳转到此页面（mullet://callback）
 * 2. 从 store 读取 redirectTo（打开钱包前保存的路径）
 * 3. 根据状态决定跳转目标：
 *    - 如果有 redirectTo，跳转到该路径
 *    - 如果已登录，跳转到首页
 *    - 否则跳转到登录页
 */
export default function CallbackPage() {
  const redirectTo = useLoginAuthStore((s) => s.redirectTo)
  const accessToken = useLoginAuthStore((s) => s.accessToken)
  const { setRedirectTo } = useLoginAuthStore()
  const { isConnected } = useAccount()
  const pathname = usePathname()

  useEffect(() => {
    // 避免在 callback 页面本身触发跳转
    if (pathname === '/callback') {
      // 延迟一下，确保钱包连接状态已更新
      const timer = setTimeout(() => {
        // 优先使用 store 中保存的 redirectTo
        if (redirectTo) {
          // 清除 redirectTo，避免下次误用
          setRedirectTo(undefined)
          router.replace(redirectTo as any)
          return
        }

        // 如果已登录，跳转到首页
        if (accessToken) {
          router.replace('/(protected)/(tabs)')
          return
        }

        // 如果钱包已连接但没有 accessToken，说明正在登录流程中
        // 跳转到登录页继续完成登录
        if (isConnected && !accessToken) {
          router.replace('/login')
          return
        }

        // 默认跳转到登录页
        router.replace('/login')
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pathname, redirectTo, accessToken, isConnected, setRedirectTo])

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-content-3">正在跳转...</Text>
    </View>
  )
}
