/**
 * MMKV 持久化缓存 key 统一定义（新架构）
 *
 * 命名规范：MULLET:{命名空间}:{具体含义}
 * v1 业务 key 继续沿用 v1/constants/storage.ts，不在此处定义
 */

const PREFIX = 'MULLET'

// ─── Zustand / Snapshot（新架构） ───────────────────────────────────────────

/** Zustand persist 根 store */
export const STORAGE_KEY_ROOT_STORE = `${PREFIX}:STORE:ROOT`

/** 行情快照（ws 断开 / App 后台时存入，启动时读取） */
export const STORAGE_KEY_SNAPSHOT_QUOTE = `${PREFIX}:SNAPSHOT:QUOTE`

/** 品种列表快照（拉取成功后存入，启动时读取） */
export const STORAGE_KEY_SNAPSHOT_SYMBOL = `${PREFIX}:SNAPSHOT:SYMBOL`

/** 所有快照 key 列表，用于批量清除 */
export const STORAGE_SNAPSHOT_KEYS = [
  STORAGE_KEY_SNAPSHOT_QUOTE,
  STORAGE_KEY_SNAPSHOT_SYMBOL,
] as const

/** 所有 MMKV 持久化 key 列表，用于完整清除（不含用户登录态） */
export const STORAGE_CLEARABLE_KEYS = [
  STORAGE_KEY_ROOT_STORE,
  ...STORAGE_SNAPSHOT_KEYS,
] as const
