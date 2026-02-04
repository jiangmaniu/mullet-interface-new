import { useCallback, useState } from 'react'
import { usePrivy } from '@privy-io/expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { router } from 'expo-router'

import { useAppKit } from '@/lib/appkit'
import { useAuthStore } from '@/stores/auth'
import { tokenStorage } from '@/lib/api'

interface UseClearCacheReturn {
  clearAllCache: () => Promise<void>
  isClearing: boolean
}

/**
 * 清理所有本地缓存和连接状态
 * 用于解决 Privy App ID 变更等需要完全重置的场景
 */
export function useClearCache(): UseClearCacheReturn {
  const [isClearing, setIsClearing] = useState(false)
  const { logout: privyLogout } = usePrivy()
  const { disconnect: disconnectWallet } = useAppKit()
  const { logout: authLogout } = useAuthStore()

  const clearAllCache = useCallback(async () => {
    if (isClearing) return

    setIsClearing(true)

    try {
      // 1. 登出 Privy（会清理 Privy 相关状态）
      try {
        await privyLogout()
      } catch (e) {
        console.warn('Privy logout failed:', e)
      }

      // 2. 断开钱包连接
      try {
        await disconnectWallet()
      } catch (e) {
        console.warn('Wallet disconnect failed:', e)
      }

      // 3. 清除后端认证状态
      try {
        await authLogout()
      } catch (e) {
        console.warn('Auth logout failed:', e)
      }

      // 4. 清除本地 token
      try {
        await tokenStorage.clearAll()
      } catch (e) {
        console.warn('Token storage clear failed:', e)
      }

      // 5. 清除所有 AsyncStorage（包括 Privy 缓存）
      try {
        const allKeys = await AsyncStorage.getAllKeys()
        if (allKeys.length > 0) {
          await AsyncStorage.multiRemove(allKeys)
          console.log('Cleared AsyncStorage keys:', allKeys.length)
        }
      } catch (e) {
        console.warn('AsyncStorage clear failed:', e)
      }

      // 6. 清除 SecureStore 中的敏感数据
      try {
        const secureStoreKeys = ['auth_token', 'refresh_token']
        await Promise.all(
          secureStoreKeys.map((key) =>
            SecureStore.deleteItemAsync(key).catch(() => {})
          )
        )
      } catch (e) {
        console.warn('SecureStore clear failed:', e)
      }

      console.log('✅ All cache cleared successfully')

      // 重定向到登录页面
      router.replace('/(login)')
    } catch (error) {
      console.error('Clear cache failed:', error)
      // 即使出错也尝试重定向
      router.replace('/(login)')
    } finally {
      setIsClearing(false)
    }
  }, [isClearing, privyLogout, disconnectWallet, authLogout])

  return {
    clearAllCache,
    isClearing,
  }
}
