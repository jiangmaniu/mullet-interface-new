import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { mmkvStorage } from '@/lib/storage/mmkv'

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
 * 钱包回调上下文
 */
export interface WalletCallbackContext {
  /** 待恢复的路由路径 */
  pendingRoute?: string
  /** 钱包操作类型 */
  walletAction?: WalletActionType
}

interface RouteCallbackState {
  /** 钱包回调上下文 */
  walletCallback: WalletCallbackContext

  /** 保存钱包回调上下文 */
  saveWalletCallback: (context: WalletCallbackContext) => void
  /** 清除钱包回调上下文 */
  clearWalletCallback: () => void
  /** 获取钱包回调上下文 */
  getWalletCallback: () => WalletCallbackContext
}

export const useRouteCallbackStore = create<RouteCallbackState>()(
  persist(
    (set, get) => ({
      // 初始状态
      walletCallback: {},

      // 保存钱包回调上下文
      saveWalletCallback: (context) => {
        console.log('[RouteCallbackStore] 保存钱包回调上下文:', context)
        set({ walletCallback: context })
      },

      // 清除钱包回调上下文
      clearWalletCallback: () => {
        console.log('[RouteCallbackStore] 清除钱包回调上下文')
        set({ walletCallback: {} })
      },

      // 获取钱包回调上下文
      getWalletCallback: () => {
        return get().walletCallback
      },
    }),
    {
      name: 'route-callback-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
