import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { keyBy } from 'lodash-es'
import type { Symbol } from '@/services/tradeCore/symbol/typings'
import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { loadSnapshot, saveSnapshot } from '@/lib/storage/snapshot'
import { getTradeSymbolList } from '@/services/tradeCore/account'
import { Account } from '@/services/tradeCore/account/typings'
import { getAllSymbols } from '@/services/tradeCore/symbol'

import { useRootStore } from '../index'

// ============ 状态 & Actions 类型 ============

type MarketSymbolSimpleMap = Record<string, Symbol.AllSymbolItem>

export interface MarketSymbolSliceState {
  /** 品种列表加载状态 */
  loading: boolean
  /** 品种信息 Map（以 symbol 为 key） */
  infoMap: Record<string, Account.TradeSymbolListItem>
  /** 全部品种信息列表 */
  infoList: Account.TradeSymbolListItem[]

  simpleMap: MarketSymbolSimpleMap
}

export interface MarketSymbolSliceActions {
  /** 获取交易品种列表 */
  fetchInfoList: (accountId?: string) => Promise<void>
}

export type MarketSymbolSlice = MarketSymbolSliceState & MarketSymbolSliceActions

// ============ 工厂函数 ============

export const createMarketSymbolSlice: SliceCreator<RootStoreState, MarketSymbolSlice> = (set, get) => {
  // 启动时从快照恢复品种列表，避免首次进入时无数据
  const snapshotList = loadSnapshot<Account.TradeSymbolListItem[]>('symbol') ?? []
  const snapshotInfoMap = snapshotList.length ? keyBy<Account.TradeSymbolListItem>(snapshotList, 'symbol') : {}

  const snapshotSymbolSimpleMap = loadSnapshot<MarketSymbolSimpleMap>('symbolSimple') ?? {}

  return {
    loading: false,
    simpleMap: snapshotSymbolSimpleMap,
    infoMap: snapshotInfoMap,
    infoList: snapshotList,

    fetchInfoList: async (accountId?: string) => {
      if (!accountId) {
        return
      }

      if (!get().market.symbol.infoList.length) {
        set((state) => {
          state.market.symbol.loading = true
        })
      }

      try {
        const [res, simpleRes] = await Promise.all([getTradeSymbolList({ accountId }), getAllSymbols()])

        if (res.success) {
          const list = (res.data || []) as Account.TradeSymbolListItem[]
          const infoMap = keyBy<Account.TradeSymbolListItem>(list, 'symbol')

          set((state) => {
            state.market.symbol.infoList = list
            state.market.symbol.infoMap = infoMap
          })

          // 拉取成功后存快照，下次启动可立即显示
          saveSnapshot('symbol', list)

          const activeTradeSymbol = get().trade.activeTradeSymbol
          if (!activeTradeSymbol || !infoMap[activeTradeSymbol]) {
            get().trade.setActiveTradeSymbol(list[0]?.symbol)
          }
        }

        if (simpleRes.success) {
          const simpleMap = keyBy(simpleRes.data, 'symbol')
          set((state) => {
            state.market.symbol.simpleMap = simpleMap
          })
          // 拉取成功后存快照，下次启动可立即初始化
          saveSnapshot('symbolSimple', simpleMap)
        }
      } catch (error) {
        console.error('Failed to fetch trade symbol list:', error)
      } finally {
        set((state) => {
          state.market.symbol.loading = false
        })
      }
    },
  }
}

// ============ Selectors ============

export const marketFetchMarketListLoadingSelector = (state: RootStoreState) => state.market.symbol.loading
export const marketSymbolInfoMapSelector = (state: RootStoreState) => state.market.symbol.infoMap
export const marketSymbolSimpleMapSelector = (state: RootStoreState) => state.market.symbol.simpleMap
export const marketSymbolInfoListSelector = (state: RootStoreState) => state.market.symbol.infoList

export const createMarketSymbolInfoListBySymbolListSelector = (symbolList: readonly string[] = []) => {
  return (state: RootStoreState) =>
    state.market.symbol.infoList.filter((symbolInfo) => {
      return symbolList.includes(symbolInfo.symbol)
    })
}

/** 工厂：根据 symbol 查找对应的 symbolInfo */
export const createSymbolInfoSelector = (symbol?: string) => (state: RootStoreState) =>
  symbol ? state.market.symbol.infoMap[symbol] : undefined

export const useMarketSymbolInfo = (symbol?: string) => {
  return useRootStore(useShallow(useCallback((s: RootStoreState) => createSymbolInfoSelector(symbol)(s), [symbol])))
}

export const useMarketSymbolInfoListBySymbolList = (symbolList: readonly string[] = []) => {
  const loading = useRootStore(marketFetchMarketListLoadingSelector)
  const symbolInfoList = useRootStore(
    useShallow(
      useCallback((s: RootStoreState) => createMarketSymbolInfoListBySymbolListSelector(symbolList)(s), [symbolList]),
    ),
  )

  return { symbolInfoList, loading }
}
