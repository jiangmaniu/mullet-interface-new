import { Base64 } from 'js-base64'

import { message } from './message'
// import { onLogout } from './navigation'
import { STORAGE_GET_TOKEN, STORAGE_GET_TRADER_SERVER, STORAGE_GET_USER_INFO } from './storage'
import { getEnv } from '@/v1/env'
import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { getAccessToken } from '@privy-io/expo'

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
  'Content-Type': 'application/json'
}

// 构建请求头
async function buildHeaders(config?: IRequestConfig): Promise<Record<string, string>> {
  const userInfo = await STORAGE_GET_USER_INFO()
  const token = await STORAGE_GET_TOKEN()
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

  // Language
  if (i18n.locale) {
    headers['Language'] = i18n.locale
  }

  // Tenant-Id
  headers['Tenant-Id'] = '000000'

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
  config?: IRequestConfig
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
function handleErrorResponse(
  status: number,
  data: any,
  skipErrorHandler?: boolean
): Error {
  const errorMessage = data?.msg || data?.message || data?.error_description || data?.error
  let statusText: string | undefined

  switch (status) {
    case 400:
      statusText = data?.msg ?? 'Bad Request'
      break
    case 401:
      // 重新去登录
      // onLogout(true)
      console.log('====error.response===', { status, data })
      statusText = data?.msg ?? 'Bad Request'
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

  if (status !== 401) {
    statusText && !skipErrorHandler && message.info(statusText, 2)
  }

  return new Error(statusText || 'Unknown Error')
}

// 带超时的 fetch
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  console.log('🔄 Fetching:', url)

  try {
    // 显式构建 fetch 配置，避免展开运算符问题
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      signal: controller.signal
    }

    const response = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)
    console.log('✅ Fetch success:', url, response.status)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    console.log('❌ Fetch error:', url, error?.message)
    if (error?.name === 'AbortError') {
      throw new Error('Request Timeout')
    }
    throw error
  }
}

export const request = <T = any>(url: string, config?: IRequestConfig): Promise<T> => {
  const skipErrorHandler = config?.skipErrorHandler ?? false

  let toastKey = 0
  if (config?.showLoading) {
    toastKey = message.loading(t`Loading`, 0)
  }

  return new Promise(async (resolve, reject) => {
    try {
      const ENVS = await getEnv()
      console.log('ENVS:', ENVS)
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
      console.log('Request URL:', fullUrl)

      // 构建请求头
      const headers = await buildHeaders(config)

      // 构建请求配置
      const method = (config?.method?.toUpperCase() || 'GET') as string
      const fetchConfig: RequestInit = {
        method,
        headers
      }

      // 添加请求体（仅对非 GET 请求）
      if (config?.data && method !== 'GET') {
        fetchConfig.body = typeof config.data === 'string'
          ? config.data
          : JSON.stringify(config.data)
      }

      console.log('Fetch Config:', fullUrl, method)

      // 执行请求
      const response = await fetchWithTimeout(
        fullUrl,
        fetchConfig,
        config?.timeout || DEFAULT_TIMEOUT
      )

      // 处理响应
      const { data, status, ok } = await handleResponse<any>(response, config)

      // 如果没有响应数据
      if (!data && !ok) {
        console.log(`服务器无响应，接口地址:${baseURL}${requestUrl}`, config?.params || config?.data)
        resolve({ success: true } as T)
        return
      }

      // 处理非成功状态码
      if (!ok) {
        if (config?.skipAllErrorHandler) {
          reject(new Error('skipAllErrorHandler'))
          return
        }
        const error = handleErrorResponse(status, data, skipErrorHandler)
        reject(error)
        return
      }

      // 二进制数据则直接返回
      if (config?.responseType === 'blob' || config?.responseType === 'arraybuffer') {
        resolve(data as T)
        return
      }

      const { msg, code } = data || {}

      if(!['api/blade-auth/oauth/token'].some((item) => {
        return requestUrl.includes(item)
      }) ){
      if (code !== 200 && code !== 401) {
        console.log(`请求失败，接口地址:${baseURL}${requestUrl}`, data)

        // 客户端请求失败了统一提示，是否跳过错误提示
        if (!skipErrorHandler && msg) {
          message.info(msg, 2)
        }
      }

      if (code === 401) {
        // onLogout()
      }
    }
 
      resolve({ 
        success: true,
        ...data
      })
    } catch (error: any) {
      console.log('Request Error:', error.message, error)

      if (config?.skipAllErrorHandler) {
        reject(error)
        return
      }

      if (error.message === 'Request Timeout') {
        !skipErrorHandler && message.info('Request Timeout', 2)
      } else if (error.message?.includes('Network request failed')) {
        !skipErrorHandler && message.info(t`None response! Please retry`, 2)
      } else {
        !skipErrorHandler && message.info(error.message)
      }

      reject(error)
    } finally {
      // toastKey && Portal.remove(toastKey)
    }
  })
}
