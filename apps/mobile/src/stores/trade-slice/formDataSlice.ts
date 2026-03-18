import type { RootStoreState } from '../index'

export interface FormDataSliceState {
  /** 限价价格 */
  limitPrice: string
  /** 手数 */
  orderLots: string
  /** 止盈价 */
  tpPrice: string
  /** 止损价 */
  slPrice: string
  /** 携带止盈止损 */
  hasTpSl: boolean
}

export interface FormDataSliceActions {
  setFormData: (partial: Partial<FormDataSliceState>) => void
}

/** formData 命名空间（状态 + actions 扁平化） */
export type FormDataSlice = FormDataSliceState & FormDataSliceActions

/**
 * 创建 formData 命名空间切片（状态 + actions）
 * 访问路径: state.trade.formData.xxx
 */
export function createTradeFormDataSlice(setRoot: (fn: (state: any) => void) => void): FormDataSlice {
  return {
    limitPrice: '',
    orderLots: '',

    hasTpSl: false,
    tpPrice: '',
    slPrice: '',

    setFormData: (partial) =>
      setRoot((state) => {
        Object.assign(state.trade.formData, partial)
      }),
  }
}

// ============ Selectors ============

export const tradeFormDataSelector = (state: RootStoreState) => state.trade.formData
export const tradeFormDataLimitPriceSelector = (state: RootStoreState) => state.trade.formData.limitPrice
export const tradeFormDataOrderLotsSelector = (state: RootStoreState) => state.trade.formData.orderLots
