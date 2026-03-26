import { useMemo } from 'react'

import {
  CalcPnlInfoResult,
  calcPnlYieldRateInfo,
  CalcPnlYieldRateInfoResult,
  calcPositionGrossPnlInfo,
  calcPositionNetPnlInfo,
  calcTotalPnlInfo,
} from '@/helpers/calc/pnl'
import { calcGrossPnlFromSnapshot, extractPositionPriceData } from '@/helpers/calc/quote'
import { calcCurrencyExchangeRate } from '@/helpers/calc/trade'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { parseTradePositionInfo, TradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { RootStoreState, useRootStore } from '@/stores'
import { selectorMemoize } from '@/stores/_helpers/memo'
import { BNumber, BNumberValue } from '@mullet/utils/number'

// ============ Gross PnL 业务封装 ============

/** 获取仓位浮动盈亏入参 */
type GetPositionGrossPnlInfoParams = {
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
  /** 平仓价格 */
  closePrice?: BNumberValue
  /** 是否换汇为账户本币 */
  convertCurrency?: boolean
}

/**
 * 获取仓位浮动盈亏信息（Gross PnL）
 *
 * 业务封装：基于 calcPositionGrossPnlInfo 计算，支持可选换汇
 * 换汇后会根据 convertedPnl 重新判断盈亏状态
 */
export const getPositionGrossPnlInfo = (params: GetPositionGrossPnlInfoParams): CalcPnlInfoResult | undefined => {
  const { positionInfo, closePrice, convertCurrency } = params

  if (!positionInfo) return undefined

  const info = calcPositionGrossPnlInfo({
    positionInfo: {
      direction: positionInfo.direction,
      startPrice: positionInfo.startPrice,
      amount: positionInfo.amount,
      conf: positionInfo.conf,
    },
    closePrice,
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
export const getPositionNetPnlInfo = (params: GetPositionNetPnlInfoParams): CalcPnlInfoResult | undefined => {
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

// ============ 账户总盈亏 业务封装 ============

/** 取价函数类型 */
type GetQuotePriceFn = (symbol?: string, direction?: TradePositionDirectionEnum) => BNumberValue | undefined

/** 账户总盈亏仓位信息 */
type AccountTotalPnlPositionInfo = Pick<
  TradePositionInfo,
  'symbol' | 'buySell' | 'startPrice' | 'orderVolume' | 'handlingFees' | 'interestFees' | 'conf'
> & {
  /** 仓位方向（parseTradePositionInfo 解析后） */
  direction?: TradePositionDirectionEnum
}

/** 账户总盈亏入参 */
type GetAccountTotalPnlInfoParams = {
  /** 仓位列表 */
  positionList?: AccountTotalPnlPositionInfo[]
  /** 取价函数（根据 symbol 和 direction 返回报价价格） */
  getQuotePrice: GetQuotePriceFn
  /** 是否换汇为账户本币 */
  convertCurrency?: boolean
}

/**
 * 获取账户总盈亏信息
 *
 * 遍历持仓列表，计算每笔 Net PnL（Gross + fees），求和
 *
 * 公式：
 *   totalPnl = Σ NetPnL(每笔持仓)
 *   NetPnL = GrossPnL + handlingFees + interestFees
 */
export const getPositionTotalPnlInfo = (params: GetAccountTotalPnlInfoParams): CalcPnlInfoResult | undefined => {
  const { positionList, getQuotePrice, convertCurrency } = params

  if (!positionList?.length) return undefined

  const pnlList = positionList.map((positionInfo) => {
    // 获取报价价格
    const currentPrice = getQuotePrice(positionInfo.symbol, positionInfo.direction)

    // 计算 Gross PnL（含可选换汇）
    const grossPnlInfo = getPositionGrossPnlInfo({
      positionInfo,
      closePrice: currentPrice,
      convertCurrency,
    })

    // 计算 Net PnL（加上手续费和库存费）
    // fees 本身已是账户本币，不需要再换汇
    const netPnlInfo = getPositionNetPnlInfo({
      positionInfo,
      grossPnl: grossPnlInfo?.pnl,
    })

    return netPnlInfo?.pnl
  })

  return calcTotalPnlInfo({ pnlList })
}

// ============ 账户总盈亏 Hook ============

/** 从 Zustand state 提取价格快照（供 hook 和方法版共用） */
export const extractPriceData = extractPositionPriceData

/** 根据价格快照计算总盈亏（纯函数，供 hook 和方法版共用） */
export const computeTotalPnlInfo = (
  priceData: Record<string, string | number | undefined> = {},
  positionInfoList: ReturnType<typeof parseTradePositionInfo>[],
): CalcPnlInfoResult | undefined => {
  const pnlList = positionInfoList.map((pos) => {
    if (!pos?.symbol) return undefined

    const grossPnl = calcGrossPnlFromSnapshot(pos, priceData)

    const netPnlInfo = calcPositionNetPnlInfo({
      grossPnl,
      handlingFees: pos.handlingFees,
      interestFees: pos.interestFees,
    })

    return netPnlInfo?.pnl
  })

  return calcTotalPnlInfo({ pnlList })
}

/**
 * 方法版：计算仓位总盈亏（适用于 callback / 事件处理器 / 异步函数）
 *
 * 使用 getState() 读取快照，不订阅 store
 */
export const getPositionTotalPnl = (positionList?: TradePositionInfo[]): CalcPnlInfoResult | undefined => {
  if (!positionList?.length) return undefined
  const parsedList = positionList.map(parseTradePositionInfo).filter(Boolean) as ReturnType<
    typeof parseTradePositionInfo
  >[]
  const priceData = extractPriceData(useRootStore.getState(), parsedList)
  return computeTotalPnlInfo(priceData, parsedList)
}

const createPriceDataSelector = (positionList?: TradePositionInfo[]) => {
  return selectorMemoize((s: RootStoreState): Record<string | number, string | number | undefined> => {
    if (!positionList?.length) return {}
    const parsedList = positionList.map(parseTradePositionInfo)
    return extractPositionPriceData(s, parsedList)
  })
}

/**
 * Hook：订阅持仓品种行情，实时计算账户总盈亏（Net PnL 求和）
 *
 * 使用 useShallow selector 在 store 内部完成计算，
 * 返回 CalcPnlInfoResult 对象，useShallow 逐字段浅比较，
 * 只有总盈亏实际变化时才触发 re-render
 *
 * 性能优化：
 * - 直接从 quote.priceData 取 bid/ask，不经过 parseMarketQuote
 * - 使用纯计算函数，不调用依赖 MobX 的业务封装方法
 * - selector 内只做纯数学运算，保证引用稳定性
 */
export const usePositionTotalPnlInfo = ({
  positionList,
}: {
  positionList: TradePositionInfo[]
}): CalcPnlInfoResult | undefined => {
  // Selector 职责：仅从 Zustand 提取原始价格字符串（扁平 Record），不做任何计算
  const priceData = useRootStore(
    useMemo(() => {
      return createPriceDataSelector(positionList)
    }, [positionList]),
  )

  // console.log(positionList, priceData)
  // 计算层：在 hook 层用 useMemo 做 PnL 运算，依赖稳定的原始数据快照
  return useMemo(() => {
    return computeTotalPnlInfo(priceData, positionList)
  }, [priceData, positionList])
}
