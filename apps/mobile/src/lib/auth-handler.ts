/**
 * 401 认证错误处理器
 * 处理 API 返回 401 时的自动重新认证逻辑
 */
import { router } from 'expo-router'
import { getAccessToken as getPrivyAccessToken } from '@privy-io/expo'

import { tokenStorage } from '@/lib/api'
import { loginWithPrivyToken } from '@/lib/api/auth'
import { STORAGE_REMOVE_TOKEN, STORAGE_REMOVE_USER_INFO, setLocalUserInfo } from '@/v1/utils/storage'
import { stores } from '@/v1/provider/mobxProvider'

// 防止并发重复处理
let isHandling401 = false
let pendingRequests: {
  resolve: (retry: boolean) => void
  reject: (error: Error) => void
}[] = []

// 存储钱包连接状态检查函数（由 Provider 注入）
let checkWalletConnected: (() => boolean) | null = null
let getWalletAddress: (() => string | null) | null = null

/**
 * 设置钱包状态检查函数
 * 在 Provider 中调用此函数注入钱包状态
 */
export function setWalletStateCheckers(
  isConnected: () => boolean,
  getAddress: () => string | null
) {
  checkWalletConnected = isConnected
  getWalletAddress = getAddress
}

/**
 * 检查 Privy token 是否过期
 * 通过尝试获取 access token 来判断
 */
async function isPrivyTokenValid(): Promise<boolean> {
  try {
    const token = await getPrivyAccessToken()
    return !!token
  } catch (error) {
    console.log('Privy token check failed:', error)
    return false
  }
}

/**
 * 清理所有认证数据
 */
async function clearAllAuthData(): Promise<void> {
  try {
    await Promise.allSettled([
      tokenStorage.clearAll(),
      STORAGE_REMOVE_TOKEN(),
      STORAGE_REMOVE_USER_INFO(),
    ])
  } catch (error) {
    console.error('Clear auth data failed:', error)
  }
}

/**
 * 尝试使用 Privy token 自动登录
 */
async function tryAutoLogin(): Promise<boolean> {
  try {
    const privyToken = await getPrivyAccessToken()
    if (!privyToken) {
      console.log('No Privy token available for auto login')
      return false
    }

    console.log('Attempting auto login with Privy token...')
    const userInfo = await loginWithPrivyToken(privyToken)

    // 保存用户信息
    await setLocalUserInfo(userInfo)
    await stores.user.handleLoginSuccess(userInfo)

    console.log('Auto login successful')
    return true
  } catch (error) {
    console.error('Auto login failed:', error)
    return false
  }
}

/**
 * 导航到登录页面
 * @param withWalletConnected 是否携带钱包已连接的标识
 */
function navigateToLogin(withWalletConnected: boolean = false): void {
  if (withWalletConnected) {
    // 钱包已连接，跳转到登录页面并标记需要自动授权
    router.replace({
      pathname: '/(login)',
      params: { autoAuth: 'true' }
    })
  } else {
    // 完全未登录，跳转到登录页面
    router.replace('/(login)')
  }
}

/**
 * 处理 401 错误
 * @returns true 如果成功刷新认证，应该重试请求
 * @returns false 如果需要重新登录
 */
export async function handle401Error(): Promise<boolean> {
  // 如果已经在处理中，等待结果
  if (isHandling401) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject })
    })
  }

  isHandling401 = true

  try {
    // 1. 检查 Privy token 是否有效
    const privyValid = await isPrivyTokenValid()

    if (privyValid) {
      // Privy token 未过期，尝试自动登录后端
      const success = await tryAutoLogin()

      // 通知所有等待的请求
      pendingRequests.forEach(({ resolve }) => resolve(success))
      pendingRequests = []

      return success
    }

    // 2. Privy token 已过期，清理所有 token
    console.log('Privy token expired, clearing all auth data...')
    await clearAllAuthData()

    // 3. 检查钱包是否已连接
    const walletConnected = checkWalletConnected?.() ?? false
    const walletAddress = getWalletAddress?.()

    console.log('Wallet connected:', walletConnected, 'Address:', walletAddress)

    if (walletConnected && walletAddress) {
      // 钱包已连接，跳转到登录页面并标记需要自动授权
      console.log('Wallet connected, redirecting to login for re-authorization...')
      navigateToLogin(true)
    } else {
      // 钱包未连接，完全清理并跳转到登录页面
      console.log('Wallet not connected, redirecting to full login flow...')
      navigateToLogin(false)
    }

    // 通知所有等待的请求，需要重新登录
    pendingRequests.forEach(({ resolve }) => resolve(false))
    pendingRequests = []

    return false
  } catch (error) {
    console.error('Handle 401 error failed:', error)

    // 发生错误时，清理并跳转到登录页面
    await clearAllAuthData()
    navigateToLogin(false)

    // 通知所有等待的请求
    pendingRequests.forEach(({ reject }) => reject(error as Error))
    pendingRequests = []

    return false
  } finally {
    isHandling401 = false
  }
}

/**
 * 重置处理状态（用于测试或特殊情况）
 */
export function resetHandler(): void {
  isHandling401 = false
  pendingRequests = []
}
