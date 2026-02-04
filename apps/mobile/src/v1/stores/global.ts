import { action, makeAutoObservable, observable, reaction, runInAction } from 'mobx'
import { hydrateStore } from 'mobx-persist-store'
import { getLocales } from 'react-native-localize'

import { checkVersion } from '@/v1/utils/checkVersion'
import { i18n } from '@lingui/core'
import {
  STORAGE_GET_ENV,
  STORAGE_GET_LNG,
  STORAGE_GET_TOKEN,
  STORAGE_GET_TRADER_SERVER,
  STORAGE_SET_LNG,
  STORAGE_SET_LOCATION_INFO,
  STORAGE_GET_LOCATION_INFO,
  STORAGE_SET_ANDROID_PRIVACY_MODAL,
  STORAGE_GET_ANDROID_PRIVACY_MODAL
} from '@/v1/utils/storage'

import { hydrateStores, stores } from '../provider/mobxProvider'
import type { IStore, PVoid } from './types'
import { getAppVersion, getRegisterWay } from '@/v1/services/common'
import { CHANNEL_CONFIG, DEFAULT_LOCALE, DEFAULT_REGISTER_WAY } from '@/v1/constants'
import { fetchRemoteConfig, getEnv } from '@/v1/env'
import { Platform } from 'react-native'
import { Config } from '../platform/config'
// import { getVersion } from 'react-native-device-info'

type StoreDefaultKeys = 'set' | 'upload' | 'hydrate'

export type StoreKeysOf<S> = keyof Omit<S, StoreDefaultKeys>

type IABType = 'A' | 'B'

const VERSION = Config.VERSION

export class GlobalStore implements IStore {
  constructor() {
    makeAutoObservable(this)

    reaction(
      () => this.verifyCodeDown,
      (down) => {
        if (down >= 0) {
          this.verifyCodeDownTimer = setTimeout(() => {
            this.countDownVerifyCode(down)
          }, 1000)
          return () => {
            if (this.verifyCodeDownTimer) {
              clearTimeout(this.verifyCodeDownTimer)
              this.verifyCodeDownTimer = null
            }
          }
        } else {
          if (this.verifyCodeDownTimer) {
            clearTimeout(this.verifyCodeDownTimer)
            this.verifyCodeDownTimer = null
          }
        }
      }
    )
  }

  @observable showUpdateModal = false // 是否显示更新弹窗
  @observable hasPopBanner = false // 首页是否弹窗
  getAppVersionFlag = false
  @observable registerWay: API.RegisterWay = DEFAULT_REGISTER_WAY // 注册方式: EMAIL | PHONE
  @observable currentServiceProvider = {} as User.ServiceProviderListItem // 当前登录所选的服务商信息
  @observable verifyCodeDown = -1 // 验证码倒计时
  @observable verifyCodeDownTimer: any = null
  // @observable keyboardDidShowListener: any = null
  // @observable keyboardDidHideListener: any = null
  @observable scrollRef: any = null
  @observable scrollRefY = 0
  @observable scrolling = false
  countryList: Common.AreaCodeItem[] = []
  @observable showABType = '' as IABType // AB面类型
  @observable showAndroidPrivacyModal = Platform.OS === 'android' ? 0 : '' // 初始0 点过同意1  安卓端 是否显示隐私协议弹窗

  set<T extends StoreKeysOf<GlobalStore>>(what: T, value: GlobalStore[T]) {
    ;(this as GlobalStore)[what] = value
  }

  @action countDownVerifyCode = async (down: number) => {
    this.verifyCodeDown = down - 1
  }

  // Hydration
  hydrate = async (): PVoid => {
    await hydrateStore(this)
  }

  @action
  setAndroidPrivacyModal = (value: any) => {
    this.showAndroidPrivacyModal = value
    STORAGE_SET_ANDROID_PRIVACY_MODAL(value)
  }

  // 初始化安卓端隐私政策
  initAndroidPrivacyModal = async () => {
    const env = await getEnv()
    if (Platform.OS !== 'android') return
    if (!env.ANDROID_PRIVACY_AGREEMENT) return

    const value = await STORAGE_GET_ANDROID_PRIVACY_MODAL()
    this.showAndroidPrivacyModal = value || 0
  }

  // 设置系统语言
  setSystemLang = async () => {
    try {
      const systemLanguages = getLocales()
      let systemLanguage = systemLanguages[0].languageCode
      const userLanguage = await STORAGE_GET_LNG()

      // 如果当前语言不是预设的几种，则设置默认语言
      if (!['zh-TW', 'en-US', 'id-ID', 'vi-VN'].includes(systemLanguage)) {
        systemLanguage = DEFAULT_LOCALE
      }
      // 打开app没有设置语言使用系统默认
      if (!userLanguage) {
        i18n.activate(systemLanguage)
        STORAGE_SET_LNG(systemLanguage)
      }
    } catch (err) {}
  }

