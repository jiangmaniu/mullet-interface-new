import { getCaptcha, login  } from '@/v1/services/user'
import { apiClient, tokenStorage } from './client'

// 登录响应类型
// export interface LoginResponse {
//   token: string
//   refreshToken?: string
//   user?: {
//     id: string
//     address?: string
//     [key: string]: unknown
//   }
//   data: User.LoginResult
// }
export type LoginResponse = User.LoginResult

// 用户信息类型
// export interface UserInfo {
//   id: string
//   address?: string
//   [key: string]: unknown
// }

export type UserInfo = User.LoginResult

/**
 * 使用 Privy token 登录后端
 * @param privyToken Privy access token
 * @returns 登录响应
 */
export async function loginWithPrivyToken(privyToken: string): Promise<LoginResponse> {
  const rs = await login({grant_type: 'privy_token'})
  
  // // 保存 token
  if (rs.access_token) {
    await tokenStorage.setToken(rs.access_token)
  }
  if (rs.refresh_token) {
    await tokenStorage.setRefreshToken(rs.refresh_token)
  }


  return rs
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
