import { msg } from "@lingui/core/macro"
import { EnumOption, getEnumOption } from "../enum"

/**
 * 出入金事件类型枚举
 */
export enum DepositEventTypeEnum {
  /** 检测到入金 */
  DEPOSIT_DETECTED = 'deposit_detected',
  /** 入金跨链开始 */
  DEPOSIT_BRIDGE_STARTED = 'deposit_bridge_started',
  /** 入金 Swap 开始 */
  DEPOSIT_SWAP_STARTED = 'deposit_swap_started',
  /** 入金到账完成 */
  DEPOSIT_COMPLETED = 'deposit_completed',
  /** 出金发起 */
  WITHDRAWAL_INITIATED = 'withdrawal_initiated',
  /** 出金跨链开始 */
  WITHDRAWAL_BRIDGE_STARTED = 'withdrawal_bridge_started',
  /** 出金 Swap 开始 */
  WITHDRAWAL_SWAP_STARTED = 'withdrawal_swap_started',
  /** 出金完成 */
  WITHDRAWAL_COMPLETED = 'withdrawal_completed',
  /** 余额更新 */
  BALANCE_UPDATED = 'balance_updated',
  /** 交易功能开启 */
  TRADING_ENABLED = 'trading_enabled',
  /** 交易功能关闭 */
  TRADING_DISABLED = 'trading_disabled',
  /** 异常事件 */
  ANOMALY_DETECTED = 'anomaly_detected',
}

/**
 * 出入金事件类型选项
 */
export const DEPOSIT_EVENT_TYPE_ENUM_OPTIONS: EnumOption<DepositEventTypeEnum>[] = [
  { label: msg`检测到入金`, value: DepositEventTypeEnum.DEPOSIT_DETECTED },
  { label: msg`入金跨链开始`, value: DepositEventTypeEnum.DEPOSIT_BRIDGE_STARTED },
  { label: msg`入金 Swap 开始`, value: DepositEventTypeEnum.DEPOSIT_SWAP_STARTED },
  { label: msg`入金到账完成`, value: DepositEventTypeEnum.DEPOSIT_COMPLETED },
  { label: msg`出金发起`, value: DepositEventTypeEnum.WITHDRAWAL_INITIATED },
  { label: msg`出金跨链开始`, value: DepositEventTypeEnum.WITHDRAWAL_BRIDGE_STARTED },
  { label: msg`出金 Swap 开始`, value: DepositEventTypeEnum.WITHDRAWAL_SWAP_STARTED },
  { label: msg`出金完成`, value: DepositEventTypeEnum.WITHDRAWAL_COMPLETED },
  { label: msg`余额更新`, value: DepositEventTypeEnum.BALANCE_UPDATED },
  { label: msg`交易功能开启`, value: DepositEventTypeEnum.TRADING_ENABLED },
  { label: msg`交易功能关闭`, value: DepositEventTypeEnum.TRADING_DISABLED },
  { label: msg`异常事件`, value: DepositEventTypeEnum.ANOMALY_DETECTED },
]

/**
 * 获取出入金事件类型选项
 */
export const getDepositEventTypeEnumOption = (option: Partial<EnumOption<DepositEventTypeEnum>>) => {
  return getEnumOption(DEPOSIT_EVENT_TYPE_ENUM_OPTIONS, option)
}
