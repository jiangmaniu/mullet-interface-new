import { TradePositionDirectionEnum } from '@/options/trade/position'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { BNumber, BNumberValue } from '@mullet/utils/number'

import { parseTradeDirectionInfo } from '../parse/trade'

// ============ 基础盈亏计算 ============

export type CalcPnlInfoParams = {
  /** 订单方向 */
  direction?: TradePositionDirectionEnum
  /** 开仓价格 */
  openPrice?: BNumberValue
  /** TP/SL（平仓）价格 */
  closePrice?: BNumberValue
  /** TP/SL（平仓）数量 */
  amount?: BNumberValue
  /** 合约大小 默认 1 */
  contractSize?: BNumberValue
}

export type CalcPnlInfoResult = {
  /** 盈亏金额 */
  pnl?: string
  /** 是否盈利 */
  isProfit?: boolean
  /** 是否亏损 */
  isLoss?: boolean
  /** 是否盈亏平衡 */
  isPnLNoChange?: boolean
}

/**
 * 计算盈亏
 * 多：(closePrice - openPrice) * amount * contractSize
 * 空：(openPrice - closePrice) * amount * contractSize
 * @param params
 * @returns
 */
export const calcPnlInfo = (params: CalcPnlInfoParams) => {
  const { direction, openPrice, contractSize = 1, amount, closePrice } = params

  if (BNumber.from(amount)?.lte(0) || BNumber.from(openPrice)?.lte(0) || BNumber.from(closePrice)?.lte(0))
    return undefined

  const directionInfo = parseTradeDirectionInfo(direction)

  const priceDifference = directionInfo.isBuy
    ? BNumber.from(closePrice)?.minus(openPrice)?.multipliedBy(contractSize)
    : directionInfo.isSell
      ? BNumber.from(openPrice)?.minus(closePrice)?.multipliedBy(contractSize)
      : undefined

  const pnl = priceDifference?.multipliedBy(amount)

  const isProfit = !!pnl?.gt(0)
  const isLoss = !!pnl?.lt(0)
  const isPnLNoChange = !!pnl?.eq(0)

  const info: CalcPnlInfoResult = {
    pnl: pnl?.toFixed(),
    isProfit,
    isLoss,
    isPnLNoChange,
  }

  return info
}

// ============ 仓位浮动盈亏（Gross PnL） ============

/** 仓位浮动盈亏（Gross PnL）入参 */
export type CalcPositionGrossPnlInfoParams = {
  /** 仓位信息 */
  positionInfo?: {
    /** 仓位方向 */
    direction?: TradePositionDirectionEnum
    /** 开仓价格 */
    startPrice?: BNumberValue
    /** 数量 */
    amount?: BNumberValue
    /** 品种配置 */
    conf?: { contractSize?: BNumberValue; profitCurrency?: string }
  }
  /** 平仓价格（外部根据方向传入 bid/ask） */
  closePrice?: BNumberValue
}

/**
 * 计算仓位浮动盈亏信息（Gross PnL）
 *
 * 纯粹由价格变动产生的未实现盈亏，不含任何费用
 *
 * 公式：
 *   买入：(closePrice - startPrice) × amount × contractSize
 *   卖出：(startPrice - closePrice) × amount × contractSize
 */
export const calcPositionGrossPnlInfo = (params: CalcPositionGrossPnlInfoParams): CalcPnlInfoResult | undefined => {
  const { positionInfo, closePrice } = params

  if (!positionInfo) return undefined

  return calcPnlInfo({
    direction: positionInfo.direction,
    openPrice: positionInfo.startPrice,
    closePrice,
    amount: positionInfo.amount,
    contractSize: positionInfo.conf?.contractSize ?? 1,
  })
}

// ============ 仓位净盈亏（Net PnL） ============

/** 仓位净盈亏（Net PnL）入参 */
export type CalcPositionNetPnlInfoParams = {
  /** 浮动盈亏（Gross PnL） */
  grossPnl?: BNumberValue
  /** 手续费/佣金（负值） */
  handlingFees?: BNumberValue
  /** 库存费/隔夜费（负值） */
  interestFees?: BNumberValue
}

/**
 * 计算仓位净盈亏信息（Net PnL）
 *
 * 扣除所有持仓成本后的真实盈亏
 *
 * 公式：
 *   Net PnL = grossPnl + handlingFees + interestFees
 *
 * 注：handlingFees 和 interestFees 为负值，直接相加即扣除
 */
export const calcPositionNetPnlInfo = (params: CalcPositionNetPnlInfoParams): CalcPnlInfoResult | undefined => {
  const { grossPnl, handlingFees = 0, interestFees = 0 } = params

  if (!grossPnl) return undefined

  // 净盈亏 = 浮动盈亏 + 手续费 + 库存费
  const netPnl = BNumber.from(grossPnl)?.plus(handlingFees)?.plus(interestFees)
  if (!netPnl) return undefined

  const isProfit = netPnl.gt(0)
  const isLoss = netPnl.lt(0)
  const isPnLNoChange = netPnl.eq(0)

  return {
    pnl: netPnl.toFixed(),
    isProfit,
    isLoss,
    isPnLNoChange,
  }
}

// ============ 盈亏率 ============

/** 盈亏率入参 */
export type CalcPnlYieldRateInfoParams = {
  /** 盈亏金额 */
  pnl?: BNumberValue
  /** 保证金 */
  margin?: BNumberValue
}

/** 盈亏率返回值 */
export type CalcPnlYieldRateInfoResult = {
  /** 比例（如 0.125） */
  ratio?: string
  /** 百分比（如 12.5） */
  percent?: string
  /** 是否盈利 */
  isProfit?: boolean
  /** 是否亏损 */
  isLoss?: boolean
  /** 是否盈亏平衡 */
  isPnLNoChange?: boolean
}

/**
 * 计算盈亏率
 *
 * 公式：
 *   ratio = pnl / margin
 *   percent = ratio × 100
 */
export const calcPnlYieldRateInfo = (params: CalcPnlYieldRateInfoParams): CalcPnlYieldRateInfoResult | undefined => {
  const { pnl, margin } = params

  if (!pnl || !BNumber.from(margin)?.gt(0)) return undefined

  const ratio = BNumber.from(pnl)?.div(margin)

  if (!ratio) return undefined

  return {
    ratio: ratio.toFixed(),
    percent: ratio.multipliedBy(100).toFixed(),
    isProfit: ratio.gt(0),
    isLoss: ratio.lt(0),
    isPnLNoChange: ratio.eq(0),
  }
}

// ============ 总盈亏求和 ============

/** 总盈亏求和入参 */
export type CalcTotalPnlInfoParams = {
  /** 每笔仓位盈亏值数组 */
  pnlList?: (BNumberValue | undefined)[]
}

/**
 * 计算总盈亏（求和）
 *
 * 公式：totalPnl = Σ pnl
 */
export const calcTotalPnlInfo = (params: CalcTotalPnlInfoParams): CalcPnlInfoResult | undefined => {
  const { pnlList } = params

  if (!pnlList?.length) return undefined

  let total = BNumber.from(0)

  for (const pnl of pnlList) {
    if (pnl !== undefined) {
      total = total?.plus(pnl)
    }
  }

  if (!total) return undefined

  return {
    pnl: total.toFixed(),
    isProfit: total.gt(0),
    isLoss: total.lt(0),
    isPnLNoChange: total.eq(0),
  }
}
