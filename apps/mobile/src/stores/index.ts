import { merge } from 'lodash-es'
import { create } from 'zustand'
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { MarketSlice } from './market-slice'
import type { TradeSlice } from './trade-slice'
import type { UserSlice } from './user-slice'

import { STORAGE_KEY_ROOT_STORE } from '@/lib/storage/keys'
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
        name: STORAGE_KEY_ROOT_STORE,
        storage: createJSONStorage(() => mmkvStorage),
        // 白名单：只有列出的字段才会被 persist 持久化
        // 行情/持仓/挂单等高频或启动后会重新拉取的数据，通过 snapshot 单独管理
        partialize: createPartialize<RootStoreState>(
          // ── user ──
          'user.auth.accessToken', // token（不含 redirectTo）
          'user.auth.loginInfo',
          'user.auth.loginType',
          'user.info.activeTradeAccountId',
          'user.info.clientInfo',
          'user.info.accountList',
          'user.info.accountMap',
          // ── market ──
          'market.favorite', // 全命名空间
          // ── trade ──
          'trade.setting', // 全命名空间
          'trade.activeTradeSymbol',
          'trade.position.idList',
          'trade.position.map',
          'trade.order.idList',
          'trade.order.map',
        ),
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

/** 在 i18n 激活后调用，确保 initSubscribe 中使用 Lingui 的逻辑不会报错 */
export const initStoreSubscribes = () => {
  Object.values(useRootStoreBase.getState()).forEach(callInitSubscribe)
}
