import { msg } from '@lingui/core/macro'

import { EnumOption, getEnumOption } from '../enum'

/**
 * 入金状态枚举
 */
export enum DepositStatusEnum {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const DEPOSIT_STATUS_ENUM_OPTIONS: EnumOption<DepositStatusEnum>[] = [
  { label: msg`待处理`, value: DepositStatusEnum.PENDING },
  { label: msg`确认中`, value: DepositStatusEnum.CONFIRMING },
  { label: msg`已完成`, value: DepositStatusEnum.COMPLETED },
  { label: msg`失败`, value: DepositStatusEnum.FAILED },
]

export const getDepositStatusEnumOption = (option: NilablePartial<EnumOption<DepositStatusEnum>>) => {
  return getEnumOption(DEPOSIT_STATUS_ENUM_OPTIONS, option)
}

/**
 * 出金状态枚举
 */
export enum WithdrawalStatusEnum {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const WITHDRAWAL_STATUS_ENUM_OPTIONS: EnumOption<WithdrawalStatusEnum>[] = [
  { label: msg`待处理`, value: WithdrawalStatusEnum.PENDING },
  { label: msg`已提交`, value: WithdrawalStatusEnum.SUBMITTED },
  { label: msg`处理中`, value: WithdrawalStatusEnum.PROCESSING },
  { label: msg`已完成`, value: WithdrawalStatusEnum.COMPLETED },
  { label: msg`失败`, value: WithdrawalStatusEnum.FAILED },
]

export const getWithdrawalStatusEnumOption = (option: NilablePartial<EnumOption<WithdrawalStatusEnum>>) => {
  return getEnumOption(WITHDRAWAL_STATUS_ENUM_OPTIONS, option)
}

/**
 * 资金转移状态枚举（MoneyTransfer 接口）
 */
export enum MoneyTransferStatusEnum {
  CREATE = 'CREATE',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  RETURN = 'RETURN',
}

export const MONEY_TRANSFER_STATUS_ENUM_OPTIONS: EnumOption<MoneyTransferStatusEnum>[] = [
  { label: msg`待处理`, value: MoneyTransferStatusEnum.CREATE },
  { label: msg`成功`, value: MoneyTransferStatusEnum.SUCCESS },
  { label: msg`失败`, value: MoneyTransferStatusEnum.FAIL },
  { label: msg`已退回`, value: MoneyTransferStatusEnum.RETURN },
]

export const getMoneyTransferStatusEnumOption = (option: NilablePartial<EnumOption<MoneyTransferStatusEnum>>) => {
  return getEnumOption(MONEY_TRANSFER_STATUS_ENUM_OPTIONS, option)
}
