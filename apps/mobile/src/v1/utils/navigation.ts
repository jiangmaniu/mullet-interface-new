import { router, usePathname, useSegments } from 'expo-router'
import { parse, stringify } from 'qs'
import type { DependencyList } from 'react'
import { useEffect } from 'react'
import { BackHandler } from 'react-native'

import {
  STORAGE_GET_AUTHORIZED,
  STORAGE_GET_TOKEN,
  STORAGE_GET_USER_INFO,
  STORAGE_REMOVE_AUTHORIZED,
  STORAGE_REMOVE_CONF_INFO,
  STORAGE_REMOVE_ENV,
  STORAGE_REMOVE_TOKEN,
  STORAGE_REMOVE_USER_INFO
} from './storage'
import { getEnv } from '@/v1/env'
import { WEBVIEW_AUTHRORIZATION_URI } from '@/v1/constants'

// v1 路由名称到 expo-router 路径的映射
const routeMap: Record<string, string> = {
  Main: '/(tabs)',
  Welcome: '/welcome',
  Trade: '/(tabs)/trade',
  Quote: '/(tabs)/quote',
  Position: '/(tabs)/position',
  User: '/(tabs)/user',
  Webview: '/webview',
  AccountNew: '/account/new',
  AccountSelect: '/account/select'
  // 根据实际路由结构添加更多映射
}

// 将 v1 路由名称转换为 expo-router 路径
function getRoutePath(name: string): string {
  return routeMap[name] || `/${name.toLowerCase()}`
}

// 格式化参数到url上
export const formatUrlParams = async (url: string, params?: any) => {
  const token = await STORAGE_GET_TOKEN()
  const userInfo = (await STORAGE_GET_USER_INFO()) as User.UserInfo
  const tempUrl = new URL(url)
  // 解析url中?后面的参数
  const parseUrlParams = parse(tempUrl.search.slice(1) || '') || {}
  console.log('parseUrlParams', parseUrlParams)
  const defaultParams: any = {
    user_id: userInfo.user_id,
    token,
    ...parseUrlParams,
    ...params
  }
  const retUrl = `${tempUrl.origin}${tempUrl.pathname}?${stringify(defaultParams)}`
  console.log('retUrl', retUrl)
  return retUrl
}

// webview页面定义，和client.stellux.io需要的路由定义保持一致
export interface IWebViewScreenParam {
  /** 入金页面 */
  H5_Deposit?: string
  /** 提款页面 */
  H5_Withdraw?: string
  /** 记录页面 */
  H5_PaymentRecord?: string
  /** salesmartly客服页面 */
  H5_SalemartlyKefu?: string
}

async function formatUrl(url: string, params?: any) {
  const ENVS = await getEnv()
  const ORIGIN_WAPURL = ENVS.websiteURL ? new URL(ENVS.websiteURL).origin : ''
  const res = {
    url: (url || '').trim?.(),
    params
  }
  if (res.url.startsWith('http')) {
    res.params = { ...params, uri: res.url }
    res.url = 'Webview'
    return res
  }
  let uri = ''
  let redirectUrl = ''
  // TODO: 需要处理 i18n.locale
  const locale = 'zh-TW'
  const _uri = `${ORIGIN_WAPURL}/${locale}${WEBVIEW_AUTHRORIZATION_URI}`

  const authorized = await STORAGE_GET_AUTHORIZED()
  switch (res.url) {
    case 'H5_PaymentRecord':
      res.url = 'Webview'
      redirectUrl = '/app/record/payment'

      if (authorized) {
        uri = await formatUrlParams(`${ORIGIN_WAPURL}/${locale}${redirectUrl}`, {
          hideHeader: 1,
          type: params?.type
        })
      } else {
        uri = await formatUrlParams(_uri, {
          redirect_url: encodeURIComponent(
            `${redirectUrl}?${stringify({
              hideHeader: 1,
              type: params?.type
            })}`
          )
        })
      }

      res.params = { ...params, uri, redirectUrl }
      break
    case 'H5_Deposit':
      res.url = 'Webview'
      redirectUrl = '/app/deposit'

      if (authorized) {
        uri = await formatUrlParams(`${ORIGIN_WAPURL}/${locale}${redirectUrl}`)
      } else {
        uri = await formatUrlParams(_uri, {
          redirect_url: encodeURIComponent(redirectUrl)
        })
      }

      res.params = { ...params, uri, redirectUrl }
      break
    case 'H5_Withdraw':
      res.url = 'Webview'
      redirectUrl = '/app/withdraw'

      if (authorized) {
        uri = await formatUrlParams(`${ORIGIN_WAPURL}/${locale}${redirectUrl}`)
      } else {
        uri = await formatUrlParams(_uri, {
          redirect_url: encodeURIComponent(redirectUrl)
        })
      }

      res.params = { ...params, uri, redirectUrl }
      break
    case 'H5_BankCardAddress':
      res.url = 'Webview'
      redirectUrl = '/app/bankcard-address'

      if (authorized) {
        uri = await formatUrlParams(`${ORIGIN_WAPURL}/${locale}${redirectUrl}`)
      } else {
        uri = await formatUrlParams(_uri, {
          redirect_url: encodeURIComponent(redirectUrl)
        })
      }

      res.params = { ...params, uri, redirectUrl }
      break
    case 'H5_WalletAddress':
      res.url = 'Webview'
      redirectUrl = '/app/wallet-address'

      if (authorized) {
        uri = await formatUrlParams(`${ORIGIN_WAPURL}/${locale}${redirectUrl}`)
      } else {
        uri = await formatUrlParams(_uri, {
          redirect_url: encodeURIComponent(redirectUrl)
        })
      }

      res.params = { ...params, uri, redirectUrl }
      break
    case 'H5_SalemartlyKefu':
      res.url = 'Webview'
      uri = await formatUrlParams(`${ORIGIN_WAPURL}/${locale}/app/smart-kefu`)
      res.params = { ...params, uri }
      break
  }
  return res
}

