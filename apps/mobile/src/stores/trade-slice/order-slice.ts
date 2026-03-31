import { keyBy } from 'lodash-es'
import type { SliceCreator } from '../_helpers/types'
import type { RootStoreState } from '../index'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import MulletWS from '@/lib/ws/mullet-ws'
import { Unsubscribe } from '@/lib/ws/types'
import { parseTradePendingOrderInfo, TradePendingOrderInfo } from '@/pages/(protected)/(trade)/_helpers/pending-order'
import { getOrderPage } from '@/services/tradeCore/order'
import { Order } from '@/services/tradeCore/order/typings'

import { marketSymbolSimpleMapSelector } from '../market-slice/symbol-slice'
import { userInfoActiveTradeAccountInfoSelector } from '../user-slice/infoSlice'

// ============ 状态 & Actions 类型 ============

export interface OrderSliceState {
  /** 挂单 ID 列表（保持顺序） */
  idList: string[]
  /** 挂单 Map（以 id 为 key） */
  map: Record<string, Order.OrderPageListItem>
  /** 加载状态 */
  loading: boolean
}

export interface OrderSliceActions {
  /** HTTP 拉取挂单列表 */
  fetch: (accountId?: string) => Promise<void>
  /** WebSocket 推送更新 */
  update: (list: Order.OrderPageListItem[]) => void
  /** 切换账户时清空数据 */
  reset: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 订阅订单的行情 */
  subscribeOrderMarketQuote: (
    orderIdList?: string[],
    accountInfo?: User.AccountItem,
    option?: { cancel?: boolean },
  ) => void
}

export type OrderSlice = OrderSliceState & OrderSliceActions

// ============ 辅助：数组转 idList + map ============

function toIdListAndMap(list: Order.OrderPageListItem[]) {
  const idList = list.map((item) => String(item.id))
  const map = keyBy(list, 'id')
  return { idList, map }
}

// ============ 工厂函数 ============

export const createOrderSlice: SliceCreator<RootStoreState, OrderSlice> = (set, get, store) => {
  let unsubscribe: Unsubscribe | undefined

  return {
    idList: [],
    map: {},
    loading: false,

    fetch: async (accountId) => {
      try {
        accountId = accountId ?? get().user.info.activeTradeAccountId
        if (!accountId) return

        if (get().trade.order.idList.length <= 0) {
          set((state) => {
            state.trade.order.loading = true
          })
        }

        const res = await getOrderPage({
          current: 1,
          size: 999,
          status: 'ENTRUST',
          type: 'LIMIT_BUY_ORDER,LIMIT_SELL_ORDER,STOP_LOSS_LIMIT_BUY_ORDER,STOP_LOSS_LIMIT_SELL_ORDER,STOP_LOSS_MARKET_BUY_ORDER,STOP_LOSS_MARKET_SELL_ORDER',
          accountId,
        })

        if (res.success) {
          const data = (res.data?.records || []) as Order.OrderPageListItem[]
          const { idList, map } = toIdListAndMap(data)
          set((state) => {
            state.trade.order.idList = idList
            state.trade.order.map = map
          })
        }
      } finally {
        // 延迟关闭 loading，避免闪烁
        setTimeout(() => {
          set((state) => {
            state.trade.order.loading = false
          })
        }, 300)
      }
    },

    initSubscribe: () => {
      store.subscribe(
        (state) => state.trade.order.idList,
        (idList, prevIdList) => {
          const newIdList = idList.filter((id) => !prevIdList.includes(id))
          const activeTradeAccountInfo = userInfoActiveTradeAccountInfoSelector(get())
          get().trade.order.subscribeOrderMarketQuote(newIdList, activeTradeAccountInfo)
        },
        { fireImmediately: true },
      )

      store.subscribe(
        (state) => state.user.info.activeTradeAccountId,
        async (accountId, prevAccountId) => {
          unsubscribe?.()
          unsubscribe = undefined

          if (accountId) {
            get().trade.order.fetch(accountId)
          }
        },
        { fireImmediately: true },
      )
    },

    subscribeOrderMarketQuote: (
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

      const orderInfoList = Array.from(new Set(newIdList))
        .map<TradePendingOrderInfo | undefined>((id) => {
          const order = createOrderItemSelector(id)(get())
          const orderInfo = parseTradePendingOrderInfo(order)
          if (!orderInfo?.symbol) return

          return orderInfo
        })
        .filter((item) => !!item)

      const ws = MulletWS.getInstance()
      const topics = orderInfoList.map((orderInfo) => {
        const orderTopic = [`/${DEFAULT_TENANT_ID}/symbol/${orderInfo.symbol}/${accountGroupId}`]

        const profitCurrency = orderInfo.conf?.profitCurrency
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

      unsubscribe?.()

      unsubscribe = ws.subscribe(topics)
    },

    update: (list) => {
      const { idList, map } = toIdListAndMap(list)
      set((state) => {
        state.trade.order.idList = idList
        state.trade.order.map = map
      })
    },

    reset: () => {
      set((state) => {
        state.trade.order.idList = []
        state.trade.order.map = {}
        state.trade.order.loading = false
      })
    },

    setLoading: (loading) => {
      set((state) => {
        state.trade.order.loading = loading
      })
    },
  }
}

// ============ Selectors ============

/** 挂单 ID 列表（用于 FlatList 遍历） */
export const tradeOrderIdListSelector = (s: RootStoreState) => s.trade.order.idList

/** 挂单 Map */
export const tradeOrderMapSelector = (s: RootStoreState) => s.trade.order.map

/** 工厂：根据 id 查找单个挂单（用于 item 精准订阅） */
export const createOrderItemSelector = (id: string) => (s: RootStoreState) => s.trade.order.map[id]

/** 加载状态 */
export const tradeOrderLoadingSelector = (s: RootStoreState) => s.trade.order.loading

/** 挂单数量（原始值，无需 useShallow） */
export const tradeOrderCountSelector = (s: RootStoreState) => s.trade.order.idList.length

/** 兼容：从 map 还原完整列表 */
export const tradeOrderListSelector = (s: RootStoreState) =>
  s.trade.order.idList.map((id) => s.trade.order.map[id]).filter(Boolean)
