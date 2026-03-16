import { Account } from '@/v1/services/tradeCore/account/typings'

import type { Setter } from '../_helpers/createSetter'
import { createSetter } from '../_helpers/createSetter'
import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import { createTradeSettingSlice, type SettingSlice } from './settingSlice'
import { createTradeFormDataSlice, type FormDataSlice } from './formDataSlice'

// 导出 selectors 和类型
export * from './settingSlice'
export * from './formDataSlice'

/** Trade 根级状态 */
export interface TradeSliceState {
  /** 当前激活的交易品种 */
  activeTradeSymbol: Account.TradeSymbolListItem | null
  setActiveTradeSymbol: Setter<Account.TradeSymbolListItem | null>
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
    activeTradeSymbol: null,
    setActiveTradeSymbol: tradeSetter('activeTradeSymbol'),

    setting: createTradeSettingSlice(set, get),
    formData: createTradeFormDataSlice(set),
  }
}

// ============ Selectors ============

export const tradeActiveTradeSymbolSelector = (state: RootStoreState) => state.trade.activeTradeSymbol
