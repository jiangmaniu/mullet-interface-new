import { storageGet, storageSet, storageRemove } from './storage'
import { STORAGE_KEY_SNAPSHOT_QUOTE, STORAGE_KEY_SNAPSHOT_SYMBOL, STORAGE_KEY_ROOT_STORE } from './keys'

const SNAPSHOT_KEYS = {
  quote: STORAGE_KEY_SNAPSHOT_QUOTE,
  symbol: STORAGE_KEY_SNAPSHOT_SYMBOL,
} as const

type SnapshotKey = keyof typeof SNAPSHOT_KEYS

/** 写入快照 */
export function saveSnapshot<T>(key: SnapshotKey, data: T): void {
  storageSet(SNAPSHOT_KEYS[key], data)
}

/** 读取快照，失败或不存在时返回 null */
export function loadSnapshot<T>(key: SnapshotKey): T | null {
  return storageGet<T>(SNAPSHOT_KEYS[key])
}

/** 清除所有快照 */
export function clearAllSnapshots(): void {
  storageRemove(STORAGE_KEY_SNAPSHOT_QUOTE)
  storageRemove(STORAGE_KEY_SNAPSHOT_SYMBOL)
}

/**
 * 清除 persist store，但保留登录态（user.auth）
 * 用于"清除缓存"场景，不强制退出登录
 */
export function clearStoreKeepAuth(): void {
  const parsed = storageGet<any>(STORAGE_KEY_ROOT_STORE)
  if (!parsed) return
  storageSet(STORAGE_KEY_ROOT_STORE, { state: { user: { auth: parsed?.state?.user?.auth } } })
}
