import { keyBy } from 'lodash-es'
import type { Setter } from '../_helpers/createSetter'
import type { RootStoreState } from '../index'

import { calcAccountOccupiedMargin } from '@/helpers/calc/account'
import MulletWS from '@/lib/ws/mullet-ws'
import { getClientDetail } from '@/v1/services/crm/customer'

import { createSetter } from '../_helpers/createSetter'
import { selectorMemoize } from '../_helpers/memo'
import { ImmerStateCreator } from '../_helpers/types'
import { ClientInfo, UserInfo } from './info-slice-type'

export type UserAccountInfo = User.AccountItem

export interface InfoSliceState {
  fetchClientInfoLoading: boolean
  clientInfo: ClientInfo | undefined
  userInfo: UserInfo | undefined
  accountList: User.AccountItem[]
  accountMap: Record<string, User.AccountItem>
  /** 当前激活的交易账户 ID */
  activeTradeAccountId: string | undefined
}

export interface InfoSliceActions {
  setInfo: (partial: Partial<InfoSliceState>) => void
  setActiveTradeAccountId: (accountId?: string) => Promise<void>
  setClientInfo: Setter<ClientInfo | undefined>
  setUserInfo: Setter<UserInfo | undefined>
  fetchClientInfo: (accountId?: string) => Promise<void>
  fetchLoginClientInfo: () => Promise<void>
  setAccountList: (accountList: User.AccountItem[]) => void
  updateAccount: (account: User.AccountItem) => void
}

/** info 命名空间（状态 + actions 扁平化） */
export type InfoSlice = InfoSliceState & InfoSliceActions

/**
 * 创建 info 命名空间切片（状态 + actions）
 * 访问路径: state.user.info.xxx
 */
export const createUserInfoSlice: ImmerStateCreator<RootStoreState, InfoSlice> = (setRoot, get, store) => {
  const infoSetter = createSetter<InfoSlice>(setRoot, (s) => s.user.info)

  return {
    fetchClientInfoLoading: false,
    clientInfo: undefined,
    userInfo: undefined,
    accountList: [],
    accountMap: {},
    activeTradeAccountId: undefined,

    setInfo: (partial) =>
      setRoot((state) => {
        Object.assign(state.user.info, partial)
      }),

    setClientInfo: infoSetter('clientInfo'),
    setUserInfo: infoSetter('userInfo'),

    updateAccount: (account: User.AccountItem) => {
      const oldAccountList = get().user.info.accountList
      const oldAccountMap = keyBy(oldAccountList, 'id')
      const oldAccount = oldAccountMap[account.id]

      const newAccount = {
        ...oldAccount,
        ...account,
      }

      const newAccountList = oldAccountList.map((item) => (item.id === account.id ? newAccount : item))
      const newAccountMap = keyBy(newAccountList, 'id')

      setRoot((state) => {
        state.user.info.accountMap = newAccountMap
        state.user.info.accountList = newAccountList
      })

      const activeTradeAccountId = userInfoActiveTradeAccountIdSelector(get())
      if (!activeTradeAccountId || !newAccountMap[activeTradeAccountId]) {
        userInfoSelector(get()).setActiveTradeAccountId(newAccountList?.[0]?.id)
      }
    },

    setAccountList: (accountList: User.AccountItem[]) => {
      const accountMap = keyBy(accountList, 'id')

      setRoot((state) => {
        state.user.info.accountList = accountList
        state.user.info.accountMap = accountMap
      })

      const activeTradeAccountId = userInfoActiveTradeAccountIdSelector(get())
      if (!activeTradeAccountId || !accountMap[activeTradeAccountId]) {
        userInfoSelector(get()).setActiveTradeAccountId(accountList?.[0]?.id)
      }
    },

    fetchLoginClientInfo: async () => {
      const id = get().user.auth.loginInfo?.user_id
      return get().user.info.fetchClientInfo(id)
    },

    fetchClientInfo: async (userId?: string) => {
      // 如果 symbolInfoList 为空，显示 loading
      if (!get().user.info.clientInfo) {
        setRoot((state) => {
          state.user.info.fetchClientInfoLoading = true
        })
      }

      try {
        const res = await getClientDetail({ id: userId })

        if (!res?.success) {
          return
        }
        const { accountList = [], userInfo, ...clientInfo } = res.data ?? {}

        get().user.info.setAccountList(accountList)
        get().user.info.setClientInfo(clientInfo)
        get().user.info.setUserInfo(userInfo)
      } catch (error) {
        console.error('Failed to fetch client info:', error)
      } finally {
        setRoot((state) => {
          state.user.info.fetchClientInfoLoading = false
        })
      }
    },
    setActiveTradeAccountId: async (accountId?: string) => {
      if (accountId === get().user.info.activeTradeAccountId) {
        return
      }

      // 切换账户时立即清空仓位和挂单，避免旧数据在新账户数据到来前引起渲染异常
      get().trade.position.reset()
      get().trade.order.reset()

      // 切换账户后重新订阅 WS 持仓/消息/通知
      MulletWS.getInstance().onAccountSwitch()

      // // 订阅新的账户
      if (accountId) {
        await get().market.symbol.fetchInfoList(accountId)
        await Promise.all([get().trade.position.fetch(accountId), get().trade.order.fetch(accountId)])
      }

      setRoot((state) => {
        state.user.info.activeTradeAccountId = accountId
      })
    },
  }
}

