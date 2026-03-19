import type { RootStoreState } from '../index'

import { OrderCreateTypeEnum, OrderMarginTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'

export interface FormDataSliceState {
  /** 订单创建类型 */
  orderType: OrderCreateTypeEnum
  /** 买卖方向 */
  direction: TradePositionDirectionEnum
  /** 限价价格 */
  limitPrice: string
  /** 手数 */
  amount: string
  /** 止盈止损 */
  hasTpSl: boolean
  /** 止盈止损价格 */
  tpPrice: string
  /** 止盈止损价格 */
  slPrice: string
  /** 保证金类型 */
  marginType: OrderMarginTypeEnum
}

export interface FormDataSliceActions {
  setFormData: (partial: Partial<FormDataSliceState>) => void
  /** 设置订单类型，同时重置止盈止损价格 */
  setType: (type: OrderCreateTypeEnum) => void
  resetFormData: () => void
}

/** formData 命名空间（状态 + actions 扁平化） */
export type FormDataSlice = FormDataSliceState & FormDataSliceActions

/**
 * 创建 formData 命名空间切片（状态 + actions）
 * 访问路径: state.trade.formData.xxx
 */
export function createTradeFormDataSlice(setRoot: (fn: (state: RootStoreState) => void) => void): FormDataSlice {
  const state: FormDataSliceState = {
    orderType: OrderCreateTypeEnum.MARKET_ORDER,
    direction: TradePositionDirectionEnum.BUY,
    limitPrice: '',
    amount: '',
    hasTpSl: false,
    tpPrice: '',
    slPrice: '',
    marginType: OrderMarginTypeEnum.CROSS_MARGIN,
  }

  const actions: FormDataSliceActions = {
    setFormData: (partial) =>
      setRoot((state) => {
        Object.assign(state.trade.formData, partial)
      }),

    setType: (type) =>
      setRoot((state) => {
        state.trade.formData.orderType = type
        // 重置止盈止损价格
        state.trade.formData.tpPrice = ''
        state.trade.formData.slPrice = ''
      }),

    resetFormData: () => {
      setRoot((state) => {
        state.trade.formData.amount = ''
        state.trade.formData.tpPrice = ''
        state.trade.formData.slPrice = ''
      })
    },
  }

  return {
    ...state,
    ...actions,
  }
}

// ============ Selectors ============
export const tradeFormDataSelector = (state: RootStoreState) => state.trade.formData
export const tradeFormDataLimitPriceSelector = (state: RootStoreState) => state.trade.formData.limitPrice
export const tradeFormDataAmountSelector = (state: RootStoreState) => state.trade.formData.amount
export const tradeFormDataDirectionSelector = (state: RootStoreState) => state.trade.formData.direction
export const tradeFormDataTypeSelector = (state: RootStoreState) => state.trade.formData.orderType
