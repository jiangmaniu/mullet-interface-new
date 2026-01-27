import { apiClient, tokenStorage } from './client'

// 登录响应类型
export interface LoginResponse {
  token: string
  refreshToken?: string
  user?: {
    id: string
    address?: string
    [key: string]: unknown
  }
}

// 用户信息类型
export interface UserInfo {
  id: string
  address?: string
  [key: string]: unknown
}

/**
 * 使用 Privy token 登录后端
 * @param privyToken Privy access token
 * @returns 登录响应
 */
export async function loginWithPrivyToken(privyToken: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    '/api/auth/login',
    { privyToken },
    { skipAuth: true }
  )

  // 保存 token
  if (response.token) {
    await tokenStorage.setToken(response.token)
  }
  if (response.refreshToken) {
    await tokenStorage.setRefreshToken(response.refreshToken)
  }

  return response
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  try {
    // 调用后端登出接口（可选）
    await apiClient.post('/api/auth/logout')
  } catch {
    // 忽略错误
  } finally {
    // 清除本地 token
    await tokenStorage.clearAll()
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<UserInfo> {
  return apiClient.get<UserInfo>('/api/auth/me')
}

/**
 * 检查后端 token 是否有效
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const token = await tokenStorage.getToken()
    if (!token) {
      return false
    }

    // 尝试获取用户信息来验证 token
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}
