import { create, type StateCreator } from 'zustand'

import {
  loginWithPrivyToken,
  apiLogout,
  checkAuthStatus,
  tokenStorage,
  type UserInfo,
} from '@/lib/api'

interface LoginAuthState {
  // 状态
  accessToken?: string
  loginInfo: User.LoginResult | null

  logout: () => void
}

const loginAuthStoreCreator: StateCreator<LoginAuthState> = (set, get) => {
  return {
    // 初始状态
    accessToken: undefined,
    loginInfo: null,

    logout: () => {
      set({
        accessToken: undefined,
        loginInfo: null,
      })
    }
  }
}

export const useLoginAuthStore = create<LoginAuthState>(loginAuthStoreCreator)