export function getCurrentRouteName() {
  // Expo Router 中可以通过 usePathname 或 useSegments 获取当前路由
  // 但这些是 hooks，只能在组件中使用
  // 这里返回 null，实际使用时应在组件中使用 usePathname
  return null
}

// Hook: 获取当前路由名称
export function useCurrentRouteName() {
  const pathname = usePathname()
  return pathname
}

export function navigate(name: string, params?: any) {
  const path = getRoutePath(name)
  if (params && Object.keys(params).length > 0) {
    router.navigate({
      pathname: path as any,
      params
    })
  } else {
    router.navigate(path as any)
  }
}

export async function jump(url: string, params?: any, pushIn?: boolean) {
  const res = await formatUrl(url, params)

  if (pushIn) {
    return push(res.url, res.params)
  } else {
    return navigate(res.url, res.params)
  }
}

export function goBack() {
  if (router.canGoBack()) {
    router.back()
  }
}

export async function replace(url: string, params?: any) {
  const res = await formatUrl(url, params)
  const path = getRoutePath(res.url)

  setTimeout(() => {
    if (params && Object.keys(params).length > 0) {
      router.replace({
        pathname: path as any,
        params: res.params
      })
    } else {
      router.replace(path as any)
    }
  }, 300)
}

export function canGoBack() {
  return router.canGoBack()
}

export async function push(url: string, params?: any) {
  const res = await formatUrl(url, params)
  const path = getRoutePath(res.url)

  if (params && Object.keys(params).length > 0) {
    router.push({
      pathname: path as any,
      params: res.params
    })
  } else {
    router.push(path as any)
  }
}

// 重置页面 - Expo Router 中使用 replace 来重置
export function reset(routeName: string, params = {}) {
  const path = getRoutePath(routeName)
  router.replace({
    pathname: path as any,
    params
  })
}

/**
 * 退出登录
 * @param noRequestLogout 不请求退出接口
 */
export const onLogout = async (noRequestLogout?: boolean) => {
  await STORAGE_REMOVE_TOKEN()
  await STORAGE_REMOVE_USER_INFO()
  await STORAGE_REMOVE_CONF_INFO()
  await STORAGE_REMOVE_ENV()
  await STORAGE_REMOVE_AUTHORIZED()
  setTimeout(() => {
    replace('Welcome')
  }, 50)
}

/**
 * 拦截系统返回功能
 * @param onGoBackCallback 回调
 * @param deps
 */
export function useGoBackHandler(onGoBackCallback: () => boolean | null | undefined, deps?: DependencyList) {
  const segments = useSegments()

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onGoBackCallback)

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onGoBackCallback)
    }
  }, [onGoBackCallback, deps, segments])
}

// 跳转到客服页面
export const goKefu = () => {
  jump('H5_SalemartlyKefu')
}
