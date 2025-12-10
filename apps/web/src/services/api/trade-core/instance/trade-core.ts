import { getAccessToken } from '@privy-io/react-auth'
import Cookies from 'js-cookie'

import { jotaiStore } from '@/atoms'
import { loginInfoAtom, loginInfoAtomBase } from '@/atoms/user/login-info'
import { COOKIE_LOCALE_KEY, DEFAULT_LOCALE } from '@/constants/locale'

import { HttpClient, TradeCoreApi } from './gen'

export const getTradeCoreApiInstance = () => {
  const baseUrl = `/api/trade-core`

  const customFetch: typeof fetch = async (...[input, init]: Parameters<typeof fetch>) => {
    try {
      // https://docs.privy.io/authentication/user-authentication/access-tokens
      const privyAccessToken = await getAccessToken()
      const lang = Cookies.get(COOKIE_LOCALE_KEY) ?? DEFAULT_LOCALE

      const headers: RequestInit['headers'] = {
        Language: lang,
        'Tenant-Id': '000000', // 默认的租户ID
      }
      if (privyAccessToken) {
        // 使用Privy的token
        headers['privy-token'] = privyAccessToken
      }

      const loginInfo = await jotaiStore.get(loginInfoAtomBase)
      if (loginInfo?.access_token) {
        headers['Blade-Auth'] = `${loginInfo?.token_type || 'Bearer'} ${loginInfo.access_token}`
      }

      const requestInit: RequestInit = {
        ...init,
        headers: {
          ...init?.headers,
          ...headers,
        },
      }

      const rs = await fetch(input, requestInit)

      // 检查响应是否为 JSON
      const contentType = rs.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await rs.text()
        console.error('API returned non-JSON response:', {
          status: rs.status,
          statusText: rs.statusText,
          contentType,
          url: input,
          body: text.substring(0, 500), // 只打印前500字符
        })
        throw new Error(`API returned HTML instead of JSON. Status: ${rs.status}`)
      }

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
