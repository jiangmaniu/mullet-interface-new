import { keyBy } from 'lodash-es'
import type { Setter } from '../_helpers/createSetter'
import type { RootStoreState } from '../index'

import { getClientDetail } from '@/v1/services/crm/customer'

import { createSetter } from '../_helpers/createSetter'
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
}

/** info 命名空间（状态 + actions 扁平化） */
export type InfoSlice = InfoSliceState & InfoSliceActions

/**
 * 创建 info 命名空间切片（状态 + actions）
 * 访问路径: state.user.info.xxx
 */
export function createUserInfoSlice(
  setRoot: (fn: (state: RootStoreState) => void) => void,
  get: () => RootStoreState,
): InfoSlice {
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
        const accountMap = keyBy(accountList, 'id')

        setRoot((state) => {
          state.user.info.clientInfo = clientInfo
          state.user.info.accountList = accountList
          state.user.info.accountMap = accountMap
        })

        const activeTradeAccountId = userInfoActiveTradeAccountIdSelector(get())
        if (!activeTradeAccountId || !accountMap[activeTradeAccountId]) {
          userInfoSelector(get()).setActiveTradeAccountId(accountList?.[0]?.id)
        }
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
