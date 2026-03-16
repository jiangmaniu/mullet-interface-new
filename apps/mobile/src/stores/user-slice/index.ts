import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import { createUserAuthSlice, type AuthSlice } from './authSlice'
import { createUserInfoSlice, type InfoSlice } from './infoSlice'

// 导出 selectors 和类型
export * from './authSlice'
export * from './infoSlice'

/** User 命名空间完整类型 */
export type UserSlice = {
  /** info 子命名空间 */
  info: InfoSlice
  /** auth 子命名空间 */
  auth: AuthSlice
}

export const createUserSlice: ImmerStateCreator<RootStoreState, UserSlice> = (set) => ({
  info: createUserInfoSlice(set),
  auth: createUserAuthSlice(set),
})
