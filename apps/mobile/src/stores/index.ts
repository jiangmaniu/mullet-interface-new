import { merge } from 'lodash-es'
import { create } from 'zustand'
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { MarketSlice } from './market-slice'
import type { TradeSlice } from './trade-slice'
import type { UserSlice } from './user-slice'

import { mmkvStorage } from '@/lib/storage/mmkv'

import { createSelectors } from './_helpers/createSelectors'
import { createPartialize } from './_helpers/types'
import { createMarketSlice } from './market-slice'
import { createTradeSlice } from './trade-slice'
import { createUserSlice } from './user-slice'

/** RootStore 完整状态类型 */
export type RootStoreState = {
  trade: TradeSlice
  market: MarketSlice
  user: UserSlice
}

const useRootStoreBase = create<RootStoreState>()(
  subscribeWithSelector(
    persist(
      immer((set, get, store) => ({
        trade: createTradeSlice(set, get, store),
        market: createMarketSlice(set, get, store),
        user: createUserSlice(set, get, store),
      })),
      {
        name: 'mullet-root-store',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: createPartialize<RootStoreState>('trade.formData', 'market.symbol.loading', 'trade.position', 'trade.order'),
        // 深度合并，保留 currentState 的 action 方法
        merge: (persistedState, currentState) => merge({}, currentState, persistedState),
      },
    ),
  ),
)

export const useRootStore = createSelectors(useRootStoreBase)

// 递归调用各 slice 及子命名空间的 initSubscribe（如果存在）
const callInitSubscribe = (slice: any) => {
  if (!slice || typeof slice !== 'object') return
  if (typeof slice.initSubscribe === 'function') slice.initSubscribe()
  Object.values(slice).forEach((child) => {
    if (child && typeof child === 'object' && typeof (child as any).initSubscribe === 'function') {
      callInitSubscribe(child)
    }
  })
}
Object.values(useRootStoreBase.getState()).forEach(callInitSubscribe)
