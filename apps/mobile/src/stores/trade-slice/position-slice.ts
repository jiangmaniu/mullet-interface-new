import { keyBy } from 'lodash-es'
import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import MulletWS from '@/lib/ws/mullet-ws'
import { Unsubscribe } from '@/lib/ws/types'
import { TradePositionStatusEnum } from '@/options/trade/position'
import { parseTradePositionInfo, TradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { getBgaOrderPage } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'

import { selectorMemoize } from '../_helpers/memo'
import { marketSymbolSimpleMapSelector } from '../market-slice/symbol-slice'
import { userInfoActiveTradeAccountInfoSelector } from '../user-slice/infoSlice'

// ============ 状态 & Actions 类型 ============

export interface PositionSliceState {
  /** 持仓 ID 列表（保持顺序） */
  idList: string[]
  /** 持仓 Map（以 id 为 key） */
  map: Record<string, TradePositionInfo>
  /** 计算缓存 Map */
  calcCacheMap: Record<string, TradePositionInfo>
  /** 加载状态 */
  loading: boolean
}

export interface PositionSliceActions {
  /** HTTP 拉取持仓列表 */
  fetch: (accountId?: string) => Promise<any>
  /** WebSocket 推送更新 */
  update: (list: Order.BgaOrderPageListItem[]) => void
  /** 切换账户时清空数据 */
  reset: () => void
  /** 更新计算缓存 */
  setCalcCache: (list: Order.BgaOrderPageListItem[]) => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  subscribePositionMarketQuote: (
    positionIdList?: string[],
    accountInfo?: User.AccountItem,
    option?: { cancel?: boolean },
  ) => void
}

export type PositionSlice = PositionSliceState & PositionSliceActions

// ============ 辅助：数组转 idList + map ============

function toIdListAndMap(list: Order.BgaOrderPageListItem[]) {
  const idList = list.map((item) => item.id)
  const map = keyBy(
    list.map((item) => parseTradePositionInfo(item)),
    'id',
  )
  return { idList, map }
}

// ============ 工厂函数 ============

export const createPositionSlice: SliceCreator<RootStoreState, PositionSlice> = (set, get, store) => {
  let unsubscribe: Unsubscribe | undefined

  return {
    idList: [],
    map: {},
    calcCacheMap: {},
    loading: true,

    fetch: async (accountId) => {
      const token = get().user.auth.accessToken
      if (!token) return

      accountId = accountId ?? get().user.info.activeTradeAccountId
      if (!accountId) return

      const res = await getBgaOrderPage({
        current: 1,
        size: 999,
        status: TradePositionStatusEnum.BAG,
        accountId,
      })

      // 延迟关闭 loading，避免闪烁
      setTimeout(() => {
        set((state) => {
          state.trade.position.loading = false
        })
      }, 300)

      if (res.success) {
        const data = (res.data?.records || []) as Order.BgaOrderPageListItem[]
        const { idList, map } = toIdListAndMap(data)
        set((state) => {
          state.trade.position.idList = idList
          state.trade.position.map = map
        })
      }

      return res
    },

    initSubscribe: () => {
      store.subscribe(
        (state) => state.trade.position.idList,
        (idList, prevIdList) => {
          const newIdList = idList.filter((id) => !prevIdList.includes(id))
          if (newIdList.length) {
            const activeTradeAccountInfo = userInfoActiveTradeAccountInfoSelector(get())

            get().trade.position.subscribePositionMarketQuote(newIdList, activeTradeAccountInfo)
          }
        },
        { fireImmediately: true },
      )

      store.subscribe(
        (state) => state.user.info.activeTradeAccountId,
        async (accountId, prevAccountId) => {
          unsubscribe?.()
        },
      )
    },

    subscribePositionMarketQuote: (
      newIdList: string[] = [],
      accountInfo?: User.AccountItem,
      { cancel = false }: { cancel?: boolean } = {},
    ) => {
      if (newIdList.length <= 0) {
        return
      }

      const accountGroupId = accountInfo?.accountGroupId
      if (!accountGroupId) {
        return
      }

      const positionInfos = Array.from(new Set(newIdList))
        .map<TradePositionInfo | undefined>((id) => {
          const position = createPositionItemSelector(id)(get())
          const positionInfo = parseTradePositionInfo(position)

          if (!positionInfo?.symbol) return

          return positionInfo
        })
        .filter((item) => !!item)

      const ws = MulletWS.getInstance()
      const topics = positionInfos.map((positionInfo) => {
        const orderTopic = [`/${DEFAULT_TENANT_ID}/symbol/${positionInfo.symbol}/${accountGroupId}`]

        const profitCurrency = positionInfo.conf?.profitCurrency
        const userUnit = accountInfo.currencyUnit

        const simpleMap = marketSymbolSimpleMapSelector(get())

        const divName = `${userUnit}${profitCurrency}`.toUpperCase()
        const mulName = `${profitCurrency}${userUnit}`.toUpperCase()

        const simpleInfo = simpleMap[divName] || simpleMap[mulName]

        if (simpleInfo) {
          orderTopic.push(`/${DEFAULT_TENANT_ID}/symbol/${simpleInfo.symbol}/${accountGroupId}`)
        }

        return orderTopic
      })

      unsubscribe = ws.subscribe(topics)
    },

    update: (list) => {
      const { idList, map } = toIdListAndMap(list)
      set((state) => {
        state.trade.position.idList = idList
        state.trade.position.map = map
      })
    },

    reset: () => {
      set((state) => {
        state.trade.position.idList = []
        state.trade.position.map = {}
        state.trade.position.loading = true
      })
    },

    setCalcCache: (list) => {
      set((state) => {
        for (const item of list) {
          state.trade.position.calcCacheMap[item.id] = parseTradePositionInfo(item)
        }
      })
    },

    setLoading: (loading) => {
      set((state) => {
        state.trade.position.loading = loading
      })
    },
  }
}
// ============ Selectors ============

/** 持仓 ID 列表（用于 FlatList 遍历） */
export const tradePositionIdListSelector = (s: RootStoreState) => s.trade.position.idList

/** 持仓 Map */
export const tradePositionMapSelector = (s: RootStoreState) => s.trade.position.map

/** 工厂：根据 id 查找单个持仓（用于 item 精准订阅） */
export const createPositionItemSelector =
  (id?: string) =>
  (s: RootStoreState): Order.BgaOrderPageListItem | undefined =>
    id ? s.trade.position.map[id] : undefined

/** 加载状态 */
export const tradePositionLoadingSelector = (s: RootStoreState) => s.trade.position.loading

/** 持仓数量（原始值，无需 useShallow） */
export const tradePositionCountSelector = (s: RootStoreState) => s.trade.position.idList.length

/** 兼容：从 map 还原完整列表（给需要完整列表的场景用，如 account-card） */
export const tradePositionListSelector = selectorMemoize((s: RootStoreState) =>
  s.trade.position.idList.map((id) => s.trade.position.map[id]).filter(Boolean),
)
