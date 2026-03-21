import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { router } from 'expo-router'

import { useRouteCallbackStore, WalletActionType } from '@/stores/route-callback'

/**
 * 钱包回调处理页面
 * 从外部钱包返回时的中转页面，根据之前保存的上下文决定跳转到哪里
 */
export default function WalletCallbackScreen() {
  const walletCallback = useRouteCallbackStore((state) => state.walletCallback)
  const { clearWalletCallback } = useRouteCallbackStore()

  useEffect(() => {
    const { pendingRoute, walletAction } = walletCallback
    // console.log('[WalletCallback] 收到回调:', { pendingRoute, walletAction })

    // 根据不同的场景跳转
    if (walletAction === WalletActionType.Connect) {
      // 连接钱包场景：返回到之前的页面（通常是登录页）
      // console.log('[WalletCallback] 连接钱包完成')
    } else if (walletAction === WalletActionType.SignTransaction && pendingRoute) {
      // 转账签名场景：返回到之前的页面
      // console.log('[WalletCallback] 交易签名完成')
    } else if (walletAction === WalletActionType.SignMessage && pendingRoute) {
      // 消息签名场景：返回到之前的页面
      // console.log('[WalletCallback] 消息签名完成')
    }

    if (pendingRoute) {
      // 有保存的路由，返回到该路由
      // console.log(`[WalletCallback] 返回到保存的路由【${pendingRoute}】返回上一页`)
      router.back()
      return
    }

    // console.log('[WalletCallback] 没有保存的路由，返回首页')
    // 默认返回到首页
    router.replace('/')

    if (walletAction || pendingRoute) {
      // 清理存储的信息
      clearWalletCallback()
    }
  }, [walletCallback, clearWalletCallback])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  )
}
