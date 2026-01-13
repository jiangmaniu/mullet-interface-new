import { getAccessToken } from '@privy-io/react-auth'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Base64 } from 'js-base64'

import { getLocaleForBackend } from '@/v1/constants/enum'
import { getEnv } from '@/v1/env'
import { STORAGE_GET_TOKEN, STORAGE_GET_USER_INFO } from '@/v1/utils/storage'
import { toast } from '@mullet/ui/toast'

import { cleanLogoutCache } from '../compatible/utils/logout'

// import { message } from '@/v1/utils/message'

// 错误信息类型
type IErrorInfo = {
  code: number
  message: string
}

// 扩展请求配置类型
export interface IAxiosRequestConfig extends AxiosRequestConfig {
  /** 该请求是否需要token */
  needToken?: boolean
  /** 接口是否需要客户端鉴权 */
  authorization?: boolean
  /** 接口需要防重放，针对POST请求 */
  replayProtection?: boolean
  /** 接口需要加密请求参数，针对POST请求 */
  cryptoData?: boolean
  /** 跳过错误处理 */
  skipErrorHandler?: boolean
  /** 不显示错误消息 */
  noMessage?: boolean
  /** 自定义token */
  token?: string
  /** text请求 */
  text?: boolean
}

// 扩展 AxiosRequestConfig 以包含自定义属性
interface ExtendedInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  needToken?: boolean
  authorization?: boolean
  replayProtection?: boolean
  cryptoData?: boolean
  skipErrorHandler?: boolean
  noMessage?: boolean
  token?: string
  text?: boolean
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  timeout: 20000,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  async (config: ExtendedInternalAxiosRequestConfig) => {
    // https://docs.privy.io/authentication/user-authentication/access-tokens
    const privyAccessToken = await getAccessToken()

    // 请求之前添加token
    const userInfo = STORAGE_GET_USER_INFO() as User.UserInfo
    const token = config.token || STORAGE_GET_TOKEN() || ''
    const env = getEnv()
    const CLIENT_ID = env.CLIENT_ID
    const CLIENT_SECRET = env.CLIENT_SECRET

    // 设置请求头
    config.headers.set('Content-Type', 'x-www-form-urlencoded')
    config.headers.set('Language', getLocaleForBackend())
    config.headers.set('Tenant-Id', '000000') // 默认的租户ID

    if (privyAccessToken) {
      // 使用Privy的token
      config.headers.set('privy-token', privyAccessToken)
    }

    if (config.authorization !== false) {
      // 客户端认证
      config.headers.set('Authorization', `Basic ${Base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)}`)
    }

    if (token) {
      config.headers.set('Blade-Auth', `${userInfo?.token_type || 'Bearer'} ${token}`)
    }

    // POST接口
    // if (config.method === 'post') {
    //   // 启用接口防重放
    //   if (config.replayProtection) {
    //     const timestamp = Date.now()
    //     const nonce = getUid()
    //     const stringifyBodyparams = stringify(
    //       {
    //         // 业务参数排序
    //         ...formatObjArrToStr(sortObjectByKey(deleteEmptyProperty(config.data))),
    //         timestamp,
    //         nonce,
    //         appkey: REPLAY_PROTECTION_APP_KEY // 和后台约定的接口防重放的appkey
    //       },
    //       { encode: false }
    //     )
    //     // md5签名
    //     config.headers.set('sign', md5(stringifyBodyparams))
    //     // 时间戳
    //     config.headers.set('timestamp', timestamp)
    //     // 随机数
    //     config.headers.set('nonce', nonce)
    //   }
    // }

    // // 启用接口加密请求参数传输
    // if (config.cryptoData) {
    //   // 对接口使用AES堆成加密请求参数
    //   if (config.params) {
    //     const data = crypto.encrypt(JSON.stringify(config.params))
    //     config.params = { data }
    //   }
    //   if (config.data) {
    //     // 标记text请求
    //     config.text = true
    //     config.data = crypto.encrypt(JSON.stringify(config.data))
    //   }
    // }

    // headers中配置text请求
    if (config.text === true) {
      config.headers.set('Content-Type', 'text/plain')
    }

    if (config.params?.pageSize) {
      // 传给后台分页大小是size
      config.params.size = config.params.pageSize
      delete config.params.pageSize
    }

    // token不存在并且该请求需要token，则不发送请求
    if (!token && config.needToken !== false) {
      return Promise.reject(new Error('No token provided'))
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 拦截响应数据，进行个性化处理

    // 解析加密报文
    // const config = response.config as ExtendedInternalAxiosRequestConfig
    // if (config.cryptoData) {
    //   const d = JSON.parse(crypto.decryptAES(response.data, crypto.aesKey))
    //   response.data = d
    // }

    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * 错误处理函数
 * @param error 错误对象
 * @param opts 请求配置
 */
const handleError = (error: any, opts?: IAxiosRequestConfig): void => {
  // 跳过错误处理
  if (opts?.skipErrorHandler) {
    if (error?.response?.data?.code === 401 || error?.response?.status === 401) {
      // 重新去登录
      cleanLogoutCache()
    }
    throw error
  }

  // 业务接口错误处理
  if (error.name === 'MtServiceError') {
    const errorInfo: IErrorInfo = error.info
    if (errorInfo) {
      const { message: errorMessage, code } = errorInfo
      if (code === 401) {
        // 登录失效，重新去登录
        cleanLogoutCache()
        return
      } else {
        // 业务错误统一提示
        errorMessage && !opts?.noMessage && toast.info(errorMessage)
      }
    }
  } else if (error.response) {
    // Axios 的错误
    // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
    const { status, data } = error.response
    let errorMessage = data?.msg || data?.message || data?.error_description || data?.error
    let statusText

    switch (status) {
      case 400:
        statusText = 'Bad Request'
        break
      case 401:
        // 重新去登录
        cleanLogoutCache()
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
      statusText && toast.info(statusText)
    }
  } else if (error.request) {
    // 请求已经成功发起，但没有收到响应
    toast.info('None response! Please retry.')
  } else if (error.message?.startsWith('timeout')) {
    toast.info('Request Timeout')
  } else {
    // 发送请求时出了点问题
    // message.info('Request error, please retry.')
  }
}

/**
 * 检查业务响应是否成功，如果不成功则抛出错误
 * @param res 响应数据
 */
const checkBusinessError = (res: any): void => {
  const { success, msg: errorMessage, code } = res as API.Response
  // 根据后端返回抛出错误
  if (!success) {
    const error: any = new Error(errorMessage)
    error.name = 'MtServiceError'
    error.info = { code, message: errorMessage }
    throw error
  }
}

/**
 * 封装的请求方法
 * @param url 请求地址
 * @param opts 请求配置
 * @returns Promise
 */
export const request = <T = any>(
  url: string,
  opts: IAxiosRequestConfig = { method: 'GET' },
): Promise<T & { success: boolean; message?: string; errorInfo?: any }> => {
  return axiosInstance
    .request<T>({
      url,
      ...opts,
    })
    .then((response) => {
      const res = response.data as any

      // 检查业务错误
      try {
        checkBusinessError(res)
      } catch (error) {
        handleError(error, opts)
        const errorInfo = (error as any).info
        return {
          success: false,
          errorInfo,
          message: errorInfo?.message,
          ...errorInfo,
        }
      }

      return { success: true, ...res }
    })
    .catch((error) => {
      // 统一处理错误不继续抛出
      handleError(error, opts)

      const errorInfo = error?.response?.data
      const errorMessage = error.info?.message || errorInfo?.error_description || errorInfo?.error

      return {
        success: false,
        errorInfo,
        message: errorMessage,
        ...(error.info || {}),
      }
    })
}

/**
 * GET 请求
 * @param url 请求地址
 * @param opts 请求配置
 * @returns Promise
 */
export const get = <T = any>(
  url: string,
  opts?: Omit<IAxiosRequestConfig, 'method'>,
): Promise<T & { success: boolean; message?: string; errorInfo?: any }> => {
  return request<T>(url, { ...opts, method: 'GET' })
}

/**
 * POST 请求
 * @param url 请求地址
 * @param data 请求数据
 * @param opts 请求配置
 * @returns Promise
 */
export const post = <T = any>(
  url: string,
  data?: any,
  opts?: Omit<IAxiosRequestConfig, 'method' | 'data'>,
): Promise<T & { success: boolean; message?: string; errorInfo?: any }> => {
  return request<T>(url, { ...opts, method: 'POST', data })
}

/**
 * PUT 请求
 * @param url 请求地址
 * @param data 请求数据
 * @param opts 请求配置
 * @returns Promise
 */
export const put = <T = any>(
  url: string,
  data?: any,
  opts?: Omit<IAxiosRequestConfig, 'method' | 'data'>,
): Promise<T & { success: boolean; message?: string; errorInfo?: any }> => {
  return request<T>(url, { ...opts, method: 'PUT', data })
}

/**
 * DELETE 请求
 * @param url 请求地址
 * @param opts 请求配置
 * @returns Promise
 */
export const del = <T = any>(
  url: string,
  opts?: Omit<IAxiosRequestConfig, 'method'>,
): Promise<T & { success: boolean; message?: string; errorInfo?: any }> => {
  return request<T>(url, { ...opts, method: 'DELETE' })
}

/**
 * 判斷是不是 reactnativewebview，如果是查詢參數拼接 hide=1
 * @param url 請求的 URL
 * @returns 拼接后的 URL
 */
export const appendHideParamIfNeeded = (url: string): string => {
  // @ts-ignore
  if (window.ReactNativeWebView) {
    const [baseUrl, queryString] = url.split('?')
    const params = new URLSearchParams(queryString || '')
    params.set('hideHeader', '1')
    return `${baseUrl}?${params.toString()}`
  }
  return url
}

// 导出 axios 实例，方便需要时直接使用
export { axiosInstance }

export default request
