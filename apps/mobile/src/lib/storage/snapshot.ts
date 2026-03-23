import { mmkv } from './mmkv'
import { STORAGE_KEY_SNAPSHOT_QUOTE, STORAGE_KEY_SNAPSHOT_SYMBOL, STORAGE_KEY_ROOT_STORE } from './keys'

const SNAPSHOT_KEYS = {
  quote: STORAGE_KEY_SNAPSHOT_QUOTE,
  symbol: STORAGE_KEY_SNAPSHOT_SYMBOL,
} as const

type SnapshotKey = keyof typeof SNAPSHOT_KEYS

/** 写入快照（序列化为 JSON 字符串存入 MMKV） */
export function saveSnapshot<T>(key: SnapshotKey, data: T): void {
  try {
    mmkv.set(SNAPSHOT_KEYS[key], JSON.stringify(data))
  } catch {}
}

/** 读取快照，失败或不存在时返回 null */
export function loadSnapshot<T>(key: SnapshotKey): T | null {
  try {
    const raw = mmkv.getString(SNAPSHOT_KEYS[key])
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** 清除所有快照 */
export function clearAllSnapshots(): void {
  mmkv.remove(STORAGE_KEY_SNAPSHOT_QUOTE)
  mmkv.remove(STORAGE_KEY_SNAPSHOT_SYMBOL)
}

/**
 * 清除 persist store，但保留登录态（user.auth）
 * 用于"清除缓存"场景，不强制退出登录
 */
export function clearStoreKeepAuth(): void {
  try {
    const raw = mmkv.getString(STORAGE_KEY_ROOT_STORE)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const preserved = { state: { user: { auth: parsed?.state?.user?.auth } } }
    mmkv.set(STORAGE_KEY_ROOT_STORE, JSON.stringify(preserved))
  } catch {}
}
