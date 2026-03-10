import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'

import { useWalletCallback, WalletActionType } from '@/hooks/use-wallet-callback'

/**
 * 钱包回调处理页面
 * 从外部钱包返回时的中转页面，根据之前保存的上下文决定跳转到哪里
 */
export default function WalletCallbackScreen() {
  const { getContext, clearContext } = useWalletCallback()

  useEffect(() => {
    // 获取之前保存的路由信息
    const { pendingRoute, action } = getContext()

    console.log('[WalletCallback] 收到回调:', { pendingRoute, action })

    // 清理存储的信息
    clearContext()

    // 根据不同的场景跳转
    if (action === WalletActionType.Connect) {
      // 连接钱包场景：跳转到登录页
      console.log('[WalletCallback] 连接钱包完成，跳转到登录页')
      router.replace('/login')
    } else if (action === WalletActionType.SignTransaction && pendingRoute) {
      // 转账签名场景：返回到之前的页面
      console.log('[WalletCallback] 交易签名完成，返回到:', pendingRoute)
      router.replace(pendingRoute as any)
    } else if (action === WalletActionType.SignMessage && pendingRoute) {
      // 消息签名场景：返回到之前的页面
      console.log('[WalletCallback] 消息签名完成，返回到:', pendingRoute)
      router.replace(pendingRoute as any)
    } else if (pendingRoute) {
      // 有保存的路由，返回到该路由
      console.log('[WalletCallback] 返回到保存的路由:', pendingRoute)
      router.replace(pendingRoute as any)
    } else {
      // 默认返回到首页
      console.log('[WalletCallback] 没有保存的路由，返回首页')
      router.replace('/')
    }
  }, [getContext, clearContext])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  )
}
