import { parseSymbolLotsVolScale } from "@/helpers/symbol"
import { TradePositionDirectionEnum } from "@/options/trade/position"
import { Order } from "@/v1/services/tradeCore/order/typings"

export type TradePendingOrderInfo = Order.OrderPageListItem & {
  isBuy: boolean
  isSell: boolean

  /** 手数小数位 */
  lotsVolScale?: number
}

export const parseTradePendingOrderInfo = (order: Order.OrderPageListItem) => {
  const isBuy = order.buySell === TradePositionDirectionEnum.BUY
  const isSell = order.buySell === TradePositionDirectionEnum.SELL
  const lotsVolScale = parseSymbolLotsVolScale(order.conf)

  const info: TradePendingOrderInfo = {
    ...order,
    isBuy,
    isSell,

    lotsVolScale
  }

  return info
}
