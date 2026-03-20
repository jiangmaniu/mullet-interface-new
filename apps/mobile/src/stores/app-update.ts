import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { mmkvStorage } from '@/lib/storage/mmkv'

interface AppUpdateState {
  // 版本信息
  latestVersion: string | null
  updateContent: string | null
  downloadUrl: string | null
  isForceUpdate: boolean
  hasUpdate: boolean

  // 用户跳过的版本
  skippedVersion: string | null

  // Actions
  setUpdateInfo: (info: {
    latestVersion: string
    updateContent?: string | null
    downloadUrl?: string | null
    isForceUpdate: boolean
  }) => void
  clearUpdate: () => void
  skipVersion: (version: string) => void
}

const initialState = {
  latestVersion: null,
  updateContent: null,
  downloadUrl: null,
  isForceUpdate: false,
  hasUpdate: false,
  skippedVersion: null,
}

export const useAppUpdateStore = create<AppUpdateState>()(
  persist(
    (set) => ({
      ...initialState,

      setUpdateInfo: (info) =>
        set({
          hasUpdate: true,
          latestVersion: info.latestVersion,
          updateContent: info.updateContent ?? null,
          downloadUrl: info.downloadUrl ?? null,
          isForceUpdate: info.isForceUpdate,
        }),

      clearUpdate: () =>
        set({
          hasUpdate: false,
          latestVersion: null,
          updateContent: null,
          downloadUrl: null,
          isForceUpdate: false,
        }),

      skipVersion: (version) => set({ skippedVersion: version }),
    }),
    {
      name: 'app-update-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        skippedVersion: state.skippedVersion,
      }),
    },
  ),
)
