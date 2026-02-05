import { action, makeAutoObservable, observable, reaction } from 'mobx'
import { hydrateStore } from 'mobx-persist-store'

import {
  STORAGE_GET_ENV,
  STORAGE_GET_TOKEN,
  STORAGE_GET_TRADER_SERVER,
} from '@/v1/utils/storage'

import { hydrateStores, stores } from '../provider/mobxProvider'
import type { IStore, PVoid } from './types'
import { fetchRemoteConfig } from '@/v1/env'

type StoreDefaultKeys = 'set' | 'upload' | 'hydrate'

export type StoreKeysOf<S> = keyof Omit<S, StoreDefaultKeys>

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

  @observable hasPopBanner = false // 首页是否弹窗
  @observable currentServiceProvider = {} as User.ServiceProviderListItem // 当前登录所选的服务商信息
  @observable verifyCodeDown = -1 // 验证码倒计时
  @observable verifyCodeDownTimer: any = null
  // @observable keyboardDidShowListener: any = null
  // @observable keyboardDidHideListener: any = null
  @observable scrollRef: any = null
  @observable scrollRefY = 0
  @observable scrolling = false
  countryList: Common.AreaCodeItem[] = []

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
  initServiceInfo = async () => {
    this.currentServiceProvider = (await STORAGE_GET_TRADER_SERVER()) || {}
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

  onStartApp = async () => {
    await hydrateStores()

    const token = await STORAGE_GET_TOKEN()

    // 初始化远程配置
    await this.initRemoteConfig()

    if (token) {
      // 初始化交易
      await stores.trade.init()
      // 初始化之后立刻连接 websocket， checkSocketReady 会自动检查并连接
      stores.ws.checkSocketReady()
      // 加载用户信息
      stores.user.fetchUserInfo(true)
    }
  }
}
