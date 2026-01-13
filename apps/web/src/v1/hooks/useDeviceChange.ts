import { useEffect } from 'react'
import qs from 'qs'

import { MOBILE_HOME_PAGE, MOBILE_LOGIN_PAGE, WEB_HOME_PAGE, WEB_LOGIN_PAGE } from '@/v1/constants'
// import { navigateTo } from '@/pages/webapp/utils/navigator'
import mitt from '@/v1/utils/mitt'
// import { getPathname } from '@/utils/navigator'
import {
  STORAGE_GET_DEVICE_TYPE,
  STORAGE_GET_TOKEN,
  STORAGE_SET_DEVICE_TYPE,
  STORAGE_SET_TRADINGVIEW_RESOLUTION,
} from '@/v1/utils/storage'

import { isInStandaloneMode } from '../utils/device'

export const useDeviceChange = () => {
  // const breakPoint = useBreakpoint() || ''
  const breakPoint = 'xl'
  // const pathname = location.pathname
  // const purePath = getPathname(pathname)
  const searchParams =
    typeof window !== 'undefined' ? qs.parse(window.location.search, { ignoreQueryPrefix: true }) : {}

  const exposed = {
    isPwaApp: isInStandaloneMode(),
    isRNWebview: typeof window !== 'undefined' && !!(window as any).ReactNativeWebView,
    breakPoint,
    isMobile: ['xs', 'sm'].includes(breakPoint), // 手机端，不包含ipad
    isIpad: ['md', 'lg'].includes(breakPoint), // 是否是ipad端
    isMobileOrIpad: ['xs', 'sm', 'md', 'lg'].includes(breakPoint), // 手机端，包含ipad
    isPc: ['xl', 'xxl'].includes(breakPoint), // pc端 >= 1200px
  }

  const setDeviceType = (type: 'PC' | 'MOBILE') => {
    STORAGE_SET_DEVICE_TYPE(type)
  }

  // const mobileUrl = exposed.isRNWebview ? purePath : MOBILE_HOME_PAGE // 支持响应式切换pc和移动端，RN端不用设置，否则RN跳转h5指定页面有问题
  // const jumpUrl = exposed.isPc ? WEB_HOME_PAGE : mobileUrl
  // const loginUrl = exposed.isPc ? WEB_LOGIN_PAGE : MOBILE_LOGIN_PAGE

  const mobileUrl = exposed.isRNWebview ? MOBILE_HOME_PAGE : MOBILE_HOME_PAGE // 支持响应式切换pc和移动端，RN端不用设置，否则RN跳转h5指定页面有问题
  const jumpUrl = exposed.isPc ? WEB_HOME_PAGE : WEB_HOME_PAGE
  const loginUrl = exposed.isPc ? WEB_LOGIN_PAGE : WEB_LOGIN_PAGE

  const getHomePage = async () => {
    let token = await STORAGE_GET_TOKEN()
    if (!token && exposed.isRNWebview) {
      // 处理RN端设置token异步问题
      return new Promise((resolve) => {
        mitt.on('tokenChange', (token) => {
          resolve(token ? jumpUrl : loginUrl)
        })
      })
    }

    return token ? jumpUrl : loginUrl
  }

  // 设备切换
  const changeDeviceType = async (currentDeviceType: 'PC' | 'MOBILE') => {
    const page = (await getHomePage()) as string
    setDeviceType(currentDeviceType)

    // 切换k线分辨率周期，PC端15分钟，移动端1分钟
    STORAGE_SET_TRADINGVIEW_RESOLUTION(currentDeviceType === 'PC' ? '15' : '1')

    // navigateTo(page, searchParams)
  }

  /** 检查设备类型，如果设备类型发生变化，则跳转到对应的页面 */
  const checkDeviceType = async () => {
    const currentDeviceType = exposed.isPc ? 'PC' : 'MOBILE'

    const deviceType = await STORAGE_GET_DEVICE_TYPE()
    if (deviceType !== currentDeviceType) {
      changeDeviceType(currentDeviceType)
    }
  }

  useEffect(() => {
    checkDeviceType()
  }, [breakPoint])

  //初始化设备类型。不要监听，只执行一次即可
  useEffect(() => {
    setDeviceType(exposed.isPc ? 'PC' : 'MOBILE')
  }, [])

  return {
    setDeviceType,
    getHomePage,
    checkDeviceType,
    changeDeviceType,
    breakPoint,
    exposed,
    jumpUrl,
    loginUrl,
  }
}