  @action
  initServiceInfo = async () => {
    this.currentServiceProvider = (await STORAGE_GET_TRADER_SERVER()) || {}
  }

  // 获取该应用支持的注册方式，目前只支持一种，不支持同时切换手机、邮箱注册
  getRegisterWay = async () => {
    // @ts-ignore
    const netinfoModule = await import('@react-native-community/netinfo')
    const state = await netinfoModule.fetch()
    if (state.isConnected) {
      const res = await getRegisterWay()
      runInAction(() => {
        if (res.data) {
          this.registerWay = (res.data as API.RegisterWay) || 'PHONE'
          // this.registerWay = 'PHONE'
        }
      })
    }
  }

  // 获取AB面 跟版本没关系 只跟渠道号有关系
  @action async getAB() {
    await this.initLocationInfo()
    const res = await getAppVersion({
      device: Platform.OS as Common.VersionItem['device'],
      versionNumber: VERSION,
      channelNumber: CHANNEL_CONFIG.CHANNEL_ID,
      type: 'AB'
    }).catch((e) => e)
    console.log('=====获取AB面====', res)
    // 获取定位信息
    const locationInfo = await this.getLocalLocationInfo()
    if (res?.success && res.data) {
      runInAction(() => {
        const info = res.data as Common.VersionItem
        const blockedRegions = (info.blockedRegions || '').split(',').filter((v) => v)
        const isBlocked = blockedRegions.some((code) => (locationInfo?.area_code || '').indexOf(code) !== -1)
        // console.log('locationInfo?.area_code', locationInfo?.area_code)
        // 打开B面后需要判断地区是否被屏蔽
        if (info.abControl) {
          stores.global.showABType = isBlocked ? 'A' : 'B'
        } else {
          stores.global.showABType = 'A'
        }
      })
    } else {
      stores.global.showABType = 'A'
    }
  }

  featchLocation = async () => {
    const env = await getEnv()
    if (!env.locationApi) return
    const res = await fetch(env.locationApi).then((res) => res.json())
    const data = res?.data?.location || {}
    const info = {
      ...data,
      updateTime: Date.now()
    }
    await STORAGE_SET_LOCATION_INFO(info)
  }

  // 获取本地缓存的定位信息
  getLocalLocationInfo = async () => {
    const locationInfo = await STORAGE_GET_LOCATION_INFO()
    return locationInfo as Common.LocationInfo
  }

  // 初始化远程配置
  initRemoteConfig = async () => {
    const urlInfo: any = await STORAGE_GET_ENV() // 初始化local中缓存的配置
    const updateTime = urlInfo?.updateTime

    // 拉取配置：缓存时间大于10分钟、初次载入
    if ((updateTime && Date.now() - updateTime > 10 * 60 * 1000) || !updateTime) {
      // 拉取动态域名配置信息
      await fetchRemoteConfig()
    }
  }

  // 初始化定位信息
  initLocationInfo = async () => {
    const locationInfo = await this.getLocalLocationInfo()
    const updateTime = locationInfo?.updateTime
    // 缓存时间大于10分钟、初次载入
    // if ((updateTime && Date.now() - updateTime > 10 * 60 * 1000) || !updateTime) {
    //   // 获取定位信息
    //   await this.featchLocation()
    // }
    // 需要实时获取定位信息，否则切换AB面不会立即生效
    await this.featchLocation()
  }

  onStartApp = async () => {
    await hydrateStores()
    // 设置语言 (20250122： 取消 await 异步等待过程)
    stores.global.setSystemLang()

    const token = await STORAGE_GET_TOKEN()

    // 初始化远程配置
    await this.initRemoteConfig()

    // 初始化安卓端隐私政策
    await this.initAndroidPrivacyModal()

    // 是否启用AB面功能
    if (Config.ENABLE_AB_FACE) {
      // 获取AB面
      await this.getAB()
    }

    this.showABType !== 'A' && this.initServiceInfo()

    // 获取该应用支持的注册方式
    this.getRegisterWay()

    if (token && this.showABType !== 'A') {
      // 初始化交易
      await stores.trade.init()
      // 初始化之后立刻连接 websocket， checkSocketReady 会自动检查并连接
      stores.ws.checkSocketReady()
      // 加载用户信息
      stores.user.fetchUserInfo(true)
    }
    // 这里利用 Guide 页面判断是否需要跳转
    //  else {
    //   // 判断当前路由, 如果不是 Welcome 页面，跳转到 Welcome
    //   const routeName = useRoute().name

    //   if (routeName !== 'Welcome') {
    //     // 重定向到登录页
    //     replace('Welcome')
    //   }
    // }

    // 版本检查放在最后
    await checkVersion() // 初始化app（版本等信息）

    setTimeout(() => {
      // 检测版本是否更新
      stores.version.getAppVersion()
    }, 3000)
  }
}
