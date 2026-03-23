import { parseTradeDirectionInfo, parseTradeOrderCreateTypeInfo } from '@/helpers/parse/trade'
import { OrderCreateTypeEnum, OrderTypeEnum } from '@/options/trade/order'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { t } from '@lingui/core/macro'
import { BNumber } from '@mullet/utils/number'

export type BuildOrderParamsInput = {
  accountId?: string
  symbol?: string
  direction: TradePositionDirectionEnum
  amount: string
  orderType: OrderCreateTypeEnum
  limitPrice?: string
  slPrice: string
  tpPrice: string
  hasTpSl: boolean
  marginType: Order.CreateOrder['marginType']
}

/**
 * 将表单数据转换为下单接口参数
 *
 * 纯函数，便于在提交下单和计算保证金两处复用
 * 抛出错误时由调用方处理
 */
export const buildOrderParams = (input: BuildOrderParamsInput): Order.CreateOrder => {
  const { accountId, symbol, direction, amount, orderType, limitPrice, slPrice, tpPrice, hasTpSl, marginType } = input

  if (!symbol) throw new Error(t`交易品种信息不存在`)
  if (!accountId) throw new Error(t`交易账户信息不存在`)

  const { isBuy } = parseTradeDirectionInfo(direction)
  const orderTypeInfo = parseTradeOrderCreateTypeInfo(orderType)

  const orderTypeMap: Record<OrderCreateTypeEnum, OrderTypeEnum> = {
    [OrderCreateTypeEnum.MARKET_ORDER]: OrderTypeEnum.MARKET_ORDER,
    [OrderCreateTypeEnum.LIMIT_ORDER]: isBuy ? OrderTypeEnum.LIMIT_BUY_ORDER : OrderTypeEnum.LIMIT_SELL_ORDER,
    [OrderCreateTypeEnum.STOP_LIMIT_ORDER]: isBuy
      ? OrderTypeEnum.STOP_LOSS_MARKET_BUY_ORDER
      : OrderTypeEnum.STOP_LOSS_MARKET_SELL_ORDER,
  }

  const type = orderTypeMap[orderType]
  if (!type) throw new Error(t`订单类型不存在`)

  const params: Order.CreateOrder = {
    tradeAccountId: accountId,
    symbol,
    buySell: direction,
    orderVolume: amount,
    type,
    marginType,
  }

  if (!orderTypeInfo.isMarket) {
    if (!BNumber.from(limitPrice)?.gt(0)) {
      throw new Error(t`请输入价格`)
    }

    params.limitPrice = limitPrice
  }

  if (hasTpSl) {
    if (BNumber.from(tpPrice).gt(0)) {
      params.takeProfit = BNumber.from(tpPrice).toNumber()
    }
    if (BNumber.from(slPrice).gt(0)) {
      params.stopLoss = BNumber.from(slPrice).toNumber()
    }
  }

  return params
}
