import type { RootStoreState } from '../index'
import { createSetter, type Setter } from '../_helpers/createSetter'

export interface InfoSliceState {
  clientInfo: User.ClientInfo | null
  /** 当前激活的交易账户 ID */
  activeTradeAccountId: string | null
}

export interface InfoSliceActions {
  setInfo: (partial: Partial<InfoSliceState>) => void
  setActiveTradeAccountId: Setter<string | null>
}

/** info 命名空间（状态 + actions 扁平化） */
export type InfoSlice = InfoSliceState & InfoSliceActions

/**
 * 创建 info 命名空间切片（状态 + actions）
 * 访问路径: state.user.info.xxx
 */
export function createUserInfoSlice(
  setRoot: (fn: (state: any) => void) => void,
): InfoSlice {
  const infoSetter = createSetter<InfoSlice>(setRoot, (s) => s.user.info)

  return {
    clientInfo: null,
    activeTradeAccountId: null,

    setInfo: (partial) =>
      setRoot((state) => {
        Object.assign(state.user.info, partial)
      }),

    setActiveTradeAccountId: infoSetter('activeTradeAccountId'),
  }
}

// ============ Selectors ============

export const userInfoSelector = (state: RootStoreState) => state.user.info
export const userInfoClientInfoSelector = (state: RootStoreState) => state.user.info.clientInfo
export const userInfoActiveTradeAccountIdSelector = (state: RootStoreState) =>
  state.user.info.activeTradeAccountId
