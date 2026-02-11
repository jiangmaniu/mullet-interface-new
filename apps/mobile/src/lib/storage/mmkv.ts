import { createMMKV } from 'react-native-mmkv'
import { type StateStorage } from 'zustand/middleware'

export const mmkv = createMMKV({ id: 'default' })

/**
 * zustand persist 适配器
 * 用于替代 createJSONStorage(() => AsyncStorage)
 */
export const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name)
    return value ?? null
  },
  setItem: (name, value) => {
    mmkv.set(name, value)
  },
  removeItem: (name) => {
    mmkv.remove(name)
  },
}
