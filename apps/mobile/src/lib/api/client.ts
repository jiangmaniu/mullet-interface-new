import * as SecureStore from 'expo-secure-store'

import { EXPO_ENV_CONFIG } from '@/constants/expo'

const BASE_URL = EXPO_ENV_CONFIG.API_BASE_URL

// Token 存储 keys
export const TOKEN_KEY = 'auth_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

// Token 操作
export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY)
    } catch {
      return null
    }
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
  },

  async removeRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  },

  async clearAll(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeRefreshToken()])
  },
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 请求配置
interface RequestConfig extends RequestInit {
  skipAuth?: boolean
}

// API 错误
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Token 过期回调（用于触发重新登录）
let onTokenExpiredCallback: (() => Promise<boolean>) | null = null

export function setOnTokenExpired(callback: () => Promise<boolean>) {
  onTokenExpiredCallback = callback
}

// HTTP 客户端
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { skipAuth = false, ...fetchConfig } = config

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchConfig.headers,
  }

  // 添加认证 token
  if (!skipAuth) {
    const token = await tokenStorage.getToken()
    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  const url = `${BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...fetchConfig,
    headers,
  })

  const result: ApiResponse<T> = await response.json()

  // 处理 token 过期（假设后端返回 401 或特定 code）
  if (response.status === 401 || result.code === 401) {
    // 尝试使用回调重新登录
    if (onTokenExpiredCallback) {
      const refreshed = await onTokenExpiredCallback()
      if (refreshed) {
        // 重试请求
        return request<T>(endpoint, config)
      }
    }
    throw new ApiError(401, 'Token expired')
  }

  // 处理其他错误
  if (!response.ok || (result.code !== 0 && result.code !== 200)) {
    throw new ApiError(result.code, result.message, result.data)
  }

  return result.data
}

// HTTP 方法封装
export const apiClient = {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'GET' })
  },

  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return request<T>(endpoint, { ...config, method: 'DELETE' })
  },
}
