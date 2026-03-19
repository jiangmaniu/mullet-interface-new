import { get, keyBy } from 'lodash-es'
import type { Setter } from '../_helpers/createSetter'
import type { RootStoreState } from '../index'

import { getClientDetail } from '@/v1/services/crm/customer'

import { createSetter } from '../_helpers/createSetter'
import { ImmerStateCreator } from '../_helpers/types'
import { ClientInfo } from './info-slice-type'

export interface InfoSliceState {
  fetchClientInfoLoading: boolean
  clientInfo: ClientInfo | undefined
  accountList: User.AccountItem[]
  accountMap: Record<string, User.AccountItem>
  /** 当前激活的交易账户 ID */
  activeTradeAccountId: string | undefined
}

export interface InfoSliceActions {
  setInfo: (partial: Partial<InfoSliceState>) => void
  setActiveTradeAccountId: Setter<string | undefined>
  setClientInfo: Setter<ClientInfo | undefined>
  fetchClientInfo: (accountId?: string) => Promise<void>
  setAccountList: (accountList: User.AccountItem[]) => void
  updateAccount: (account: User.AccountItem) => void
}

/** info 命名空间（状态 + actions 扁平化） */
export type InfoSlice = InfoSliceState & InfoSliceActions

/**
 * 创建 info 命名空间切片（状态 + actions）
 * 访问路径: state.user.info.xxx
 */
export const createUserInfoSlice: ImmerStateCreator<RootStoreState, InfoSlice> = (setRoot, get) => {
  const infoSetter = createSetter<InfoSlice>(setRoot, (s) => s.user.info)

  return {
    fetchClientInfoLoading: false,
    clientInfo: undefined,
    accountList: [],
    accountMap: {},
    activeTradeAccountId: undefined,

    setInfo: (partial) =>
      setRoot((state) => {
        Object.assign(state.user.info, partial)
      }),

    setClientInfo: infoSetter('clientInfo'),

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
        const { accountList = [], ...clientInfo } = res.data ?? {}

        get().user.info.setAccountList(accountList)
        get().user.info.setClientInfo(clientInfo)
      } catch (error) {
        console.error('Failed to fetch client info:', error)
      } finally {
        setRoot((state) => {
          state.user.info.fetchClientInfoLoading = false
        })
      }
    },
    setActiveTradeAccountId: infoSetter('activeTradeAccountId'),
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
  (accountId?: string | number | null) =>
  (state: RootStoreState): User.AccountItem | undefined =>
    accountId != null ? state.user.info.accountMap[String(accountId)] : undefined

/** 生成式 selector - 根据 accountId 查找真实账户，依赖 createAccountInfoSelector（O(1)） */
export const createRealAccountInfoSelector =
  (accountId?: string | number | null) =>
  (state: RootStoreState): User.AccountItem | undefined => {
    const account = createAccountInfoSelector(accountId)(state)
    return account && !account.isSimulate ? account : undefined
  }

/** 生成式 selector - 根据 accountId 查找模拟账户，依赖 createAccountInfoSelector（O(1)） */
export const createSimulateAccountInfoSelector =
  (accountId?: string | number | null) =>
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
): { id: string; currencyDecimal: number | undefined; currencyUnit: string | undefined } => {
  const { id, currencyDecimal, currencyUnit } = userInfoActiveTradeAccountInfoSelector(state) ?? {}
  return { id, currencyDecimal, currencyUnit }
}
