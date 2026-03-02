import { msg } from "@lingui/core/macro"
import { EnumOption, getEnumOption } from "@/options/enum"

// ============ 持仓单状态 ============

export enum TradePositionStatusEnum {
  BAG = 'BAG',
  FINISH = 'FINISH',
}

export const TRADE_POSITION_STATUS_ENUM_OPTIONS: EnumOption<TradePositionStatusEnum>[] = [
  { label: msg`持仓中`, value: TradePositionStatusEnum.BAG },
  { label: msg`已完成`, value: TradePositionStatusEnum.FINISH },
]

export const getTradePositionStatusEnumOption = (option: Partial<EnumOption<TradePositionStatusEnum>>) => {
  return getEnumOption(TRADE_POSITION_STATUS_ENUM_OPTIONS, option)
}

// ============ 交易方向 ============

export enum TradePositionDirectionEnum {
  /** 买入/做多 */
  BUY = 'BUY',
  /** 卖出/做空 */
  SELL = 'SELL',
}

export const TRADE_POSITION_DIRECTION_ENUM_OPTIONS: EnumOption<TradePositionDirectionEnum>[] = [
  { label: msg`做多`, value: TradePositionDirectionEnum.BUY },
  { label: msg`做空`, value: TradePositionDirectionEnum.SELL },
]

export const getTradePositionDirectionEnumOption = (option: Partial<EnumOption<TradePositionDirectionEnum>>) => {
  return getEnumOption(TRADE_POSITION_DIRECTION_ENUM_OPTIONS, option)
}

