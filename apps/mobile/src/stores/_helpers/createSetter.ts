/** Setter 类型：支持直接设值和函数式更新 */
export type Setter<T> = (value: T | ((prev: T) => T)) => void

/**
 * 创建命名空间 setter 工厂
 * 支持直接设值和函数式更新
 *
 * @example
 * const tradeSetter = createSetter<TradeSlice>(set, (s) => s.trade)
 * setActiveTradeSymbol: tradeSetter('activeTradeSymbol')
 *
 * // 直接设值
 * setActiveTradeSymbol(newSymbol)
 * // 函数式更新
 * setActiveTradeSymbol((prev) => prev ?? defaultSymbol)
 */
export const createSetter =
  <T extends Record<string, any>>(
    set: (fn: (state: any) => void) => void,
    getSlice: (state: any) => T,
  ) =>
  <K extends keyof T>(key: K): Setter<T[K]> =>
  (value) => {
    set((state: any) => {
      const slice = getSlice(state)
      slice[key] = typeof value === 'function'
        ? (value as (prev: T[K]) => T[K])(slice[key])
        : value
    })
  }
