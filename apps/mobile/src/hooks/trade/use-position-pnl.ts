import { BNumber, BNumberValue } from '@mullet/utils/number'

import { calcCurrencyExchangeRate } from '@/helpers/calc/trade'
import {
  calcPositionGrossPnlInfo,
  calcPositionNetPnlInfo,
  calcPnlYieldRateInfo,
  CalcPnlInfoResult,
  CalcPnlYieldRateInfoResult,
} from '@/helpers/calc/pnl'
import { TradePositionDirectionEnum } from '@/options/trade/position'

// ============ Gross PnL 业务封装 ============

/** 获取仓位浮动盈亏入参 */
type GetPositionGrossPnlInfoParams = {
  /** 仓位信息 */
  positionInfo?: {
    /** 仓位方向 */
    direction?: TradePositionDirectionEnum
    /** 开仓价格 */
    startPrice?: number
    /** 持仓手数 */
    orderVolume?: number
    /** 品种配置 */
    conf?: { contractSize?: number; profitCurrency?: string }
  }
  /** 当前市场价格（外部根据方向传入 bid/ask） */
  currentPrice?: BNumberValue
  /** 是否换汇为账户本币 */
  convertCurrency?: boolean
}

/**
 * 获取仓位浮动盈亏信息（Gross PnL）
 *
 * 业务封装：基于 calcPositionGrossPnlInfo 计算，支持可选换汇
 * 换汇后会根据 convertedPnl 重新判断盈亏状态
 */
export const getPositionGrossPnlInfo = (
  params: GetPositionGrossPnlInfoParams,
): CalcPnlInfoResult | undefined => {
  const { positionInfo, currentPrice, convertCurrency } = params

  if (!positionInfo) return undefined

  const info = calcPositionGrossPnlInfo({
    positionInfo: {
      direction: positionInfo.direction,
      startPrice: positionInfo.startPrice,
      orderVolume: positionInfo.orderVolume,
      conf: positionInfo.conf,
    },
    currentPrice,
  })

  if (!info?.pnl || !convertCurrency) return info

  const convertedPnl = calcCurrencyExchangeRate({
    value: info.pnl,
    unit: positionInfo.conf?.profitCurrency,
    buySell: positionInfo.direction,
  })

  if (convertedPnl === undefined) return info

  // 换汇后金额可能变化，重新判断盈亏状态
  const pnl = BNumber.from(convertedPnl)

  return {
    pnl: String(convertedPnl),
    isProfit: !!pnl?.gt(0),
    isLoss: !!pnl?.lt(0),
    isPnLNoChange: !!pnl?.eq(0),
  }
}

// ============ Net PnL 业务封装 ============

/** 获取仓位净盈亏入参 */
type GetPositionNetPnlInfoParams = {
  /** 仓位信息 */
  positionInfo?: {
    /** 仓位方向 */
    direction?: TradePositionDirectionEnum
    /** 手续费/佣金（负值） */
    handlingFees?: number
    /** 库存费/隔夜费（负值） */
    interestFees?: number
    /** 品种配置 */
    conf?: { profitCurrency?: string }
  }
  /** 浮动盈亏（Gross PnL，已换汇或原始值） */
  grossPnl?: BNumberValue
  /** 是否换汇为账户本币 */
  convertCurrency?: boolean
}

/**
 * 获取仓位净盈亏信息（Net PnL）
 *
 * 业务封装：从仓位信息中提取手续费和库存费，支持可选换汇
 * 换汇后会根据 convertedPnl 重新判断盈亏状态
 */
export const getPositionNetPnlInfo = (
  params: GetPositionNetPnlInfoParams,
): CalcPnlInfoResult | undefined => {
  const { positionInfo, grossPnl, convertCurrency } = params

  if (!positionInfo) return undefined

  const info = calcPositionNetPnlInfo({
    grossPnl,
    handlingFees: positionInfo.handlingFees,
    interestFees: positionInfo.interestFees,
  })

  if (!info?.pnl || !convertCurrency) return info

  const convertedPnl = calcCurrencyExchangeRate({
    value: info.pnl,
    unit: positionInfo.conf?.profitCurrency,
    buySell: positionInfo.direction,
  })

  if (convertedPnl === undefined) return info

  // 换汇后金额可能变化，重新判断盈亏状态
  const pnl = BNumber.from(convertedPnl)

  return {
    pnl: String(convertedPnl),
    isProfit: !!pnl?.gt(0),
    isLoss: !!pnl?.lt(0),
    isPnLNoChange: !!pnl?.eq(0),
  }
}

// ============ 盈亏率 业务封装 ============

/** 获取仓位盈亏率入参 */
type GetPositionPnlYieldRateInfoParams = {
  /** 仓位信息 */
  positionInfo?: {
    /** 保证金（根据仓位模式取对应值） */
    marginByType?: number
  }
  /** 盈亏金额（Gross 或 Net，由调用方决定） */
  pnl?: BNumberValue
}

/**
 * 获取仓位盈亏率信息
 *
 * 业务封装：从仓位信息中提取保证金，计算盈亏率
 * 外部自行传入 Gross PnL 或 Net PnL
 *
 * 公式：
 *   ratio = pnl / margin
 *   percent = ratio × 100
 */
export const getPositionPnlYieldRateInfo = (
  params: GetPositionPnlYieldRateInfoParams,
): CalcPnlYieldRateInfoResult | undefined => {
  const { positionInfo, pnl } = params

  if (!positionInfo) return undefined

  return calcPnlYieldRateInfo({
    pnl,
    margin: positionInfo.marginByType,
  })
}
