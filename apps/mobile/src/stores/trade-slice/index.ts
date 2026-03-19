import type { Setter } from '../_helpers/createSetter'
import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import type { FormDataSlice } from './formDataSlice'
import type { SettingSlice } from './settingSlice'

import { createSetter } from '../_helpers/createSetter'
import { createTradeFormDataSlice } from './formDataSlice'
import { createTradeSettingSlice } from './settingSlice'

/** Trade 根级状态 */
export interface TradeSliceState {
  /** 当前激活的交易品种 symbol */
  activeTradeSymbol: string | undefined
  setActiveTradeSymbol: Setter<string | undefined>
}

/** Trade 命名空间完整类型 */
export type TradeSlice = TradeSliceState & {
  /** setting 子命名空间 */
  setting: SettingSlice
  /** formData 子命名空间 */
  formData: FormDataSlice
}

export const createTradeSlice: ImmerStateCreator<RootStoreState, TradeSlice> = (set, get) => {
  const tradeSetter = createSetter<TradeSlice>(set, (s) => s.trade)

  return {
    activeTradeSymbol: undefined,
    setActiveTradeSymbol: tradeSetter('activeTradeSymbol'),

    setting: createTradeSettingSlice(set, get),
    formData: createTradeFormDataSlice(set),
  }
}

// ============ Selectors ============

export const tradeActiveTradeSymbolSelector = (state: RootStoreState) => state.trade.activeTradeSymbol

/** 获取当前激活交易品种的完整信息（从 symbolInfoMap 中查找） */
export const tradeActiveTradeSymbolInfoSelector = (state: RootStoreState) => {
  const activeSymbol = state.trade.activeTradeSymbol
  if (!activeSymbol) return null
  return state.market.symbol.infoMap[activeSymbol] || null
}
