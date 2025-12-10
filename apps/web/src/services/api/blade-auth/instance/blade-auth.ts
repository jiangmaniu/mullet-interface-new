import { getAccessToken } from '@privy-io/react-auth'
import { Base64 } from 'js-base64'
import Cookies from 'js-cookie'

import { COOKIE_LOCALE_KEY, DEFAULT_LOCALE } from '@/constants/locale'

import { BladeAuthApi, HttpClient } from './gen'

export const getBladeAuthApiInstance = () => {
  const baseUrl = `/api/blade-auth`

  const customFetch: typeof fetch = async (...[input, init]: Parameters<typeof fetch>) => {
    try {
      // https://docs.privy.io/authentication/user-authentication/access-tokens
      const privyAccessToken = await getAccessToken()
      const lang = Cookies.get(COOKIE_LOCALE_KEY) ?? DEFAULT_LOCALE

      const headers: RequestInit['headers'] = {
        'Content-Type': 'x-www-form-urlencoded',
        Language: lang,
        'Tenant-Id': '000000', // 默认的租户ID
      }
      if (privyAccessToken) {
        // 使用Privy的token
        headers['privy-token'] = privyAccessToken
      }

      const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID
      const CLIENT_SECRET = process.env.NEXT_PUBLIC_CLIENT_SECRET
      headers['Authorization'] = `Basic ${Base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)}`

      // headers['Blade-Auth'] = `    `

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
      if (!response) {
        // toast.error(message)
        return Promise.reject(new Error('服务器错误'))
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
  const tradeCoreApi = new BladeAuthApi(httpClient)

  return tradeCoreApi
}
