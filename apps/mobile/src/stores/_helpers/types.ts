import type { StateCreator, StoreApi } from 'zustand'

/**
 * 中间件下的 StateCreator 类型
 * 中间件嵌套顺序: subscribeWithSelector → persist → immer
 * TState: 完整 store 状态类型
 * TSlice: 当前切片返回的状态类型
 */
export type ImmerStateCreator<TState, TSlice = TState> = StateCreator<
  TState,
  [['zustand/subscribeWithSelector', never], ['zustand/persist', unknown], ['zustand/immer', never]],
  [],
  TSlice
>

/**
 * 所有 slice 可选实现的基础接口
 * store 初始化完成后会自动调用 initSubscribe（如果存在）
 */
export interface BaseSlice {
  initSubscribe?: () => void
}

/**
 * 子 slice 工厂函数的通用参数类型
 * 避免直接使用 ImmerStateCreator 导致类型实例化过深
 */
export type SliceSet<TState> = (fn: (state: TState) => void) => void
export type SliceGet<TState> = () => TState
export type SliceCreator<TState, TSlice> = (
  set: SliceSet<TState>,
  get: SliceGet<TState>,
  store: StoreApi<TState>,
) => TSlice

/**
 * 按链式 key 路径从 state 中取出指定字段，生成白名单 partialize 函数
 * 只有传入的路径对应的字段才会被持久化，其余字段默认不持久化
 *
 * @example
 * createPartialize<RootStoreState>('market.favorite', 'trade.setting', 'user.info')
 */
export function createPartialize<T extends Record<string, any>>(
  ...paths: string[]
) {
  return (state: T): any => {
    const result: Record<string, any> = {}

    for (const path of paths) {
      // 从 state 中按路径读取值
      const value = getPath(state, path)
      if (value === undefined) continue

      // 按路径写入 result（深拷贝数据，跳过函数）
      setPath(result, path, deepCloneData(value))
    }

    return result
  }
}

/** 按链式路径读取对象属性 */
function getPath(obj: any, path: string): any {
  return path.split('.').reduce((cur, key) => {
    if (cur == null || typeof cur !== 'object') return undefined
    return cur[key]
  }, obj)
}

/** 按链式路径写入对象属性（自动创建中间节点） */
function setPath(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] == null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

/** 深拷贝数据字段，跳过函数 */
function deepCloneData(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(deepCloneData)

  const result: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] !== 'function') {
      result[key] = typeof obj[key] === 'object' && obj[key] !== null
        ? deepCloneData(obj[key])
        : obj[key]
    }
  }
  return result
}
