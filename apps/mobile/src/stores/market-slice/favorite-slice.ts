import { createSelector } from 'reselect'
import type { Setter } from '../_helpers/createSetter'
import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { Account } from '@/services/tradeCore/account/typings'

import { createSetter } from '../_helpers/createSetter'

// ============ 状态 & Actions 类型 ============

export interface MarketFavoriteSliceState {
  /**
   * 多账户收藏数据
   * key: accountId, value: symbol 字符串数组
   * 示例: { 'account-123': ['XAUUSD', 'EURUSD'] }
   */
  symbolFavoriteMap: Record<string, string[]>
}

export interface MarketFavoriteSliceActions {
  /** 切换收藏状态（主要操作） */
  toggleFavorite: (symbol: string, accountId?: string) => void
  /** 添加收藏 */
  addFavorite: (symbol: string, accountId?: string) => void
  /** 删除收藏 */
  removeFavorite: (symbol: string, accountId?: string) => void
  /** 批量设置收藏列表（初始化/迁移用） */
  setFavoriteList: (symbols: string[], accountId?: string) => void
  /** 清空收藏列表 */
  clearFavoriteList: (accountId?: string) => void
  /** 直接 setter（createSetter 生成） */
  setSymbolFavoriteMap: Setter<Record<string, string[]>>
}

export type MarketFavoriteSlice = MarketFavoriteSliceState & MarketFavoriteSliceActions

// ============ 工厂函数 ============

export const createMarketFavoriteSlice: SliceCreator<RootStoreState, MarketFavoriteSlice> = (setRoot, get) => {
  const favoriteSetter = createSetter<MarketFavoriteSlice>(setRoot, (s) => s.market.favorite)

  /** 获取目标账户 ID，优先使用传入的，否则取当前激活账户 */
  const resolveAccountId = (state: any, accountId?: string): string | null =>
    accountId ?? state.user.info.activeTradeAccountId ?? null

  return {
    symbolFavoriteMap: {},

    setSymbolFavoriteMap: favoriteSetter('symbolFavoriteMap'),

    toggleFavorite: (symbol, accountId) => {
      setRoot((state) => {
        const id = resolveAccountId(state, accountId)
        if (!id) return
        const list = state.market.favorite.symbolFavoriteMap[id] || []
        state.market.favorite.symbolFavoriteMap[id] = list.includes(symbol)
          ? list.filter((s: string) => s !== symbol)
          : [...list, symbol]
      })
    },

    addFavorite: (symbol, accountId) => {
      setRoot((state) => {
        const id = resolveAccountId(state, accountId)
        if (!id) return
        const list = state.market.favorite.symbolFavoriteMap[id] || []
        if (list.includes(symbol)) return
        state.market.favorite.symbolFavoriteMap[id] = [...list, symbol]
      })
    },

    removeFavorite: (symbol, accountId) => {
      setRoot((state) => {
        const id = resolveAccountId(state, accountId)
        if (!id) return
        const list = state.market.favorite.symbolFavoriteMap[id] || []
        state.market.favorite.symbolFavoriteMap[id] = list.filter((s: string) => s !== symbol)
      })
    },

    setFavoriteList: (symbols, accountId) => {
      setRoot((state) => {
        const id = resolveAccountId(state, accountId)
        if (!id) return
        state.market.favorite.symbolFavoriteMap[id] = symbols
      })
    },

    clearFavoriteList: (accountId) => {
      setRoot((state) => {
        const id = resolveAccountId(state, accountId)
        if (!id) return
        state.market.favorite.symbolFavoriteMap[id] = []
      })
    },
  }
}

// ============ Selectors ============

/** 空数组常量，避免 || [] 每次创建新引用导致 reselect 缓存失效 */
const EMPTY_STRING_ARRAY: string[] = []

/** 内部：当前账户的收藏 symbol 字符串列表 */
const marketCurrentFavoriteSymbolListSelector = (state: RootStoreState): string[] => {
  const accountId = state.user.info.activeTradeAccountId
  if (!accountId) return EMPTY_STRING_ARRAY
  return state.market.favorite.symbolFavoriteMap[accountId] ?? EMPTY_STRING_ARRAY
}

/** 当前账户的收藏 Set（O(1) 查找） */
export const marketCurrentFavoriteSetSelector = createSelector(
  [marketCurrentFavoriteSymbolListSelector],
  (symbolList): Set<string> => new Set(symbolList),
)

/**
 * 当前账户的收藏品种完整信息列表
 * 自动过滤 symbolInfoMap 中不存在的品种（已下架）
 */
export const marketCurrentFavoriteSymbolInfoListSelector = createSelector(
  [marketCurrentFavoriteSymbolListSelector, (state: RootStoreState) => state.market.symbol.infoMap],
  (symbolList, symbolInfoMap): Account.TradeSymbolListItem[] =>
    symbolList.map((symbol) => symbolInfoMap[symbol]).filter(Boolean) as Account.TradeSymbolListItem[],
)

/** 当前账户的收藏数量 */
export const marketCurrentFavoriteCountSelector = createSelector(
  [marketCurrentFavoriteSymbolListSelector],
  (symbolList): number => symbolList.length,
)

/**
 * 工厂：判断指定品种是否被当前账户收藏
 * 使用时需配合 useMemo 缓存：
 * const selector = useMemo(() => createMarketIsFavoriteSelector(symbol), [symbol])
 */
export const createMarketIsFavoriteSelector = (symbol: string) =>
  createSelector([marketCurrentFavoriteSetSelector], (favoriteSet): boolean => favoriteSet.has(symbol))

/**
 * 获取指定账户的收藏品种完整信息列表
 * @param accountId - 目标账户 ID
 */
export const getMarketFavoriteSymbolInfoListByAccountId = (accountId: string) =>
  createSelector(
    [
      (state: RootStoreState) => state.market.favorite.symbolFavoriteMap[accountId] || [],
      (state: RootStoreState) => state.market.symbol.infoMap,
    ],
    (symbolList, symbolInfoMap): Account.TradeSymbolListItem[] =>
      symbolList.map((symbol: string) => symbolInfoMap[symbol]).filter(Boolean) as Account.TradeSymbolListItem[],
  )
