import { BNumber, BNumberValue } from '@mullet/utils/number'

// ============ 账户净值（Net Assets / Balance） ============

/** 账户净值入参 */
export type CalcAccountNetAssetsParams = {
  /** 账户余额 */
  money?: BNumberValue
  /** 账户总盈亏 */
  totalPnl?: BNumberValue
}

/**
 * 计算账户净值（Net Assets）
 *
 * 公式：
 *   netAssets = money + totalPnl
 */
export const calcAccountNetAssets = (params?: CalcAccountNetAssetsParams): string | undefined => {
  if (!params) return undefined
  const { money, totalPnl } = params

  if (money === undefined) return undefined

  const netAssets = BNumber.from(money)?.plus(totalPnl ?? 0)

  return netAssets?.toFixed()
}

// ============ 账户占用保证金（Occupied Margin） ============

/** 占用保证金入参 */
export type CalcAccountOccupiedMarginParams = {
  /** 全仓保证金 */
  margin?: BNumberValue
  /** 逐仓保证金 */
  isolatedMargin?: BNumberValue
}

/**
 * 计算账户占用保证金
 *
 * 公式：
 *   occupiedMargin = margin + isolatedMargin
 */
export const calcAccountOccupiedMargin = (params?: CalcAccountOccupiedMarginParams): string | undefined => {
  if (!params) return undefined
  const { margin = 0, isolatedMargin = 0 } = params

  const occupiedMargin = BNumber.from(margin)?.plus(isolatedMargin)

  return occupiedMargin?.toFixed()
}

// ============ 账户可用保证金（Available Margin） ============

/** 可用保证金入参 */
export type CalcAccountAvailableMarginParams = {
  /** 账户余额 */
  money?: BNumberValue
  /** 占用保证金 */
  occupiedMargin?: BNumberValue
  /** 账户总盈亏 */
  totalPnl?: BNumberValue
  /** 是否计入未实现盈亏（PROFIT_LOSS 模式） */
  includePnl?: boolean
}

/**
 * 计算账户可用保证金（Available Margin）
 *
 * 公式：
 *   availableMargin = money - occupiedMargin
 *   若 includePnl 为 true：
 *     availableMargin = money - occupiedMargin + totalPnl
 */
export const calcAccountAvailableMargin = (params?: CalcAccountAvailableMarginParams): string | undefined => {
  if (!params) return undefined
  const { money, occupiedMargin = 0, totalPnl = 0, includePnl = false } = params

  if (money === undefined) return undefined

  let availableMargin = BNumber.from(money)?.minus(occupiedMargin)

  // 账户组设置"可用计算未实现盈亏"时，加上总盈亏
  if (includePnl && availableMargin) {
    availableMargin = availableMargin.plus(totalPnl)
  }

  return availableMargin?.toFixed()
}
