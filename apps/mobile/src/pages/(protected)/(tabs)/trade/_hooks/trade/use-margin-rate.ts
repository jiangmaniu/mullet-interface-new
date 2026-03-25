import { calcAccountNetAssets } from '@/helpers/calc/account'
import { calcIsolatedBalance } from '@/helpers/calc/force-close'
import { calcCrossMarginRate, calcIsolatedMarginRate, CalcMarginRateResult } from '@/helpers/calc/margin-rate'
import { BNumber, BNumberValue } from '@mullet/utils/number'

// ============ 逐仓保证金率 业务封装 ============

/** 获取逐仓保证金率入参 */
export type GetIsolatedMarginRateParams = {
  /** 订单保证金 */
  orderMargin?: BNumberValue
  /** 基础保证金 */
  orderBaseMargin?: BNumberValue
  /** 库存费 */
  interestFees?: BNumberValue
  /** 手续费 */
  handlingFees?: BNumberValue
  /** 浮动盈亏 */
  profit?: BNumberValue
}

/**
 * 获取逐仓保证金率（方法版本）
 *
 * 公式：
 *   isolatedBalance = orderMargin + interestFees + handlingFees + profit
 *   marginRate = (isolatedBalance / orderBaseMargin) × 100
 */
export const getIsolatedMarginRate = (params?: GetIsolatedMarginRateParams): CalcMarginRateResult | undefined => {
  if (!params) return undefined
  const { orderMargin, orderBaseMargin, interestFees, handlingFees, profit } = params

  const isolatedBalance = calcIsolatedBalance({
    orderMargin,
    interestFees,
    handlingFees,
    profit,
  })

  return calcIsolatedMarginRate({
    isolatedBalance,
    orderBaseMargin,
  })
}

// ============ 全仓保证金率 业务封装 ============

/** 逐仓仓位信息（用于计算逐仓净值之和） */
export type IsolatedPositionItem = {
  /** 订单保证金 */
  orderMargin?: BNumberValue
  /** 库存费 */
  interestFees?: BNumberValue
  /** 手续费 */
  handlingFees?: BNumberValue
  /** 浮动盈亏 */
  profit?: BNumberValue
}

/** 获取全仓保证金率入参 */
export type GetCrossMarginRateParams = {
  /** 账户余额 */
  money?: BNumberValue
  /** 全仓占用保证金（accountInfo.margin） */
  crossOccupiedMargin?: BNumberValue
  /** 账户总盈亏 */
  totalPnl?: BNumberValue
  /** 所有逐仓仓位列表（用于计算逐仓净值之和） */
  isolatedPositionList?: IsolatedPositionItem[]
}

/**
 * 获取全仓保证金率（方法版本）
 *
 * 公式：
 *   accountNetAssets = money + totalPnl
 *   isolatedTotal = Σ(orderMargin + interestFees + handlingFees + profit)
 *   crossBalance = accountNetAssets - isolatedTotal
 *   marginRate = (crossBalance / crossOccupiedMargin) × 100
 */
export const getCrossMarginRate = (params?: GetCrossMarginRateParams): CalcMarginRateResult | undefined => {
  if (!params) return undefined
  const { money, crossOccupiedMargin, totalPnl, isolatedPositionList } = params

  // 1. 计算账户总净值
  const accountNetAssets = calcAccountNetAssets({ money, totalPnl })

  if (!accountNetAssets) return undefined

  // 2. 计算所有逐仓净值之和
  let isolatedTotal = BNumber.from(0)
  if (isolatedPositionList?.length) {
    for (const pos of isolatedPositionList) {
      const posBalance = calcIsolatedBalance({
        orderMargin: pos.orderMargin,
        interestFees: pos.interestFees,
        handlingFees: pos.handlingFees,
        profit: pos.profit,
      })
      if (posBalance) {
        isolatedTotal = isolatedTotal?.plus(posBalance)
      }
    }
  }

  // 3. crossBalance = accountNetAssets - isolatedTotal
  const crossBalance = BNumber.from(accountNetAssets)?.minus(isolatedTotal ?? 0)

  return calcCrossMarginRate({
    crossBalance: crossBalance?.toFixed(),
    crossOccupiedMargin,
  })
}
