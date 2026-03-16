import type { RootStoreState } from '../index'

export interface InfoSliceState {
  clientInfo: User.ClientInfo | null
}

export interface InfoSliceActions {
  setInfo: (partial: Partial<InfoSliceState>) => void
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
  return {
    clientInfo: null,

    setInfo: (partial) =>
      setRoot((state) => {
        Object.assign(state.user.info, partial)
      }),
  }
}

// ============ Selectors ============

export const userInfoSelector = (state: RootStoreState) => state.user.info
export const userInfoClientInfoSelector = (state: RootStoreState) => state.user.info.clientInfo
