import { msg } from "@lingui/core/macro"
import { EnumOption, getEnumOption } from "@/options/enum"

// ============ 订单状态 ============

export enum OrderStatusEnum {
  CANCEL = 'CANCEL',
  ENTRUST = 'ENTRUST',
  FAIL = 'FAIL',
  FINISH = 'FINISH',
}

export const ORDER_STATUS_ENUM_OPTIONS: EnumOption<OrderStatusEnum>[] = [
  { label: msg`委托中`, value: OrderStatusEnum.ENTRUST },
  { label: msg`失败`, value: OrderStatusEnum.FAIL },
  { label: msg`已完成`, value: OrderStatusEnum.FINISH },
  { label: msg`已取消`, value: OrderStatusEnum.CANCEL },
]

export const getOrderStatusEnumOption = (option: Partial<EnumOption<OrderStatusEnum>>) => {
  return getEnumOption(ORDER_STATUS_ENUM_OPTIONS, option)
}

// ============ 订单类型 ============

export enum OrderTypeEnum {
  MARKET_ORDER = 'MARKET_ORDER',
  STOP_LOSS_ORDER = 'STOP_LOSS_ORDER',
  TAKE_PROFIT_ORDER = 'TAKE_PROFIT_ORDER',
  LIMIT_BUY_ORDER = 'LIMIT_BUY_ORDER',
  LIMIT_SELL_ORDER = 'LIMIT_SELL_ORDER',
  STOP_LOSS_LIMIT_BUY_ORDER = 'STOP_LOSS_LIMIT_BUY_ORDER',
  STOP_LOSS_LIMIT_SELL_ORDER = 'STOP_LOSS_LIMIT_SELL_ORDER',
  STOP_LOSS_MARKET_BUY_ORDER = 'STOP_LOSS_MARKET_BUY_ORDER',
  STOP_LOSS_MARKET_SELL_ORDER = 'STOP_LOSS_MARKET_SELL_ORDER',
}

export const ORDER_TYPE_ENUM_OPTIONS: EnumOption<OrderTypeEnum>[] = [
  { label: msg`市价单`, value: OrderTypeEnum.MARKET_ORDER },
  { label: msg`止损单`, value: OrderTypeEnum.STOP_LOSS_ORDER },
  { label: msg`止盈单`, value: OrderTypeEnum.TAKE_PROFIT_ORDER },
  { label: msg`限价买入单`, value: OrderTypeEnum.LIMIT_BUY_ORDER },
  { label: msg`限价卖出单`, value: OrderTypeEnum.LIMIT_SELL_ORDER },
  { label: msg`止损限价买入单`, value: OrderTypeEnum.STOP_LOSS_LIMIT_BUY_ORDER },
  { label: msg`止损限价卖出单`, value: OrderTypeEnum.STOP_LOSS_LIMIT_SELL_ORDER },
  { label: msg`止损市价买入单`, value: OrderTypeEnum.STOP_LOSS_MARKET_BUY_ORDER },
  { label: msg`止损市价卖出单`, value: OrderTypeEnum.STOP_LOSS_MARKET_SELL_ORDER },
]

export const getOrderTypeEnumOption = (option: Partial<EnumOption<OrderTypeEnum>>) => {
  return getEnumOption(ORDER_TYPE_ENUM_OPTIONS, option)
}

// ============ 保证金类型 ============

export enum OrderMarginTypeEnum {
  CROSS_MARGIN = 'CROSS_MARGIN',
  ISOLATED_MARGIN = 'ISOLATED_MARGIN',
}

export const ORDER_MARGIN_TYPE_ENUM_OPTIONS: EnumOption<OrderMarginTypeEnum>[] = [
  { label: msg`全仓`, value: OrderMarginTypeEnum.CROSS_MARGIN },
  { label: msg`逐仓`, value: OrderMarginTypeEnum.ISOLATED_MARGIN },
]

export const getOrderMarginTypeEnumOption = (option: Partial<EnumOption<OrderMarginTypeEnum>>) => {
  return getEnumOption(ORDER_MARGIN_TYPE_ENUM_OPTIONS, option)
}

// ============ 订单成交方向 ============

export enum OrderCompletionTypeEnum {
  IN = 'IN',
  OUT = 'OUT',
}

export const ORDER_COMPLETION_TYPE_ENUM_OPTIONS: EnumOption<OrderCompletionTypeEnum>[] = [
  { label: msg`建仓`, value: OrderCompletionTypeEnum.IN },
  { label: msg`平仓`, value: OrderCompletionTypeEnum.OUT },
]

export const getOrderCompletionTypeEnumOption = (option: Partial<EnumOption<OrderCompletionTypeEnum>>) => {
  return getEnumOption(ORDER_COMPLETION_TYPE_ENUM_OPTIONS, option)
}

