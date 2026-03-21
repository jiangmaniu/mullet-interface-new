import { Base64 } from 'js-base64'

import { toast } from '@/components/ui/toast'
import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import { handle401Error, setCancelAllRequestsCallback } from '@/lib/auth-handler'
import { useRootStore } from '@/stores'
import { getEnv } from '@/v1/env'
import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { getAccessToken } from '@privy-io/expo'

import { STORAGE_GET_TRADER_SERVER } from './storage'

// 全局请求管理器
const pendingRequests = new Map<string, AbortController>()

/**
 * 取消所有正在进行的请求
 */
function cancelAllPendingRequests() {
  console.log(`Cancelling ${pendingRequests.size} pending requests...`)
  pendingRequests.forEach((controller, requestId) => {
    controller.abort()
    // console.log(`Cancelled request: ${requestId}`)
  })
  pendingRequests.clear()
}

// 注入取消请求的回调到 auth-handler
setCancelAllRequestsCallback(cancelAllPendingRequests)

interface IRequestConfig extends RequestInit {
  /** 接口是否需要客户端鉴权 */
  authorization?: boolean
  /** 是否跳过错误提示 */
  skipErrorHandler?: boolean
  /** 是否跳过所有错误 包括401等 */
  skipAllErrorHandler?: boolean
  /** 请求之前是否展示loading */
  showLoading?: boolean
  /** 该请求是否需要token */
  needToken?: boolean
  /** 接口需要防重放，针对POST请求 */
  replayProtection?: boolean
  /** 接口需要加密请求参数，针对POST请求 */
  cryptoData?: boolean
  text?: boolean
  /** 基础URL */
  baseURL?: string
  /** 请求超时时间(ms) */
  timeout?: number
  /** URL参数 */
  params?: Record<string, any>
  /** 请求体数据 */
  data?: any
  /** 响应类型 */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'
}

// 默认配置
const DEFAULT_TIMEOUT = 30000
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// 构建请求头
async function buildHeaders(config?: IRequestConfig): Promise<Record<string, string>> {
  const userInfo = useRootStore.getState().user.auth.loginInfo
  const token = useRootStore.getState().user.auth.accessToken
  const ENV = await getEnv()

  let privyAccessToken: string | null = null
  try {
    privyAccessToken = await getAccessToken()
  } catch (e) {
    console.log('getAccessToken error:', e)
  }

  // 简化 headers，只保留必要的
  const headers: Record<string, string> = {}

  // Content-Type
  headers['Content-Type'] = 'application/json'

  headers['Blade-Requested-With'] = 'BladeHttpRequest'

  // Language
  if (i18n.locale) {
    headers['Language'] = i18n.locale
  }

  // Tenant-Id
  headers['Tenant-Id'] = DEFAULT_TENANT_ID

  // 合并传入的 headers，过滤掉 undefined/null 值
  if (config?.headers) {
    const configHeaders = config.headers as Record<string, string>
    Object.keys(configHeaders).forEach((key) => {
      const value = configHeaders[key]
      if (value !== undefined && value !== null && value !== '') {
        headers[key] = String(value)
      }
    })
  }

  if (privyAccessToken && typeof privyAccessToken === 'string') {
    headers['privy-token'] = privyAccessToken
  }

  if (config?.authorization !== false && ENV.CLIENT_ID && ENV.CLIENT_SECRET) {
    try {
      const encoded = Base64.encode(`${ENV.CLIENT_ID}:${ENV.CLIENT_SECRET}`)
      headers['Authorization'] = `Basic ${encoded}`
    } catch (e) {
      console.log('Base64 encode error:', e)
    }
  }

  if (token && typeof token === 'string') {
    const tokenType = userInfo?.token_type || 'Bearer'
    headers['Blade-Auth'] = `${tokenType} ${token}`
  }

  console.log('Request Headers keys:', Object.keys(headers).join(', '))
  return headers
}

