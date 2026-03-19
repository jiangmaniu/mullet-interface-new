import type { ImmerStateCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'
import type { MarketFavoriteSlice } from './favorite-slice'
import type { MarketQuoteSlice } from './quote-slice'
import type { MarketSymbolSlice } from './symbol-slice'

import { createMarketFavoriteSlice } from './favorite-slice'
import { createMarketQuoteSlice } from './quote-slice'
import { createMarketSymbolSlice } from './symbol-slice'

export type { MarketSymbolSlice }
export {
  marketFetchMarketListLoadingSelector,
  marketSymbolInfoMapSelector,
  marketSymbolInfoListSelector,
  createSymbolInfoSelector,
  useMarketSymbolInfo,
} from './symbol-slice'

/** Market 命名空间完整类型 */
export type MarketSlice = {
  symbol: MarketSymbolSlice
  favorite: MarketFavoriteSlice
  quote: MarketQuoteSlice
  initSubscribe: () => void
}

export const createMarketSlice: ImmerStateCreator<RootStoreState, MarketSlice> = (set, get, store) => ({
  symbol: createMarketSymbolSlice(set, get, store),
  favorite: createMarketFavoriteSlice(set, get, store),
  quote: createMarketQuoteSlice(set, get, store),

  initSubscribe: () => {
    store.subscribe(
      (state) => state.user.info.activeTradeAccountId,
      (accountId, prevAccountId) => {
        if (accountId && accountId !== prevAccountId) {
          get().market.symbol.fetchInfoList(accountId)
        }
      },
    )
  },
})

// ============ Selectors ============

export const marketSelector = (state: RootStoreState) => state.market
