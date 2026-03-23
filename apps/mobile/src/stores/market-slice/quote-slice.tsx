import { isArray } from 'lodash-es'
import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { IQuoteItem } from '@/v1/stores/ws'
import { loadSnapshot } from '@/lib/storage/snapshot'

interface MarketQuoteSliceState {
  /** 行情信息 Map */
  quoteMap: Record<string, IQuoteItem>
}

export interface MarketQuoteSliceActions {
  addQuotes: (quotes: IQuoteItem[]) => void
}

/** Market 命名空间完整类型（状态直接展平） */
export type MarketQuoteSlice = MarketQuoteSliceState & MarketQuoteSliceActions

export const createMarketQuoteSlice: SliceCreator<RootStoreState, MarketQuoteSlice> = (set, get) => {
  const marketQuoteState: MarketQuoteSliceState = {
    // 启动时从快照恢复，让用户进来时立即有数据可显示
    quoteMap: loadSnapshot<Record<string, IQuoteItem>>('quote') ?? {},
  }

  const marketQuoteAction: MarketQuoteSliceActions = {
    addQuotes: (quotes: IQuoteItem[] | IQuoteItem) => {
      const quotesArr = isArray(quotes) ? quotes : [quotes]
      const filteredQuoteArr = quotesArr.filter((quote) => quote.dataSourceKey)

      if (filteredQuoteArr.length === 0) return

      const oldQuoteMap = { ...get().market.quote.quoteMap }

      const newQuoteMap = filteredQuoteArr.reduce((acc, quote) => {
        acc[quote.dataSourceKey] = quote
        return acc
      }, oldQuoteMap)

      set((state) => {
        state.market.quote.quoteMap = newQuoteMap
      })
    },
  }

  return {
    ...marketQuoteState,
    ...marketQuoteAction,
  }
}

// ============ Selectors ============

export const marketQuoteSliceSelector = (state: RootStoreState) => {
  return state.market.quote
}

/** 工厂：根据 dataSourceKey 获取对应的 quote */
export const createMarketQuoteSelector =
  (dataSourceKey?: string) =>
  (state: RootStoreState): IQuoteItem | undefined => {
    if (!dataSourceKey) return undefined
    return state.market.quote.quoteMap[dataSourceKey]
  }
