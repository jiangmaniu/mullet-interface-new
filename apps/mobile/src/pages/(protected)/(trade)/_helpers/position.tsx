import { cloneDeep } from 'lodash-es'

import { parseSymbolLotsVolScale } from '@/helpers/symbol'
import { OrderMarginTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { Order } from '@/services/tradeCore/order/typings'
import { BNumberValue } from '@mullet/utils/number'

export type TradePositionInfo = Order.BgaOrderPageListItem & {
  isBuy: boolean
  isSell: boolean
  lotsVolScale?: number
  direction?: TradePositionDirectionEnum
  marginByType?: number
  amount?: BNumberValue
}

export function parseTradePositionInfo(position: Order.BgaOrderPageListItem): TradePositionInfo
export function parseTradePositionInfo(position?: Order.BgaOrderPageListItem): TradePositionInfo | undefined
export function parseTradePositionInfo(position?: Order.BgaOrderPageListItem): TradePositionInfo | undefined {
  if (!position) return
  const isBuy = position.buySell === TradePositionDirectionEnum.BUY
  const isSell = position.buySell === TradePositionDirectionEnum.SELL
  const direction = position.buySell
  const lotsVolScale = parseSymbolLotsVolScale(position.conf)
  const marginByType =
    position?.marginType === OrderMarginTypeEnum.CROSS_MARGIN ? position?.orderBaseMargin : position?.orderMargin
  const amount = position.orderVolume

  const info: TradePositionInfo = {
    // ...cloneDeep(position),
    ...position,
    isBuy,
    isSell,
    direction,
    lotsVolScale,
    marginByType,
    amount,
  }

  return info
}
