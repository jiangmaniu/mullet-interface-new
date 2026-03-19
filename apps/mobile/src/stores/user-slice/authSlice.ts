import type { RootStoreState } from '../index'

import { ImmerStateCreator } from '../_helpers/types'

export enum LoginType {
  Web2 = 'web2',
  Web3 = 'web3',
}

export interface AuthSliceState {
  accessToken?: string
  loginInfo: User.LoginResult | null
  /** 邮箱登录(web2) / 钱包登录(web3) */
  loginType: LoginType | null
  redirectTo?: string
}

export interface AuthSliceActions {
  setAuth: (partial: Partial<AuthSliceState>) => void
  logout: () => void
}

/** auth 命名空间（状态 + actions 扁平化） */
export type AuthSlice = AuthSliceState & AuthSliceActions

/**
 * 创建 auth 命名空间切片（状态 + actions）
 * 访问路径: state.user.auth.xxx
 */
export const createUserAuthSlice: ImmerStateCreator<RootStoreState, AuthSlice> = (setRoot, get) => {
  return {
    accessToken: undefined,
    loginInfo: null,
    loginType: null,
    redirectTo: undefined,

    setAuth: (partial) =>
      setRoot((state) => {
        Object.assign(state.user.auth, partial)
      }),

    logout: () =>
      setRoot((state) => {
        state.user.auth.accessToken = undefined
        state.user.auth.loginInfo = null
        state.user.auth.loginType = null
      }),
  }
}

// ============ Selectors ============

export const userAuthSelector = (state: RootStoreState) => state.user.auth
export const userAuthAccessTokenSelector = (state: RootStoreState) => state.user.auth.accessToken
export const userAuthLoginInfoSelector = (state: RootStoreState) => state.user.auth.loginInfo
export const userAuthLoginTypeSelector = (state: RootStoreState) => state.user.auth.loginType
export const userAuthRedirectToSelector = (state: RootStoreState) => state.user.auth.redirectTo
