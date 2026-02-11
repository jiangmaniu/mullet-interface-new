import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { mmkvStorage } from '@/lib/storage/mmkv'

interface LoginAuthState {
  // 状态
  accessToken?: string
  loginInfo: User.LoginResult | null
  _hasHydrated: boolean
  redirectTo?: string

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
      _hasHydrated: false,
      redirectTo: undefined,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setRedirectTo: (v) => set({ redirectTo: v }),
      logout: () => set({ accessToken: undefined, loginInfo: null }),
    }),
    {
      name: 'login-auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        loginInfo: state.loginInfo,
        redirectTo: state.redirectTo,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
