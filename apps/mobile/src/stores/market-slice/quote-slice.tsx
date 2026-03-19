import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { IQuoteItem } from '@/v1/stores/ws'

import { createSymbolInfoSelector } from './symbol-slice'
interface MarketQuoteSliceState {
  /** 行情信息 Map */
  quoteMap: Record<string, IQuoteItem>
}

export interface MarketQuoteSliceActions {
  addQuote: (quote: IQuoteItem) => void
}

/** Market 命名空间完整类型（状态直接展平） */
export type MarketQuoteSlice = MarketQuoteSliceState & MarketQuoteSliceActions

export const createMarketQuoteSlice: SliceCreator<RootStoreState, MarketQuoteSlice> = (set, _get) => {
  const marketQuoteState: MarketQuoteSliceState = {
    quoteMap: {},
  }

  const marketQuoteAction: MarketQuoteSliceActions = {
    addQuote: (quote: IQuoteItem) => {
      if (!quote.dataSourceKey) return
      set((state) => {
        state.market.quote.quoteMap[quote.dataSourceKey] = quote
      })
    },
  }

  return {
    ...marketQuoteState,
    ...marketQuoteAction,
  }
}

// ============ Selectors ============

/** 工厂：根据 symbol 获取对应的 quote */
export const createMarketQuoteSelector =
  (symbol?: string) =>
  (state: RootStoreState): IQuoteItem | undefined => {
    if (!symbol) return undefined
    const symbolInfo = createSymbolInfoSelector(symbol)(state)
    const dataSourceKey = parseDataSourceKey(symbolInfo)
    if (!dataSourceKey) return undefined
    return state.market.quote.quoteMap[dataSourceKey]
  }
