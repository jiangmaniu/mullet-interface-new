import { BNumber, BNumberValue } from '@mullet/utils/number'

// ============ 逐仓净值（Isolated Balance） ============

/** 逐仓净值入参 */
export type CalcIsolatedBalanceParams = {
  /** 订单保证金 */
  orderMargin?: BNumberValue
  /** 库存费 */
  interestFees?: BNumberValue
  /** 手续费 */
  handlingFees?: BNumberValue
  /** 浮动盈亏 */
  profit?: BNumberValue
}

/**
 * 计算逐仓净值
 *
 * 公式：
 *   isolatedBalance = orderMargin + interestFees + handlingFees + profit
 */
export const calcIsolatedBalance = (params?: CalcIsolatedBalanceParams): string | undefined => {
  if (!params) return undefined
  const { orderMargin, interestFees = 0, handlingFees = 0, profit = 0 } = params

  if (orderMargin === undefined) return undefined

  const balance = BNumber.from(orderMargin)?.plus(interestFees).plus(handlingFees).plus(profit)

  return balance?.toFixed()
}
