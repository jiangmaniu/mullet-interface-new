/**
 * Cobo 充值地址预加载 Hook
 * 在用户登录后自动预加载所有链的充值地址和余额
 */

import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useCoboWallet } from './useCoboWallet'
import { preloadCoboDepositAddresses, preloadCoboBalances } from '@/services/coboPreloadService'
import { useStores } from '@/context/mobxProvider'

/**
 * 在用户登录后自动预加载所有 Cobo 充值地址和余额
 */
export const useCoboAddressPreload = () => {
  const { user, authenticated } = usePrivy()
  const { trade } = useStores()
  const hasPreloadedRef = useRef(false)

  // 获取 Cobo 钱包
  const { walletId: coboWalletId, isLoading: coboWalletLoading } = useCoboWallet({
    tradeAccountId: trade.currentAccountInfo?.id,
    enabled: authenticated && !!trade.currentAccountInfo?.id
  })

  useEffect(() => {
    // 只在以下条件都满足时才预加载：
    // 1. 用户已登录
    // 2. 有用户 ID
    // 3. Cobo 钱包已创建
    // 4. 尚未预加载过（防止重复）
    if (authenticated && user?.id && coboWalletId && !coboWalletLoading && !hasPreloadedRef.current) {
      hasPreloadedRef.current = true

      console.log('[Cobo Preload Hook] 触发自动预加载...')

      // 延迟 500ms 执行，避免阻塞登录流程
      const timer = setTimeout(() => {
        // 并发预加载充值地址和余额
        Promise.all([preloadCoboDepositAddresses(user.id, coboWalletId), preloadCoboBalances(user.id)])
          .then(([addressResults, balanceResults]) => {
            const successCount = addressResults.filter((r) => r.address !== null).length
            console.log(`[Cobo Preload Hook] ✅ 预加载完成:`)
            console.log(`  - 充值地址: ${successCount}/${addressResults.length} 条链`)
            console.log(`  - 余额: ${balanceResults.length} 条记录`)
          })
          .catch((error) => {
            console.error('[Cobo Preload Hook] ❌ 预加载失败:', error)
          })
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [authenticated, user?.id, coboWalletId, coboWalletLoading])

  // 重置预加载标志（当用户登出时）
  useEffect(() => {
    if (!authenticated) {
      hasPreloadedRef.current = false
    }
  }, [authenticated])
}
