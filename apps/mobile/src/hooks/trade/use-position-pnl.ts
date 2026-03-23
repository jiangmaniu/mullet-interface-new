import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { BNumber, BNumberValue } from '@mullet/utils/number'

import { calcCurrencyExchangeRate } from '@/helpers/calc/trade'
import {
  calcPositionGrossPnlInfo,
  calcPositionNetPnlInfo,
  calcPnlYieldRateInfo,
  calcTotalPnlInfo,
  CalcPnlInfoResult,
  CalcPnlYieldRateInfoResult,
} from '@/helpers/calc/pnl'
import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { getMarketQuotePrice } from '@/hooks/market/use-market-quote'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { useRootStore } from '@/stores'
import { createSymbolInfoSelector } from '@/stores/market-slice'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { Order } from '@/v1/services/tradeCore/order/typings'

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

// ============ 账户总盈亏 业务封装 ============

/** 取价函数类型 */
type GetQuotePriceFn = (symbol?: string, direction?: TradePositionDirectionEnum) => BNumberValue | undefined

/** 账户总盈亏仓位信息 */
type AccountTotalPnlPositionInfo = Pick<
  Order.BgaOrderPageListItem,
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
export const getPositionTotalPnlInfo = (
  params: GetAccountTotalPnlInfoParams,
): CalcPnlInfoResult | undefined => {
  const { positionList, getQuotePrice, convertCurrency } = params

  if (!positionList?.length) return undefined

  const pnlList = positionList.map((positionInfo) => {
    // 获取报价价格
    const currentPrice = getQuotePrice(positionInfo.symbol, positionInfo.direction)

    // 计算 Gross PnL（含可选换汇）
    const grossPnlInfo = getPositionGrossPnlInfo({
      positionInfo,
      currentPrice,
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
export const usePositionTotalPnl = (
  positionList?: Order.BgaOrderPageListItem[],
): CalcPnlInfoResult | undefined => {
  // 预解析持仓列表，避免 selector 内重复解析
  const parsedList = useMemo(
    () => positionList?.map(parseTradePositionInfo),
    [positionList],
  )

  return useRootStore(
    useShallow((s) => {
      if (!parsedList?.length) return undefined

      const pnlList = parsedList.map((positionInfo) => {
        // 直接从 store 取原始 bid/ask，不经过 parseMarketQuote
        const symbolInfo = createSymbolInfoSelector(positionInfo.symbol)(s)
        if (!symbolInfo) return undefined
        const dataSourceKey = parseDataSourceKey(symbolInfo)
        const quote = createMarketQuoteSelector(dataSourceKey)(s)
        const bid = quote?.priceData?.buy
        const ask = quote?.priceData?.sell
        const currentPrice = getMarketQuotePrice(positionInfo.direction, bid, ask)

        // 纯计算 Gross PnL（不含换汇）
        const grossPnlInfo = calcPositionGrossPnlInfo({
          positionInfo: {
            direction: positionInfo.direction,
            startPrice: positionInfo.startPrice,
            orderVolume: positionInfo.orderVolume,
            conf: positionInfo.conf,
          },
          currentPrice,
        })

        if (!grossPnlInfo?.pnl) return undefined

        // 换汇为账户本币
        let grossPnl: BNumberValue | undefined = grossPnlInfo.pnl
        const converted = calcCurrencyExchangeRate({
          value: grossPnlInfo.pnl,
          unit: positionInfo.conf?.profitCurrency,
          buySell: positionInfo.direction,
        })
        if (converted !== undefined) grossPnl = converted

        // 纯计算 Net PnL
        const netPnlInfo = calcPositionNetPnlInfo({
          grossPnl,
          handlingFees: positionInfo.handlingFees,
          interestFees: positionInfo.interestFees,
        })

        return netPnlInfo?.pnl
      })

      return calcTotalPnlInfo({ pnlList })
    }),
  )
}
