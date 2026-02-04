import { action, configure, makeObservable, observable, runInAction } from 'mobx'

import { stores } from '@/v1/provider/mobxProvider'
import { getClientDetail } from '@/v1/services/crm/customer'
import { onLogout, replace } from '@/v1/utils/navigation'
import { setLocalUserInfo, STORAGE_GET_CONF_INFO, STORAGE_GET_USER_INFO, STORAGE_SET_USER_INFO } from '@/v1/utils/storage'

// 禁用 MobX 严格模式
configure({ enforceActions: 'never' })

class UserStore {
  constructor() {
    makeObservable(this) // 使用 makeObservable mobx6.0 才会更新视图

    // app 启动时，初始化
    // this.initUserInfo()
  }
  @observable currentUser = {} as User.UserInfo // 当前登录用户信息
  @observable lastUpdateTime = 0 // 最后一次更新时间(时间戳)

  // @action
  // async initUserInfo() {
  //   this.currentUser = (await STORAGE_GET_USER_INFO()) || ({} as User.UserInfo)
  // }

  // 获取用户信息
  @action
  fetchUserInfo = async (isRefreshAccount?: boolean) => {
    try {
      const id = await STORAGE_GET_USER_INFO('user_id')
      // 查询客户信息
      const clientInfo = await getClientDetail({
        id
      })

      const localUserInfo = (await STORAGE_GET_USER_INFO()) || {}

      const currentUser = {
        ...localUserInfo,
        ...clientInfo // 用户详细信息
      } as User.UserInfo

      // 更新本地的用户信息
      await STORAGE_SET_USER_INFO(currentUser)

      runInAction(() => {
        this.currentUser = currentUser
      })

      // 刷新账户信息
      if (isRefreshAccount) {
        this.refreshAccount()
      }

      // 记录最后一次更新时间
      this.lastUpdateTime = Date.now().valueOf()

      return currentUser
    } catch (error) {
      onLogout()
    }
    return undefined
  }

  // 登录成功回调
  @action
  handleLoginSuccess = async (result: User.UserInfo) => {
    // 缓存用户信息
    setLocalUserInfo(result)

    // 重新获取用户信息
    this.fetchUserInfo(true).then((res) => {
      const accountList = res?.accountList?.filter((item) => !item.isSimulate)
      if (accountList && accountList.length >= 1) {
        // 关闭其他页面，跳转主页面
        replace('Main')
        // replace('AccountSelect', {
        //   back: false
        // })
      } else {
        replace('AccountNew', {
          back: false
        })
      }
    })
  }

  // 刷新账户信息
  @action
  refreshAccount = async () => {
    const currentUser = this.currentUser

    // 初始化交易配置，在登录后或app启动时执行
    await stores.trade.init()

    // 初始化设置默认当前账号信息
    const localAccountId = stores.trade.currentAccountInfo?.id || (await STORAGE_GET_CONF_INFO(`currentAccountInfo`))?.id
    // const hasAccount = (currentUser?.accountList || []).filter((v) => !v.isSimulate).some((item) => item.id === localAccountId)
    const hasAccount = (currentUser?.accountList || []).some((item) => item.id === localAccountId)
    // 本地不存在账号或本地存在账号但不在登录返回的accountList中，需重新设置默认值，避免切换不同账号登录使用上一次缓存
    if (!localAccountId || (localAccountId && !hasAccount)) {
      // 20241021：这里不主动选择账号，由用户选择
      // 20240227 自动选择第一个真实的账号
      stores.trade.setCurrentAccountInfo(currentUser.accountList?.[0] as User.AccountItem)
    } else if (localAccountId) {
      // 更新本地存在的账号信息，确保证数据是最新的
      stores.trade.setCurrentAccountInfo(currentUser.accountList?.find((item) => item.id === localAccountId) as User.AccountItem)
    } else {
      stores.trade.getSymbolList()
    }
  }
}

const user = new UserStore()

export default user