// 构建URL参数
function buildUrlWithParams(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl

  // 处理分页参数
  if (params.pageSize) {
    params.size = params.pageSize
    delete params.pageSize
  }

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  if (!queryString) return baseUrl

  return baseUrl.includes('?') ? `${baseUrl}&${queryString}` : `${baseUrl}?${queryString}`
}

// 处理响应
async function handleResponse<T>(
  response: Response,
  config?: IRequestConfig,
): Promise<{ data: T; status: number; ok: boolean }> {
  const responseType = config?.responseType || 'json'

  let data: any
  if (responseType === 'blob') {
    data = await response.blob()
  } else if (responseType === 'arraybuffer') {
    data = await response.arrayBuffer()
  } else if (responseType === 'text') {
    data = await response.text()
  } else {
    // 尝试解析JSON，如果失败则返回文本
    const text = await response.text()
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  console.log('response', { data, status: response.status, ok: response.ok })

  return { data, status: response.status, ok: response.ok }
}

// 处理错误响应
async function handleErrorResponse(status: number, data: any, skipErrorHandler?: boolean): Promise<Error> {
  const errorMessage = data?.msg || data?.message || data?.error_description || data?.error
  let statusText: string | undefined

  switch (status) {
    case 400:
      statusText = data?.msg ?? 'Bad Request'
      break
    case 401:
      // 注意：这个 case 实际上不会被执行到
      // 因为 401 错误在主请求函数中已经被统一处理了
      // 保留这个 case 只是为了代码完整性
      // console.log('====error.response===', { status, data })
      statusText = data?.msg ?? 'Unauthorized'
      break
    case 413:
      statusText = 'Payload Too Large'
      break
    case 500:
      statusText = 'Internal Server Error'
      break
    case 502:
      statusText = 'Bad Gateway'
      break
    case 504:
      statusText = 'Gateway Timeout'
      break
  }

  statusText = errorMessage || statusText

  // 401 错误不在这里显示 toast，由统一的 401 处理流程决定
  if (status !== 401) {
    statusText && !skipErrorHandler && toast.error(statusText)
  }

  return new Error(statusText || 'Unknown Error')
}

// 带超时的 fetch，支持全局请求管理
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
  requestId: string,
): Promise<Response> {
  const controller = new AbortController()

  // 注册到全局请求管理器
  pendingRequests.set(requestId, controller)

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  console.log('🔄 Fetching:', url, `[${requestId}]`)

  try {
    // 显式构建 fetch 配置，避免展开运算符问题
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    }

    const response = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)
    // console.log('✅ Fetch success:', url, response.status, `[${requestId}]`)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.log('❌ Fetch error:', url, error?.message, `[${requestId}]`)
    if (error?.name === 'AbortError') {
      throw new Error('Request Timeout or Cancelled')
    }
    throw error
  } finally {
    // 从全局请求管理器中移除
    pendingRequests.delete(requestId)
  }
}

/**
 * 统一的 401 错误处理函数
 * @returns true 如果应该重试请求，false 如果需要重新登录
 */
async function handle401<T>(
  url: string,
  config: IRequestConfig | undefined,
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
): Promise<void> {
  console.log('401 error detected, attempting auto re-auth...')
  const shouldRetry = await handle401Error()

  if (shouldRetry) {
    // 重新认证成功，重试请求
    // console.log('Re-auth successful, retrying request...')
    try {
      const retryResult = await request<T>(url, config)
      resolve(retryResult)
    } catch (retryError) {
      reject(retryError)
    }
  } else {
    // 需要重新登录，不重试请求
    reject(new Error('Authentication required'))
  }
}

