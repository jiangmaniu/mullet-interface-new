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
