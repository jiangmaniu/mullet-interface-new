import type { Persister, PersistedClient } from '@tanstack/query-persist-client-core'
import { createMMKV } from 'react-native-mmkv'

const KLINE_CACHE_KEY = 'REACT_QUERY_KLINE_CACHE'

// 专用于 K线缓存的 MMKV 实例
const klineMMKV = createMMKV({ id: 'kline-cache' })

// 直接实现 Persister 接口，避免使用已弃用的 createSyncStoragePersister
export const klinePersister: Persister = {
  persistClient: (client: PersistedClient) => {
    klineMMKV.set(KLINE_CACHE_KEY, JSON.stringify(client))
  },
  restoreClient: () => {
    const data = klineMMKV.getString(KLINE_CACHE_KEY)
    if (!data) return undefined
    return JSON.parse(data) as PersistedClient
  },
  removeClient: () => {
    klineMMKV.remove(KLINE_CACHE_KEY)
  },
}