export const request = <T = any>(url: string, config?: IRequestConfig): Promise<T> => {
  const skipErrorHandler = config?.skipErrorHandler ?? false

  // let toastKey = 0
  if (config?.showLoading) {
    // toastKey = message.loading(t`Loading`, 0)
  }

  return new Promise(async (resolve, reject) => {
    try {
      const ENVS = await getEnv()
      // console.log('ENVS:', ENVS)
      const serviceProvider = (await STORAGE_GET_TRADER_SERVER()) as User.ServiceProviderListItem
      const baseURL = config?.baseURL || serviceProvider?.serviceUrl || ENVS.baseURL
      const withoutProxy = ENVS.WITHOUT_PROXY || false

      let requestUrl = url
      if (withoutProxy) {
        requestUrl = requestUrl.replace('/api', '')
      }

      // 构建完整URL - 确保没有双斜杠
      const cleanBaseURL = baseURL?.replace(/\/$/, '') || ''
      const cleanRequestUrl = requestUrl?.startsWith('/') ? requestUrl : `/${requestUrl}`
      const fullUrl = buildUrlWithParams(`${cleanBaseURL}${cleanRequestUrl}`, config?.params)
      // console.log('Request URL:', fullUrl)

      // 构建请求头
      const headers = await buildHeaders(config)

      // 构建请求配置
      const method = (config?.method?.toUpperCase() || 'GET') as string
      const fetchConfig: RequestInit = {
        method,
        headers,
      }

      // 添加请求体（仅对非 GET 请求）
      if (config?.data && method !== 'GET') {
        fetchConfig.body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
      }

      // console.log('Fetch Config:', fullUrl, method)

      // 生成唯一的请求 ID
      const requestId = `${method}-${url}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

      // 执行请求
      const response = await fetchWithTimeout(fullUrl, fetchConfig, config?.timeout || DEFAULT_TIMEOUT, requestId)

      // 处理响应
      const { data, status, ok } = await handleResponse<any>(response, config)

      // 如果没有响应数据
      if (!data && !ok) {
        // console.log(`服务器无响应，接口地址:${baseURL}${requestUrl}`, config?.params || config?.data)
        resolve({ success: true } as T)
        return
      }

      // 处理非成功状态码
      if (!ok) {
        // 处理 401 错误 - 自动重新认证
        // 排除登录接口本身，避免登录失败时触发自动重新认证
        const isLoginEndpoint = ['api/blade-auth/oauth/token'].some((item) => requestUrl.includes(item))
        if (status === 401 && !config?.skipAllErrorHandler && !isLoginEndpoint) {
          await handle401<T>(url, config, resolve, reject)
          return
        }

        if (config?.skipAllErrorHandler) {
          reject(new Error('skipAllErrorHandler'))
          return
        }

        const error = await handleErrorResponse(status, data, skipErrorHandler)

        reject(error)
        return
      }

      // 二进制数据则直接返回
      if (config?.responseType === 'blob' || config?.responseType === 'arraybuffer') {
        resolve(data as T)
        return
      }

      const { msg, message, code } = data || {}

      if (
        !['api/blade-auth/oauth/token'].some((item) => {
          return requestUrl.includes(item)
        })
      ) {
        if (code !== 200 && code !== 401) {
          // console.log(`请求失败，接口地址:${baseURL}${requestUrl}`, data)

          // 客户端请求失败了统一提示，是否跳过错误提示
          const errorMessage = msg ?? message ?? '未知的错误'
          if (!skipErrorHandler) {
            toast.error(errorMessage)
            resolve({
              success: false,
              ...data,
            })
            return
          } else {
            reject(new Error(errorMessage))
          }
        }

        // 处理响应体中的 401 错误码
        if (code === 401 && !config?.skipAllErrorHandler) {
          await handle401<T>(url, config, resolve, reject)
          return
        }
      }

      resolve({
        success: true,
        ...data,
      })
    } catch (error: any) {
      console.log('Request Error:', error.message, error)

      if (config?.skipAllErrorHandler) {
        reject(error)
        return
      }

      // 请求被取消时不显示错误提示（通常是因为认证失败导致的批量取消）
      if (error.message === 'Request Timeout or Cancelled') {
        reject(error)
        return
      }

      if (error.message === 'Request Timeout') {
        !skipErrorHandler && toast.error('Request Timeout')
      } else if (error.message?.includes('Network request failed')) {
        !skipErrorHandler && toast.error(t`None response! Please retry`)
      } else {
        !skipErrorHandler && toast.error(error.message)
      }

      reject(error)
    } finally {
      // toastKey && Portal.remove(toastKey)
    }
  })
}
