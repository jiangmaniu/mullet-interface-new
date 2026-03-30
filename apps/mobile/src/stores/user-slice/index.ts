import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import type { AuthSlice } from './authSlice'
import type { InfoSlice } from './infoSlice'

import { createUserAuthSlice } from './authSlice'
import { createUserInfoSlice } from './infoSlice'

/** User 命名空间完整类型 */
export type UserSlice = {
  /** info 子命名空间 */
  info: InfoSlice
  /** auth 子命名空间 */
  auth: AuthSlice
}

export const createUserSlice: SliceCreator<RootStoreState, UserSlice> = (set, get, store) => ({
  info: createUserInfoSlice(set, get, store),
  auth: createUserAuthSlice(set, get, store),
})
