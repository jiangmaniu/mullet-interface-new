import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { keyBy } from 'lodash-es'
import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import type { MarketFavoriteSlice } from './favorite-slice'

import { getTradeSymbolList } from '@/v1/services/tradeCore/account'
import { Account } from '@/v1/services/tradeCore/account/typings'

import { useRootStore } from '../index'
import { createMarketFavoriteSlice } from './favorite-slice'

export interface MarketSliceState {
  /** 品种列表加载状态 */
  fetchMarketListLoading: boolean
  /** 品种信息 Map（以 symbol 为 key） */
  symbolInfoMap: Record<string, Account.TradeSymbolListItem>
  /** 全部品种信息列表 */
  symbolInfoList: Account.TradeSymbolListItem[]
}

export interface MarketSliceActions {
  setMarket: (partial: Partial<MarketSliceState>) => void
  /** 获取交易品种列表 */
  fetchMarketSymbolInfoList: (accountId: string) => Promise<void>
}

/** Market 命名空间完整类型（状态直接展平） */
export type MarketSlice = MarketSliceState &
  MarketSliceActions & {
    /** 收藏子命名空间 */
    favorite: MarketFavoriteSlice
  }

export const createMarketSlice: ImmerStateCreator<RootStoreState, MarketSlice> = (set, get) => ({
  fetchMarketListLoading: false,
  symbolInfoMap: {},
  symbolInfoList: [],

  // 收藏子命名空间
  favorite: createMarketFavoriteSlice(set),

  setMarket: (partial) =>
    set((state) => {
      Object.assign(state.market, partial)
    }),

  fetchMarketSymbolInfoList: async (accountId: string) => {
    // 如果 symbolInfoList 为空，显示 loading
    if (!get().market.symbolInfoList.length) {
      set((state) => {
        state.market.fetchMarketListLoading = true
      })
    }

    try {
      const res = await getTradeSymbolList({ accountId })

      if (res.success) {
        const list = (res.data || []) as Account.TradeSymbolListItem[]

        const symbolInfoMap = keyBy<Account.TradeSymbolListItem>(list, 'symbol')
        set((state) => {
          state.market.symbolInfoList = list
          state.market.symbolInfoMap = symbolInfoMap
        })

        const activeTradeSymbol = get().trade.activeTradeSymbol
        if (!activeTradeSymbol || !symbolInfoMap[activeTradeSymbol]) {
          get().trade.setActiveTradeSymbol(list[0]?.symbol)
        }
      }
    } catch (error) {
      console.error('Failed to fetch trade symbol list:', error)
    } finally {
      set((state) => {
        state.market.fetchMarketListLoading = false
      })
    }
  },
})

// ============ Selectors ============

export const marketSelector = (state: RootStoreState) => state.market
export const marketFetchMarketListLoadingSelector = (state: RootStoreState) => state.market.fetchMarketListLoading
export const symbolInfoMapSelector = (state: RootStoreState) => state.market.symbolInfoMap
export const symbolInfoListSelector = (state: RootStoreState) => state.market.symbolInfoList

/** 生成式 selector - 根据 symbol 查找对应的 symbolInfo */
export const createSymbolInfoSelector = (symbol?: string) => (state: RootStoreState) =>
  symbol ? state.market.symbolInfoMap[symbol] : undefined

export const useMarketSymbolInfo = (symbol?: string) => {
  const symbolInfo = useRootStore(
    useShallow(
      useCallback(
        (s: RootStoreState) => {
          return createSymbolInfoSelector(symbol)(s)
        },
        [symbol],
      ),
    ),
  )
  return symbolInfo
}
