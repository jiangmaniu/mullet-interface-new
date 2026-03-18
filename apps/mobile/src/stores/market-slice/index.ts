import { keyBy } from 'lodash-es'
import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import type { MarketFavoriteSlice } from './favorite-slice'

import { getTradeSymbolList } from '@/v1/services/tradeCore/account'
import { Account } from '@/v1/services/tradeCore/account/typings'

import { createMarketFavoriteSlice } from './favorite-slice'

export interface MarketSliceState {
  /** 品种列表加载状态 */
  fetchMarketListLoading: boolean
  /** 品种 Map（以 symbol 为 key） */
  marketMap: Record<string, Account.TradeSymbolListItem>
  /** 全部品种列表 */
  marketAllList: Account.TradeSymbolListItem[]
}

export interface MarketSliceActions {
  setMarket: (partial: Partial<MarketSliceState>) => void
  /** 获取交易品种列表 */
  fetchTradeSymbolList: (accountId: string) => Promise<void>
}

/** Market 命名空间完整类型（状态直接展平） */
export type MarketSlice = MarketSliceState &
  MarketSliceActions & {
    /** 收藏子命名空间 */
    favorite: MarketFavoriteSlice
  }

export const createMarketSlice: ImmerStateCreator<RootStoreState, MarketSlice> = (set, get) => ({
  fetchMarketListLoading: false,
  marketMap: {},
  marketAllList: [],

  // 收藏子命名空间
  favorite: createMarketFavoriteSlice(set),

  setMarket: (partial) =>
    set((state) => {
      Object.assign(state.market, partial)
    }),

  fetchTradeSymbolList: async (accountId: string) => {
    // 如果 marketAllList 为空，显示 loading
    if (!get().market.marketAllList.length) {
      set((state) => {
        state.market.fetchMarketListLoading = true
      })
    }

    try {
      const res = await getTradeSymbolList({ accountId })

      if (res.success) {
        const list = (res.data || []) as Account.TradeSymbolListItem[]

        set((state) => {
          state.market.marketAllList = list
          state.market.marketMap = keyBy(list, 'symbol') as Record<string, Account.TradeSymbolListItem>
        })

        // 检查 trade 中是否有 activeTradeSymbol，没有则使用第一项初始化
        const activeTradeSymbol = get().trade.activeTradeSymbol
        if (!activeTradeSymbol && list.length > 0) {
          set((state) => {
            state.trade.setActiveTradeSymbol(list[0])
          })
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
export const marketMapSelector = (state: RootStoreState) => state.market.marketMap
export const marketAllListSelector = (state: RootStoreState) => state.market.marketAllList
