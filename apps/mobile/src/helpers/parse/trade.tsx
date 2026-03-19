import { OrderCreateTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'

/**
 * 解析交易方向
 * @param direction 交易方向
 * @returns 交易方向信息
 */
export const parseTradeDirectionInfo = (direction?: TradePositionDirectionEnum) => {
  const isBuy = TradePositionDirectionEnum.BUY === direction
  const isSell = TradePositionDirectionEnum.SELL === direction

  return {
    isBuy,
    isSell,
    direction,
  }
}

/**
 * 解析交易创建类型信息
 * @param type 交易创建类型
 * @returns 交易方向信息
 */
export const parseTradeOrderCreateTypeInfo = (type: OrderCreateTypeEnum) => {
  const isMarket = OrderCreateTypeEnum.MARKET_ORDER === type
  const isLimit = OrderCreateTypeEnum.LIMIT_ORDER === type
  const isStopLimit = OrderCreateTypeEnum.STOP_LIMIT_ORDER === type

  return {
    isMarket,
    isLimit,
    isStopLimit,
    type,
  }
}
