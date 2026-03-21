import { useCallback } from 'react'
import { usePathname } from 'expo-router'

import { useRouteCallbackStore, WalletActionType } from '@/stores/route-callback'

export { WalletActionType }

/**
 * 钱包路由回调管理 Hook
 * 用于保存和恢复钱包操作的上下文，支持从外部钱包返回时恢复到正确的页面
 */
export function useWalletRouteCallback() {
  const pathname = usePathname()
  const { saveWalletCallback, clearWalletCallback, getWalletCallback } = useRouteCallbackStore()

  /**
   * 保存当前路由上下文
   * 在调用钱包操作前调用，用于从钱包返回时恢复
   */
  const saveContext = useCallback(
    (action?: WalletActionType) => {
      // console.log('[WalletRouteCallback] 保存上下文:', { pathname, action })
      saveWalletCallback({
        pendingRoute: pathname,
        walletAction: action,
      })
    },
    [pathname, saveWalletCallback],
  )

  /**
   * 清除保存的上下文
   */
  const clearContext = useCallback(() => {
    // console.log('[WalletRouteCallback] 清除上下文')
    clearWalletCallback()
  }, [clearWalletCallback])

  /**
   * 获取保存的上下文
   */
  const getContext = useCallback(() => {
    const context = getWalletCallback()
    return {
      pendingRoute: context.pendingRoute,
      action: context.walletAction,
    }
  }, [getWalletCallback])

  return {
    saveContext,
    clearContext,
    getContext,
  }
}
