// import { jotaiStore, userTokenAtom } from '@/store'
// import toast from 'react-hot-toast'

// import { store } from '@/store'
// import { toast } from '@repo/ui/components'

import { getAccessToken } from '@privy-io/react-auth'
import { Base64 } from 'js-base64'
import type { RequestOptions } from '@@/plugin-request/request'

import { getLocaleForBackend } from '@/constants/enum'
import { getEnv } from '@/env'
import { message } from '@/utils/message'
import { STORAGE_GET_TOKEN, STORAGE_GET_USER_INFO } from '@/utils/storage'
import { RequestConfig } from '@umijs/max'

import { HttpClient, TradeCoreApi } from './gen'

export const getTradeCoreApiInstance = () => {
  const baseUrl = `/api/trade-core`

  const customFetch: typeof fetch = async (...[input, init]: Parameters<typeof fetch>) => {
    try {
      // const token = store.getState().user.token

      // const token = jotaiStore.get(userTokenAtom)

      // https://docs.privy.io/authentication/user-authentication/access-tokens
      const privyAccessToken = await getAccessToken()
      // console.log('privy accessToken', privyAccessToken);
      // 请求之前添加token
      const userInfo = STORAGE_GET_USER_INFO() as User.UserInfo
      const token = STORAGE_GET_TOKEN() || ''
      const env = getEnv()
      const CLIENT_ID = env.CLIENT_ID
      const CLIENT_SECRET = env.CLIENT_SECRET
      const headers: RequestInit['headers'] = {
        // 'Content-Type': 'x-www-form-urlencoded',
        Language: getLocaleForBackend(),
        'Tenant-Id': '000000', // 默认的租户ID
      }
      if (privyAccessToken) {
        // 使用Privy的token
        headers['privy-token'] = privyAccessToken
      }
      const config = { authorization: true }
      if (config.authorization !== false) {
        // 客户端认证
        headers['Authorization'] = `Basic ${Base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      }

      if (token) {
        headers['Blade-Auth'] = `${userInfo?.token_type || 'Bearer'} ${token}`
      }

      const requestInit: RequestInit = {
        ...init,
        headers: {
          ...init?.headers,
          // ...(token ? { 'X-Access-Token': `${token}` } : {}),
          ...headers,
        },
      }

      const rs = await fetch(input, requestInit)

      const rsData = await rs.clone().json()

      // const { data: response, status } = rsData ?? {}
      // if (status !== 200) {
      //   toast.error('服务器错误')
      //   return Promise.reject('服务器错误')
      // }

      const response = rsData
      const { code, message, success } = response ?? {}
      if (![0, 200].includes(code) || !success) {
        // toast.error(message)
        return Promise.reject(new Error(message ?? '服务器错误'))
      }

      return rs
    } catch (err) {
      return Promise.reject(err)
    }
  }

  const httpClient = new HttpClient({
    baseUrl,
    customFetch,
    baseApiParams: {
      format: 'json',
    },
  })
  const tradeCoreApi = new TradeCoreApi(httpClient)

  return tradeCoreApi
}
