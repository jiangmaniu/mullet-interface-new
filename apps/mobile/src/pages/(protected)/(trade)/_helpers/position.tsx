import { parseSymbolLotsVolScale } from '@/helpers/symbol'
import { OrderMarginTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { Order } from '@/v1/services/tradeCore/order/typings'

export type TradePositionInfo = Order.BgaOrderPageListItem & {
  isBuy: boolean
  isSell: boolean
  lotsVolScale?: number
  direction?: TradePositionDirectionEnum
  marginByType?: number
}

export const parseTradePositionInfo = (position: Order.BgaOrderPageListItem) => {
  const isBuy = position.buySell === TradePositionDirectionEnum.BUY
  const isSell = position.buySell === TradePositionDirectionEnum.SELL
  const direction = position.buySell
  const lotsVolScale = parseSymbolLotsVolScale(position.conf)
  const marginByType =
    position?.marginType === OrderMarginTypeEnum.CROSS_MARGIN ? position?.orderBaseMargin : position?.orderMargin

  const info: TradePositionInfo = {
    ...position,
    isBuy,
    isSell,
    direction,
    lotsVolScale,
    marginByType,
  }

  return info
}
