// import { Portal } from '@ant-design/react-native'
import axios from 'axios'
import { Base64 } from 'js-base64'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import { getEnv } from '@/v1/env'
import { i18n } from '@lingui/core'

// import { t } from '@lingui/core/macro'
import { message } from './message'
import { onLogout } from './navigation'
import { STORAGE_GET_TOKEN, STORAGE_GET_TRADER_SERVER, STORAGE_GET_USER_INFO } from './storage'

interface IAxiosRequestConfig extends AxiosRequestConfig {
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
}

// 接口配置
const $axios: AxiosInstance = axios.create({
  method: 'GET', // 默认get
  responseType: 'json',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// http request 拦截器
$axios.interceptors.request.use(
  async (config: IAxiosRequestConfig) => {
    // 请求之前添加token
    const userInfo = await STORAGE_GET_USER_INFO()
    const token = await STORAGE_GET_TOKEN()
    const ENV = await getEnv()

    const headers: any = {
      'Content-Type': 'x-www-form-urlencoded',
      // Language: i18n.locale,
      'Tenant-Id': '000000', // 默认的租户ID
      ...config.headers,
    }

    if (config?.authorization !== false) {
      // 客户端认证
      headers['Authorization'] = `Basic ${Base64.encode(`${ENV.CLIENT_ID}:${ENV.CLIENT_SECRET}`)}`
    }

    if (token) {
      headers['Blade-Auth'] = `${userInfo?.token_type} ${token}`
    }

    // POST接口
    // if (config.method === 'post') {
    //   // 启用接口防重放
    //   if (config.replayProtection) {
    //     const timestamp = Date.now()
    //     const nonce = getUID()
    //     const stringifyBodyparams = JSON.stringify({
    //       // 业务参数排序
    //       ...formatObjArrToStr(sortObjectByKey(deleteEmptyProperty(config.data))),
    //       timestamp,
    //       nonce,
    //       appkey: REPLAY_PROTECTION_APP_KEY // 和后台约定的接口防重放的appkey
    //     })
    //     // console.log('stringifyBodyparams', stringifyBodyparams)
    //     // console.log('md5', md5(stringifyBodyparams))
    //     // md5签名
    //     headers['sign'] = md5(stringifyBodyparams)
    //     // 时间戳
    //     headers['timestamp'] = timestamp
    //     // 随机数
    //     headers['nonce'] = nonce
    //   }
    // }

    // // 启用接口加密请求参数传输
    // if (config.cryptoData) {
    //   // console.log('加密前的请求参数', config.data)
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
    //   // console.log('加密后的请求参数', config.data)
    //   // console.log('解密后的请求参数', JSON.parse(crypto.decrypt(config.data)))
    // }

    // headers中配置text请求
    // if (config.text === true) {
    //   headers['Content-Type'] = 'text/plain'
    // }

    if (config?.params?.pageSize) {
      // 传给后台分页大小是size
      config.params.size = config.params.pageSize
      delete config.params.pageSize
    }

    return { ...config, interceptors: true, headers }
  },
  (err: AxiosError) => {
    return Promise.reject(err)
  },
)

// http response 拦截器
$axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // 解析加密报文
    // @ts-ignore
    // if (response.config.cryptoData) {
    //   // @ts-ignore
    //   const d = JSON.parse(crypto.decryptAES(response.data, crypto.aesKey))
    //   // @ts-ignore
    //   response.data = d
    // }
    return response
  },
  (error: AxiosError) => {
    console.log(error)
    // @ts-ignore
    const skipErrorHandler = error.config?.skipErrorHandler
    // @ts-ignore
    const skipAllErrorHandler = error.config?.skipAllErrorHandler
    if (skipAllErrorHandler) {
      return Promise.reject(new Error('skipAllErrorHandler'))
    }
    if (error.response) {
      // Axios 的错误
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      const { status, data } = error.response as unknown as API.Response & { status: number }
      const errorMessage = data?.msg || data?.message || data?.error_description || data?.error
      let statusText
      switch (status) {
        case 400:
          statusText = (error.response.data as any)?.msg ?? 'Bad Request'
          break
        case 401:
          // 重新去登录
          // onLogout(true)
          console.log('====error.response===', error.response)
          statusText = (error.response.data as any)?.msg ?? 'Bad Request'
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

      return Promise.reject(new Error(statusText))
    } else if (error?.request) {
      // 请求已经成功发起，但没有收到响应
      // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
      // 而在node.js中是 http.ClientRequest 的实例
      !skipErrorHandler && message.info(i18n.t('common.None response! Please retry'), 2)

      return Promise.reject(new Error(i18n.t('common.None response! Please retry')))
    } else if (error?.message?.startsWith('timeout')) {
      !skipErrorHandler && message.info('Request Timeout', 2)

      return Promise.reject(new Error('Request Timeout'))
    } else {
      // 发送请求时出了点问题
      // message.info('Request error, please retry.')
    }
  },
)

export const request = <T = any>(url: string, config?: IAxiosRequestConfig): Promise<T> => {
  let skipErrorHandler = false
  if (config?.skipErrorHandler) skipErrorHandler = true

  let toastKey = 0
  if (config?.showLoading) {
    toastKey = message.loading(i18n.t('common.Loading'), 0)
  }

  return new Promise(async (resolve, reject) => {
    const ENVS = await getEnv()
    const serviceProvider = (await STORAGE_GET_TRADER_SERVER()) as User.ServiceProviderListItem
    const baseURL = config?.baseURL || serviceProvider?.serviceUrl || ENVS.baseURL
    const withoutProxy = ENVS.WITHOUT_PROXY || false

    if (withoutProxy) {
      url = url.replace('/api', '')
    }

    $axios({
      url,
      // 优先使用传入的，其次使用登录服务商列表的服务，最后没有在使用默认
      baseURL,
      ...config,
    })
      .then((res: AxiosResponse) => {
        // 如果没有 res，抛出错误 '服务器无响应'
        if (!res) {
          // throw new Error('Server No Response')
          console.log(`服务器无响应，接口地址:${baseURL}${url}`, config?.params || config?.data)
          resolve({ success: true } as T)
          return
        }

        const { msg, code } = res?.data || {}
        // 二进制数据则直接返回
        if (res?.request?.responseType === 'blob' || res?.request?.responseType === 'arraybuffer') {
          resolve(res as T)
          return
        }

        if (code !== 200 && code !== 401) {
          console.log(`请求失败，接口地址:${baseURL}${url}`, res?.data)

          // 客户端请求失败了统一提示，是否跳过错误提示
          if (!skipErrorHandler && msg) {
            message.info(msg, 2)
          }
        }
        if (code === 401) {
          onLogout()
        }
        // console.log('/****************** request ******************/')
        // console.log('url', res.config.url)
        resolve({
          success: true,
          ...res?.data,
        })
      })
      .catch((error: AxiosError) => {
        if (config?.skipAllErrorHandler) {
          reject(error)
          return
        }
        !skipErrorHandler && message.info(error.message)
        reject(error)
        // reject(error)
        // const errorInfo = error?.response?.data as any
        // if (error.response) {
        //   // TODO: 错误处理待验证
        //   // eslint-disable-next-line prefer-promise-reject-errors
        //   reject({
        //     success: false, // 失败统一加上，方便表格消费
        //     errorInfo: error.response.data,
        //     message: (error as any)?.info?.message || errorInfo?.error_description || errorInfo?.error

        //   })
        // } else {
        //   // TODO: 错误处理待验证
        //   // eslint-disable-next-line prefer-promise-reject-errors
        //   reject({
        //     success: false, // 失败统一加上，方便表格消费
        //     errorInfo: error,
        //     message: error.message
        //   })
        // }
      })
      .finally(() => {
        // toastKey && Portal.remove(toastKey)
      })
  })
}
