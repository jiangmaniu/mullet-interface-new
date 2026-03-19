import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { keyBy } from 'lodash-es'
import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { getTradeSymbolList } from '@/v1/services/tradeCore/account'
import { Account } from '@/v1/services/tradeCore/account/typings'

import { useRootStore } from '../index'

// ============ 状态 & Actions 类型 ============

export interface MarketSymbolSliceState {
  /** 品种列表加载状态 */
  loading: boolean
  /** 品种信息 Map（以 symbol 为 key） */
  infoMap: Record<string, Account.TradeSymbolListItem>
  /** 全部品种信息列表 */
  infoList: Account.TradeSymbolListItem[]
}

export interface MarketSymbolSliceActions {
  /** 获取交易品种列表 */
  fetchInfoList: (accountId?: string) => Promise<void>
}

export type MarketSymbolSlice = MarketSymbolSliceState & MarketSymbolSliceActions

// ============ 工厂函数 ============

export const createMarketSymbolSlice: SliceCreator<RootStoreState, MarketSymbolSlice> = (set, get) => ({
  loading: false,
  infoMap: {},
  infoList: [],

  fetchInfoList: async (accountId?: string) => {
    if (!get().market.symbol.infoList.length) {
      set((state) => {
        state.market.symbol.loading = true
      })
    }

    try {
      const res = await getTradeSymbolList({ accountId })

      if (res.success) {
        const list = (res.data || []) as Account.TradeSymbolListItem[]
        const infoMap = keyBy<Account.TradeSymbolListItem>(list, 'symbol')

        set((state) => {
          state.market.symbol.infoList = list
          state.market.symbol.infoMap = infoMap
        })

        const activeTradeSymbol = get().trade.activeTradeSymbol
        if (!activeTradeSymbol || !infoMap[activeTradeSymbol]) {
          get().trade.setActiveTradeSymbol(list[0]?.symbol)
        }
      }
    } catch (error) {
      console.error('Failed to fetch trade symbol list:', error)
    } finally {
      set((state) => {
        state.market.symbol.loading = false
      })
    }
  },
})

// ============ Selectors ============

export const marketFetchMarketListLoadingSelector = (state: RootStoreState) => state.market.symbol.loading
export const marketSymbolInfoMapSelector = (state: RootStoreState) => state.market.symbol.infoMap
export const marketSymbolInfoListSelector = (state: RootStoreState) => state.market.symbol.infoList

/** 工厂：根据 symbol 查找对应的 symbolInfo */
export const createSymbolInfoSelector = (symbol?: string) => (state: RootStoreState) =>
  symbol ? state.market.symbol.infoMap[symbol] : undefined

export const useMarketSymbolInfo = (symbol?: string) => {
  return useRootStore(
    useShallow(
      useCallback(
        (s: RootStoreState) => createSymbolInfoSelector(symbol)(s),
        [symbol],
      ),
    ),
  )
}
