import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { mmkvStorage } from '@/lib/storage/mmkv'

export type LoginType = 'web2' | 'web3'

interface LoginAuthState {
  accessToken?: string
  loginInfo: User.LoginResult | null
  /** 邮箱登录(web2) / 钱包登录(web3) */
  loginType: LoginType | null
  _hasHydrated: boolean
  redirectTo?: string

  setLoginInfo: (loginInfo: User.LoginResult) => void
  setLoginType: (type: LoginType | null) => void
  setHasHydrated: (v: boolean) => void
  logout: () => void
  setRedirectTo: (path?: string) => void
}

export const useLoginAuthStore = create<LoginAuthState>()(
  persist(
    (set) => ({
      // 初始状态
      accessToken: undefined,
      loginInfo: null,
      loginType: null,
      _hasHydrated: false,
      redirectTo: undefined,

      setLoginInfo: (loginInfo: User.LoginResult) => set({ loginInfo }),
      setLoginType: (loginType: LoginType | null) => set({ loginType }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setRedirectTo: (v) => set({ redirectTo: v }),
      logout: () => set({ accessToken: undefined, loginInfo: null, loginType: null }),
    }),
    {
      name: 'login-auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        loginInfo: state.loginInfo,
        loginType: state.loginType,
        redirectTo: state.redirectTo,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
