import { DEFAULT_REGISTER_WAY } from '@/v1/constants'
import { stores } from '@/v1/provider/mobxProvider'
import serverConf from '@/v1/env/server'
// import MessageStore from '@/pages/webapp/pages/UserCenter/Message/MessageStore'
import { getRegisterWay, getRegisterWayByBusinessLine } from '@/v1/services/api/common'
import { getClientDetail } from '@/v1/services/api/crm/customer'
import { getMyMessageList } from '@/v1/services/api/message'
import {
  STORAGE_GET_REGISTER_CODE,
  STORAGE_GET_USER_INFO,
  STORAGE_SET_PLATFORM_CONFIG,
  STORAGE_SET_USER_INFO,
} from '@/v1/utils/storage'
// import { getIntl } from '@umijs/max'
// import { message } from 'antd'
import { action, makeAutoObservable, observable, reaction, runInAction } from 'mobx'
import PLATFORM_DEFAULT_CONFIG from '../../../public/config.json'
import { getLoginToken } from '@/atoms/user/login-info'
import { cleanLogoutCache } from '../compatible/utils/logout'

export type TabbarActiveKey = '/app/quote' | '/app/trade' | '/app/position' | '/app/user-center'

export type DeviceType = 'PC' | 'MOBILE'

export type IPlatformConfig = Partial<typeof PLATFORM_DEFAULT_CONFIG> & {
  // 客户端ID
  CLIENT_ID: string
  // 秘钥
  CLIENT_SECRET: string
}