// ============ Selectors ============

export const userInfoSelector = (state: RootStoreState) => state.user.info
export const userInfoClientInfoSelector = (state: RootStoreState) => state.user.info.clientInfo
export const userInfoAccountListSelector = (state: RootStoreState) => state.user.info.accountList
export const userInfoAccountMapSelector = (state: RootStoreState) => state.user.info.accountMap
export const userInfoActiveTradeAccountIdSelector = (state: RootStoreState) => state.user.info.activeTradeAccountId
export const userInfoRealAccountListSelector = (state: RootStoreState) =>
  state.user.info.accountList.filter((item) => !item.isSimulate)
export const userInfoSimulateAccountListSelector = (state: RootStoreState) =>
  state.user.info.accountList.filter((item) => item.isSimulate)

/** 生成式 selector - 根据 accountId 查找对应的账户信息（O(1)） */
export const createAccountInfoSelector =
  (accountId?: string | number) =>
  (state: RootStoreState): User.AccountItem | undefined =>
    !!accountId ? state.user.info.accountMap[String(accountId)] : undefined

export type AccountMarginInfo = {
  occupiedMargin?: string
} & Pick<User.AccountItem, 'margin' | 'isolatedMargin'>

/** 生成式 selector - 根据 accountId 查找对应的账户保证金信息（O(1)） */
export const createAccountMarginInfoSelector =
  (accountId?: string | number) =>
  (state: RootStoreState): AccountMarginInfo | undefined => {
    const account = createAccountInfoSelector(accountId)(state)
    if (!account) return

    // 解构原始值，避免返回 Immer draft 对象导致 Proxy 报错
    const margin = account.margin
    const isolatedMargin = account.isolatedMargin
    const occupiedMargin = calcAccountOccupiedMargin({ margin, isolatedMargin })
    return { occupiedMargin, isolatedMargin, margin }
  }
/** 生成式 selector - 根据 accountId 查找真实账户，依赖 createAccountInfoSelector（O(1)） */
export const createRealAccountInfoSelector =
  (accountId?: string | number) =>
  (state: RootStoreState): User.AccountItem | undefined => {
    const account = createAccountInfoSelector(accountId)(state)
    return account && !account.isSimulate ? account : undefined
  }

/** 生成式 selector - 根据 accountId 查找模拟账户，依赖 createAccountInfoSelector（O(1)） */
export const createSimulateAccountInfoSelector =
  (accountId?: string | number) =>
  (state: RootStoreState): User.AccountItem | undefined => {
    const account = createAccountInfoSelector(accountId)(state)
    return account && account.isSimulate ? account : undefined
  }

/** 当前激活交易账户的账户信息 */
export const userInfoActiveTradeAccountInfoSelector = (state: RootStoreState): User.AccountItem | undefined => {
  const { activeTradeAccountId, accountMap } = state.user.info
  return activeTradeAccountId ? accountMap[activeTradeAccountId] : undefined
}

/** 当前激活交易账户的货币信息（id + currencyDecimal + currencyUnit） */
export const userInfoActiveTradeAccountCurrencyInfoSelector = (
  state: RootStoreState,
): { id: string | undefined; currencyDecimal: number | undefined; currencyUnit: string | undefined } => {
  const { id, currencyDecimal, currencyUnit } = userInfoActiveTradeAccountInfoSelector(state) ?? {}
  return { id, currencyDecimal, currencyUnit }
}
