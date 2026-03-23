import type { Setter } from '../_helpers/createSetter'
import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import type { FormDataSlice } from './formDataSlice'
import type { OrderSlice } from './order-slice'
import type { PositionSlice } from './position-slice'
import type { SettingSlice } from './settingSlice'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import ws from '@/v1/stores/ws'

import { createSetter } from '../_helpers/createSetter'
import { createAccountInfoSelector } from '../user-slice/infoSlice'
import { createTradeFormDataSlice } from './formDataSlice'
import { createOrderSlice } from './order-slice'
import { createPositionSlice } from './position-slice'
import { createTradeSettingSlice } from './settingSlice'

/** Trade 根级状态 */
export interface TradeSliceState {
  /** 当前激活的交易品种 symbol */
  activeTradeSymbol: string | undefined
  setActiveTradeSymbol: Setter<string | undefined>

  switchingActiveTradeAccount: boolean
  setSwitchAccountLoading: Setter<boolean>
}

/** Trade 命名空间完整类型 */
export type TradeSlice = TradeSliceState & {
  /** setting 子命名空间 */
  setting: SettingSlice
  /** formData 子命名空间 */
  formData: FormDataSlice
  /** position 子命名空间 - 持仓列表 */
  position: PositionSlice
  /** order 子命名空间 - 挂单列表 */
  order: OrderSlice
  /** 订阅 activeTradeAccountId 变化，自动拉取持仓/挂单 */
  initSubscribe: () => void
}

export const createTradeSlice: ImmerStateCreator<RootStoreState, TradeSlice> = (set, get, store) => {
  const tradeSetter = createSetter<TradeSlice>(set, (s) => s.trade)

  return {
    switchingActiveTradeAccount: false,
    setSwitchAccountLoading: tradeSetter('switchingActiveTradeAccount'),
    activeTradeSymbol: undefined,
    setActiveTradeSymbol: tradeSetter('activeTradeSymbol'),

    initSubscribe: () => {
      // store.subscribe(
      //   (state) => state.user.info.activeTradeAccountId,
      //   async (accountId, prevAccountId) => {
      //     get().trade.setSwitchAccountLoading(true)
      //     // 取消上一个账户的订阅
      //     if (accountId !== prevAccountId) {
      //       // 取消上一个账户的订阅
      //       ws.send({
      //         topic: `/${DEFAULT_TENANT_ID}/trade/${prevAccountId}`,
      //         cancel: true,
      //       })
      //       const prevAccountInfo = createAccountInfoSelector(prevAccountId)(get())
      //       get().trade.position.subscribePositionMarketQuote(get().trade.position.idList, prevAccountInfo, {
      //         cancel: true,
      //       })
      //       get().trade.order.subscribeOrderMarketQuote(get().trade.order.idList, prevAccountInfo, { cancel: true })
      //     }
      //     // 订阅新的账户
      //     if (accountId) {
      //       // 添加当前订阅
      //       ws.send({
      //         topic: `/${DEFAULT_TENANT_ID}/trade/${accountId}`,
      //         cancel: false,
      //       })
      //       await get().market.symbol.fetchInfoList(accountId)
      //       await Promise.all([get().trade.position.fetch(), get().trade.order.fetch()])
      //     }
      //     get().trade.setSwitchAccountLoading(false)
      //   },
      // )
    },

    setting: createTradeSettingSlice(set, get),
    formData: createTradeFormDataSlice(set),
    position: createPositionSlice(set, get, store),
    order: createOrderSlice(set, get, store),
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
