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
 * 生成对象所有链式 key 路径
 * 只展开纯对象类型，数组/函数等不展开
 *
 * @example
 * type State = { trade: { setting: { colorScheme: string }, formData: { limitPrice: string } } }
 * type Keys = DotPaths<State>
 * // 'trade' | 'trade.setting' | 'trade.setting.colorScheme' | 'trade.formData' | 'trade.formData.limitPrice'
 */
type DotPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends (...args: any[]) => any
    ? never
    : T[K] extends Record<string, any>
      ? T[K] extends any[]
        ? `${Prefix}${K}`
        : `${Prefix}${K}` | DotPaths<T[K], `${Prefix}${K}.`>
      : `${Prefix}${K}`
}[keyof T & string]

/**
 * 根据链式 key 路径从类型中排除指定字段
 * 支持排除整个命名空间或具体字段
 */
type OmitByPath<T, Path extends string> =
  Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? { [P in keyof T]: P extends K ? OmitByPath<T[P], Rest> : T[P] }
      : T
    : Omit<T, Path>

/**
 * 从 state 中按链式 key 路径排除字段，生成 partialize 函数
 * 排除的字段不会被持久化
 *
 * @example
 * createPartialize<RootStoreState>('trade.formData', 'market.fetchMarketListLoading')
 */
export function createPartialize<T extends Record<string, any>>(
  ...paths: string[]
) {
  return (state: T): any => {
    // 深拷贝状态（只拷贝纯数据，跳过函数）
    const cloned = deepCloneData(state)

    // 按路径删除指定字段
    for (const path of paths) {
      deletePath(cloned, path)
    }

    return cloned
  }
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

/** 按链式路径删除对象属性 */
function deletePath(obj: any, path: string) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    if (current == null || typeof current !== 'object') return
    current = current[keys[i]]
  }

  if (current != null && typeof current === 'object') {
    delete current[keys[keys.length - 1]]
  }
}
