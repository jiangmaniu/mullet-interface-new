import { usePathname } from 'expo-router'
import { useCallback } from 'react'

import { mmkv } from '@/lib/storage/mmkv'

/**
 * 钱包操作类型枚举
 */
export enum WalletActionType {
  /** 连接钱包 */
  Connect = 'connect',
  /** 签名交易 */
  SignTransaction = 'sign_transaction',
  /** 签名消息 */
  SignMessage = 'sign_message',
}

/**
 * 钱包回调管理 Hook
 * 用于保存和恢复钱包操作的上下文，支持从外部钱包返回时恢复到正确的页面
 */
export function useWalletCallback() {
  const pathname = usePathname()

  /**
   * 保存当前路由上下文
   * 在调用钱包操作前调用，用于从钱包返回时恢复
   */
  const saveContext = useCallback(
    (action: WalletActionType) => {
      console.log('[WalletCallback] 保存上下文:', { pathname, action })
      mmkv.set('wallet_pending_route', pathname)
      mmkv.set('wallet_action', action)
    },
    [pathname],
  )

  /**
   * 清除保存的上下文
   */
  const clearContext = useCallback(() => {
    console.log('[WalletCallback] 清除上下文')
    mmkv.remove('wallet_pending_route')
    mmkv.remove('wallet_action')
  }, [])

  /**
   * 获取保存的上下文
   */
  const getContext = useCallback(() => {
    const pendingRoute = mmkv.getString('wallet_pending_route')
    const action = mmkv.getString('wallet_action') as string | undefined

    return {
      pendingRoute,
      action: action as WalletActionType | undefined,
    }
  }, [])

  return {
    saveContext,
    clearContext,
    getContext,
  }
}
