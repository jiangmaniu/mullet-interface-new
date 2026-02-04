import { DEFAULT_CURRENCY_DECIMAL } from '@/constants'
import { formatNum } from '.'

// 入金：手续费计算
export const countHandingFee = (value: any, methodInfo?: Wallet.fundsMethodPageListItem) => {
  if (!methodInfo) return 0

  const { userSingleLeastFee, userTradePercentageFee, userSingleFixedFee } = methodInfo || {}

  let val = Number(value) || 0

  // 手續費：單筆最低手續費 或 入金金額 * 交易百分比手續費 + 單筆固定手續費
  const fee = Math.max(userSingleLeastFee || 0, val * (userTradePercentageFee || 0) * 0.01 + (userSingleFixedFee || 0) || 0)

  return fee
}

export const transferHandlingFee = (value: any, methodInfo?: Wallet.fundsMethodPageListItem) => {
  if (!methodInfo) return 0

  let val = Number(value) || 0

  const fee = countHandingFee(val, methodInfo)

  return formatNum(fee, { precision: DEFAULT_CURRENCY_DECIMAL })
}

// 入金匯差
export const depositExchangeRate = (methodInfo?: Wallet.fundsMethodPageListItem) => {
  if (!methodInfo) return 0

  const { exchangeRate, userExchangeDifferencePercentage } = methodInfo || {}

  // 匯率： 平台匯率 + 匯差百分比
  return (exchangeRate || 1.0) * (1 + (userExchangeDifferencePercentage || 0) * 0.01)
}

// 入金：實際到賬汇率换算
export const depositTransferCurr = (value: any, methodInfo?: Wallet.fundsMethodPageListItem) => {
  if (!methodInfo) return 0

  const _exchangeRate = depositExchangeRate(methodInfo)

  let val = Number(value) || 0

  // 手續費：單筆最低手續費 或 入金金額 * 交易百分比手續費 + 單筆固定手續費
  const fee = countHandingFee(val, methodInfo)

  val = (val + fee) * _exchangeRate

  return formatNum(val, { precision: DEFAULT_CURRENCY_DECIMAL })
}

// 出金汇差
export const withdrawExchangeRate = (methodInfo?: Wallet.fundsMethodPageListItem) => {
  if (!methodInfo) return 0

  const { exchangeRate, userExchangeDifferencePercentage } = methodInfo || {}

  return (exchangeRate || 1.0) * (1 - (userExchangeDifferencePercentage || 0) * 0.01)
}

// 出金：實際到賬汇率换算
export const withdrawCountTransferCurr = (value: any, methodInfo?: Wallet.fundsMethodPageListItem) => {
  if (!methodInfo) return 0

  let val = Number(value) || 0

  // 匯率： 平台匯率 - 匯差百分比
  const _exchangeRate = withdrawExchangeRate(methodInfo)

  // 手續費：單筆最低手續費 或 入金金額 * 交易百分比手續費 + 單筆固定手續費
  const fee = countHandingFee(val, methodInfo)

  val = (val - fee) * _exchangeRate

  return Number(val.toFixed(DEFAULT_CURRENCY_DECIMAL))
}

// 出金：實際到賬汇率换算
export const withdrawTransferCurr = (value: number, methodInfo?: Wallet.fundsMethodPageListItem) => {
  return formatNum(withdrawCountTransferCurr(value, methodInfo), { precision: DEFAULT_CURRENCY_DECIMAL })
}

export const formatBankCard = (card: string) => {
  return card.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1-')
}
