import { mmkv } from '@/lib/storage/mmkv'
import { configurePersistable } from 'mobx-persist-store'

configurePersistable({
  debugMode: false, // __DEV__,
  storage: {
    setItem: async (key, value) => {
      mmkv.set(key, value)
      return Promise.resolve()
    },
    getItem: async (key) => {
      const value = mmkv.getString(key)
      return Promise.resolve(value ?? null)
    },
    removeItem: async (key) => {
      mmkv.remove(key)
      return Promise.resolve()
    }
  }
})
