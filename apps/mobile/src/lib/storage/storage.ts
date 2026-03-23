import { mmkv } from './mmkv'

/**
 * 从 MMKV 读取 JSON 数据
 * @returns 反序列化后的值，不存在或解析失败时返回 null
 */
export function storageGet<T>(key: string): T | null {
  try {
    const raw = mmkv.getString(key)
    if (raw === undefined) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * 将数据序列化为 JSON 写入 MMKV
 */
export function storageSet(key: string, value: unknown): void {
  try {
    mmkv.set(key, JSON.stringify(value))
  } catch {}
}

/**
 * 删除 MMKV 中指定 key
 */
export function storageRemove(key: string): void {
  try {
    mmkv.remove(key)
  } catch {}
}
