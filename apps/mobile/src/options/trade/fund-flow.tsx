import { msg } from "@lingui/core/macro"
import { EnumOption, getEnumOption } from "@/options/enum"

// ============ 资金变更记录类型 ============

export enum TradeFundFlowTypeEnum {
  /** 充值 */
  DEPOSIT = 'DEPOSIT',
  /** 充值(模拟) */
  DEPOSIT_SIMULATE = 'DEPOSIT_SIMULATE',
  /** 提现 */
  WITHDRAWAL = 'WITHDRAWAL',
  /** 保证金 */
  MARGIN = 'MARGIN',
  /** 盈亏 */
  PROFIT = 'PROFIT',
  /** 结余 */
  BALANCE = 'BALANCE',
  /** 划转 */
  TRANSFER = 'TRANSFER',
  /** 手续费 */
  HANDLING_FEES = 'HANDLING_FEES',
  /** 库存费 */
  INTEREST_FEES = 'INTEREST_FEES',
  /** 手续费 */
  FEE = 'FEE',
  /** 首充活动 */
  ACTIVITY = 'ACTIVITY',
  /** 赠金 */
  GIFT = 'GIFT',
  /** 跟单分润 */
  FOLLOW_PROFIT = 'FOLLOW_PROFIT',
  /** 归零 */
  ZERO = 'ZERO',
}

export const TRADE_FUND_FLOW_TYPE_ENUM_OPTIONS: EnumOption<TradeFundFlowTypeEnum>[] = [
  { label: msg`充值`, value: TradeFundFlowTypeEnum.DEPOSIT },
  { label: msg`模拟充值`, value: TradeFundFlowTypeEnum.DEPOSIT_SIMULATE },
  { label: msg`提现`, value: TradeFundFlowTypeEnum.WITHDRAWAL },
  { label: msg`保证金`, value: TradeFundFlowTypeEnum.MARGIN },
  { label: msg`盈亏`, value: TradeFundFlowTypeEnum.PROFIT },
  { label: msg`结余`, value: TradeFundFlowTypeEnum.BALANCE },
  { label: msg`转账`, value: TradeFundFlowTypeEnum.TRANSFER },
  { label: msg`手续费`, value: TradeFundFlowTypeEnum.HANDLING_FEES },
  { label: msg`库存费`, value: TradeFundFlowTypeEnum.INTEREST_FEES },
  { label: msg`手续费`, value: TradeFundFlowTypeEnum.FEE },
  { label: msg`首充活动`, value: TradeFundFlowTypeEnum.ACTIVITY },
  { label: msg`赠金`, value: TradeFundFlowTypeEnum.GIFT },
  { label: msg`跟单分润`, value: TradeFundFlowTypeEnum.FOLLOW_PROFIT },
  { label: msg`归零`, value: TradeFundFlowTypeEnum.ZERO },
]

export const getTradeFundFlowTypeEnumOption = (option: Partial<EnumOption<TradeFundFlowTypeEnum>>) => {
  return getEnumOption(TRADE_FUND_FLOW_TYPE_ENUM_OPTIONS, option)
}
