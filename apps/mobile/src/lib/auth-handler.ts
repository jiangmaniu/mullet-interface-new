/**
 * 401 认证错误处理器
 * 处理 API 返回 401 时的自动重新认证逻辑
 */
import { useLoginAuthStore } from '@/stores/login-auth'
import { stores } from '@/v1/provider/mobxProvider'
import { login, refreshToken as refreshTokenAPI } from '@/v1/services/user'
import { getAccessToken as getPrivyAccessToken } from '@privy-io/expo'

// 防止并发重复处理
let isHandling401 = false
let pendingRequests: {
  resolve: (retry: boolean) => void
  reject: (error: Error) => void
}[] = []

// 存储钱包连接状态检查函数（由 Provider 注入）
let checkWalletConnected: (() => boolean) | null = null
let getWalletAddress: (() => string | null) | null = null

// 存储请求取消回调
let cancelAllRequestsCallback: (() => void) | null = null

/**
 * 设置钱包状态检查函数
 * 在 Provider 中调用此函数注入钱包状态
 */
export function setWalletStateCheckers(isConnected: () => boolean, getAddress: () => string | null) {
  checkWalletConnected = isConnected
  getWalletAddress = getAddress
}

/**
 * 设置取消所有请求的回调函数
 * 在 request.ts 中调用此函数注入取消逻辑
 */
export function setCancelAllRequestsCallback(callback: () => void) {
  cancelAllRequestsCallback = callback
}

/**
 * 尝试刷新 token
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const userInfo = useLoginAuthStore.getState().loginInfo
    if (!userInfo?.refresh_token) {
      console.log('No refresh token available')
      return false
    }

    console.log('Attempting to refresh token...')
    const newUserInfo = await refreshTokenAPI()

    if (newUserInfo?.access_token) {
      console.log('Token refresh successful')
      return true
    }

    console.log('Token refresh failed: no access token in response')
    return false
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
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
 * 清理所有认证数据并取消所有请求
 */
async function clearAllAuthData(): Promise<void> {
  try {
    // 取消所有正在进行的请求
    if (cancelAllRequestsCallback) {
      console.log('Cancelling all pending requests...')
      cancelAllRequestsCallback()
    }

    await Promise.allSettled([useLoginAuthStore.getState().logout()])
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
    const userInfo = await login(
      {
        grant_type: 'privy_token',
      },
      {
        skipAllErrorHandler: true, // 避免 401 错误触发无限循环
      },
    )

    // 保存用户信息
    useLoginAuthStore.setState({
      accessToken: userInfo.access_token,
      loginInfo: userInfo,
    })
    await stores.user.handleLoginSuccess(userInfo)

    console.log('Auto login successful')
    return true
  } catch (error) {
    console.error('Auto login failed:', error)
    return false
  }
}

/**
 * 处理 401 错误
 * 流程：refreshToken → tryAutoLogin with Privy token → clearAllAuthData
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
    // 1. 先尝试使用 refresh_token 刷新
    const refreshSuccess = await tryRefreshToken()
    if (refreshSuccess) {
      console.log('Token refreshed successfully')
      // 通知所有等待的请求
      pendingRequests.forEach(({ resolve }) => resolve(true))
      pendingRequests = []
      return true
    }

    // 2. refresh_token 失败，检查 Privy token 是否有效
    console.log('Refresh token failed, checking Privy token...')
    const privyValid = await isPrivyTokenValid()

    if (privyValid) {
      // Privy token 未过期，尝试自动登录后端
      const autoLoginSuccess = await tryAutoLogin()

      // 通知所有等待的请求
      pendingRequests.forEach(({ resolve }) => resolve(autoLoginSuccess))
      pendingRequests = []

      if (autoLoginSuccess) {
        return true
      }
    }

    // 3. 所有认证方式都失败，清理所有数据并取消请求
    console.log('All authentication methods failed, clearing auth data...')
    await clearAllAuthData()

    // 通知所有等待的请求，需要重新登录
    pendingRequests.forEach(({ resolve }) => resolve(false))
    pendingRequests = []

    return false
  } catch (error) {
    console.error('Handle 401 error failed:', error)

    // 发生错误时，清理并取消所有请求
    await clearAllAuthData()

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