export class GlobalStore {
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
              clearTimeout(this.verifyCodeDownTimer as NodeJS.Timeout)
              this.verifyCodeDownTimer = null
            }
          }
        } else {
          if (this.verifyCodeDownTimer) {
            clearTimeout(this.verifyCodeDownTimer as NodeJS.Timeout)
            this.verifyCodeDownTimer = null
          }
        }
      },
    )
  }
  @observable registerWay: API.RegisterWay = DEFAULT_REGISTER_WAY // 注册方式: EMAIL | PHONE
  @observable messageList = [] as Message.MessageItem[] // 消息列表
  @observable messageCurrent = 1 // 消息列表页码
  @observable messageTotalCount = 1 // 总页码
  @observable tabBarActiveKey: TabbarActiveKey = '/app/quote'
  @observable lastDeviceType: DeviceType = 'PC' // 设置最后一次切换pc、mobile端设备类型
  @observable lastPcJumpPathname = '' // 记录最后一次PC端跳转的路径-方便响应式变化恢复到之前的地址
  @observable lastMobileJumpPathname = '' // 记录最后一次Mobile端跳转的路径-方便响应式变化恢复到之前的地址
  @observable pageIsFocused = true // 页面是否处于激活状态，进入页面默认是true，离开页面变为false
  @observable sheetModalOpen = true // 记录SheetModal是否打开
  @observable verifyCodeDown = -1 // 验证码倒计时
  @observable verifyCodeDownTimer = null as NodeJS.Timeout | null // 验证码倒计时定时器
  @observable env = {} as IPlatformConfig // 平台配置
  @observable currentUser = {} as User.UserInfo // 当前用户信息
  @observable lastUpdateTime = 0 // 最后一次更新时间(时间戳)

  setLastUpdateTime = (lastUpdateTime: number) => {
    this.lastUpdateTime = lastUpdateTime
  }

  // 获取平台配置
  getPlatformConfig = async (onError: () => void) => {
    try {
      const res = await fetch(`/config.json?t=${Date.now()}`)

      if (!res.ok) {
        onError()
        return
      }

      const config = await res.json()

      // 缓存配置到本地
      STORAGE_SET_PLATFORM_CONFIG(config)

      this.setPlatformConfig(config)

      return config
    } catch (error) {
      onError()
      return
    }
  }

  // 设置平台配置
  setPlatformConfig = (conf: any) => {
    runInAction(() => {
      this.env = {
        ...serverConf,
        ...conf,
      }
    })
  }

  @action
  countDownVerifyCode = async (down: number) => {
    this.verifyCodeDown = down - 1
  }

  // 设置页面是否处于激活状态
  @action
  setPageIsFocused = (isFocused: boolean) => {
    this.pageIsFocused = isFocused
  }

  @action
  setSheetModalOpen = (open: boolean) => {
    this.sheetModalOpen = open
  }

  // 设置H5底部tabbar激活项
  @action
  setTabBarActiveKey = (tabBarActiveKey: TabbarActiveKey) => {
    this.tabBarActiveKey = tabBarActiveKey
  }

  // 设置最后一次PC端跳转的路径
  @action
  setLastPcJumpPathname = (pathname: string) => {
    this.lastPcJumpPathname = pathname
  }

  // 设置最后一次Mobile端跳转的路径
  @action
  setLastMobileJumpPathname = (pathname: string) => {
    this.lastMobileJumpPathname = pathname
  }

  // 设置最后一次切换pc、mobile端设备类型
  @action
  setLastDeviceType = (lastDeviceType: DeviceType) => {
    this.lastDeviceType = lastDeviceType
  }

  @action
  fetchUserInfo = async (refreshAccount?: boolean) => {
    if (!getLoginToken()) {
      return undefined
    }

    try {
      // 查询客户信息
      const clientInfo = await getClientDetail({
        id: STORAGE_GET_USER_INFO('user_id'),
      })
      const localUserInfo = STORAGE_GET_USER_INFO() || {}

      const currentUser = {
        ...localUserInfo,
        ...clientInfo, // 用户详细信息
      } as User.UserInfo

      // 更新本地的用户信息
      STORAGE_SET_USER_INFO(currentUser)

      // 记录最后一次更新时间
      this.setLastUpdateTime(Date.now().valueOf())

      // // 刷新账户信息
      // if (refreshAccount !== false) {
      //   // 初始化交易配置，在登录后才执行
      //   // console.log('fetchUserInfo init')
      //   // setCurrentAccountInfo 中会执行init
      //   await stores.trade.init()

      //   // 初始化设置默认当前账号信息
      //   const localAccountId = stores.trade.currentAccountInfo?.id
      //   const hasAccount = (currentUser?.accountList || []).some((item) => item.id === localAccountId)
      //   // 本地不存在账号或本地存在账号但不在登录返回的accountList中，需重新设置默认值，避免切换不同账号登录使用上一次缓存

      //   if (!localAccountId || (localAccountId && !hasAccount)) {
      //     await stores.trade.setCurrentAccountInfo(clientInfo.accountList?.[0] as User.AccountItem)
      //   } else if (localAccountId) {
      //     // 更新本地本地存在的账号信息，确保证数据是最新的
      //     await stores.trade.setCurrentAccountInfo(
      //       // @ts-ignore
      //       clientInfo.accountList?.find((item) => item.id === localAccountId) as User.AccountItem,
      //     )
      //   } else {
      //     stores.trade.getSymbolList()

      //     // setCurrentAccountInfo 中会执行init
      //     // await stores.trade.init()
      //   }
      // }

      this.currentUser = currentUser

      return currentUser
    } catch (error) {
      cleanLogoutCache()
    }
  }

  // 获取该应用支持的注册方式，目前只支持一种，不支持同时切换手机、邮箱注册
  getRegisterWay = async () => {
    const code = STORAGE_GET_REGISTER_CODE()
    // 如果地址上存在注册码
    if (code) {
      // 根据业务线来获取注册方式
      const res = await getRegisterWayByBusinessLine(code)
      if (res.success) {
        const registerWay = res.data?.registerWay as API.RegisterWay
        this.registerWay = registerWay

        // 如果存在不进行下一步查询全局的注册方式
        if (registerWay) return
      }
    }
    const res = await getRegisterWay()
    runInAction(() => {
      if (res.data) {
        this.registerWay = res.data as API.RegisterWay
      }
    })
  }

  // 获取消息列表
  @action
  getMessageList = async (isRefresh = false, type?: 'GROUP' | 'SINGLE') => {
    const hasMore = !isRefresh && this.messageCurrent <= this.messageTotalCount
    if (hasMore) {
      this.messageCurrent += 1
    } else {
      this.messageCurrent = 1
    }
    const res = await getMyMessageList({ size: 10, current: this.messageCurrent, type: type || 'SINGLE' })
    const list = (res.data?.records || []) as Message.MessageItem[]

    runInAction(() => {
      this.messageTotalCount = Number(res?.data?.pages)
      if (hasMore) {
        this.messageList = this.messageList.concat(list)
      } else {
        this.messageList = list
      }
    })
  }

  // ========== 全局页面初始化执行 ================

  init = async () => {
    this.getPlatformConfig(() => {
      // message.info(getIntl().formatMessage({ id: 'common.huanjinpeizhiyichang' }))
    })

    this.getRegisterWay()

    if (getLoginToken()) {
      // MessageStore.getUnreadMessageCount()

      this.getMessageList()
    }
  }
}

export const globalMobxStore = new GlobalStore()

export default globalMobxStore
