import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { mmkvStorage } from '@/lib/storage/mmkv'

interface UserInfoState {
  clientInfo: User.ClientInfo | null
  _hasHydrated: boolean

  setClientInfo: (clientInfo: User.ClientInfo) => void
  setHasHydrated: (v: boolean) => void
}

export const useUserInfoStore = create<UserInfoState>()(
  persist(
    (set) => ({
      clientInfo: null,
      activeTradeAccountId: undefined,
      _hasHydrated: false,

      setClientInfo: (clientInfo: User.ClientInfo) => set({ clientInfo }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'user-info-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        // accessToken: state.accessToken,
        // loginInfo: state.loginInfo,
        // redirectTo: state.redirectTo,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

// export const selectorActiveTradeAccount = (state: UserInfoState) => {
//   return state.clientInfo?.accountList?.find((account) => account.id === state.activeTradeAccountId)
// }
