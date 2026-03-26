import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Order } from '@/v1/services/tradeCore/order/typings'

import { calcPositionGrossPnlInfo } from '@/helpers/calc/pnl'
import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { getMarketPlatformPrice } from '@/hooks/market/use-market-quote'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { parseTradePositionInfo, TradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { RootStoreState, useRootStore } from '@/stores'
import { createSymbolInfoSelector } from '@/stores/market-slice'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { tradePositionListSelector } from '@/stores/trade-slice/position-slice'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { toFixed } from '@/v1/utils'
import { BNumber } from '@mullet/utils/number'

// ============ 内部工具函数 ============

/** 从 Zustand state 提取持仓相关价格快照（品种报价 + 换汇品种报价） */
const extractMarginPriceData = (
  s: RootStoreState,
  parsedList: TradePositionInfo[] = [],
): Record<string, string | number | undefined> => {
  const acctCurrency = userInfoActiveTradeAccountInfoSelector(s)?.currencyUnit
  const result: Record<string, string | number | undefined> = { __acctCurrency: acctCurrency }

  parsedList.forEach((pos) => {
    if (!pos?.symbol) return

    const symbolInfo = createSymbolInfoSelector(pos.symbol)(s)
    const dataKey = symbolInfo ? parseDataSourceKey(symbolInfo) : undefined
    const quote = dataKey ? createMarketQuoteSelector(dataKey)(s) : undefined
    result[`${pos.symbol}_bid`] = quote?.priceData?.buy
    result[`${pos.symbol}_ask`] = quote?.priceData?.sell

    // 换汇品种报价（仅在盈利货币与账户货币不一致时）
    const profitCurrency = pos.conf?.profitCurrency
    if (acctCurrency && profitCurrency && acctCurrency !== profitCurrency) {
      const divName = `USD${profitCurrency}`.toUpperCase()
      const mulName = `${profitCurrency}USD`.toUpperCase()
      const divInfo = createSymbolInfoSelector(divName)(s)
      const mulInfo = createSymbolInfoSelector(mulName)(s)
      const divKey = divInfo ? parseDataSourceKey(divInfo) : undefined
      const mulKey = mulInfo ? parseDataSourceKey(mulInfo) : undefined
      const divQ = divKey ? createMarketQuoteSelector(divKey)(s) : undefined
      const mulQ = mulKey ? createMarketQuoteSelector(mulKey)(s) : undefined
      result[`${divName}_bid`] = divQ?.priceData?.buy
      result[`${divName}_ask`] = divQ?.priceData?.sell
      result[`${mulName}_bid`] = mulQ?.priceData?.buy
      result[`${mulName}_ask`] = mulQ?.priceData?.sell
    }
  })

  return result
}

/** 计算单笔持仓的 Gross PnL（含换汇），从 priceData 快照中取价 */
const calcGrossPnlFromSnapshot = (
  pos: ReturnType<typeof parseTradePositionInfo>,
  priceData: Record<string, string | number | undefined>,
): string | undefined => {
  if (!pos?.symbol) return

  const bid = priceData[`${pos.symbol}_bid`]
  const ask = priceData[`${pos.symbol}_ask`]
  const closePrice = getMarketPlatformPrice(pos.direction, { bid, ask })

  const grossPnlInfo = calcPositionGrossPnlInfo({
    positionInfo: {
      direction: pos.direction,
      startPrice: pos.startPrice,
      amount: pos.orderVolume,
      conf: pos.conf,
    },
    closePrice,
  })

  if (!grossPnlInfo?.pnl) return undefined

  let grossPnl = BNumber.from(grossPnlInfo.pnl)
  const profitCurrency = pos.conf?.profitCurrency
  const acctCurrency = priceData.__acctCurrency as string | undefined

  if (acctCurrency && profitCurrency && acctCurrency !== profitCurrency) {
    const divName = `USD${profitCurrency}`.toUpperCase()
    const mulName = `${profitCurrency}USD`.toUpperCase()
    const isBuy = pos.direction === TradePositionDirectionEnum.BUY

    const divBid = priceData[`${divName}_bid`]
    const divAsk = priceData[`${divName}_ask`]
    const mulBid = priceData[`${mulName}_bid`]
    const mulAsk = priceData[`${mulName}_ask`]

    if (divBid || divAsk) {
      const price = Number(isBuy ? divBid : divAsk)
      if (price) grossPnl = grossPnl.div(price)
    } else if (mulBid || mulAsk) {
      const price = Number(isBuy ? mulBid : mulAsk)
      if (price) grossPnl = grossPnl.multipliedBy(price)
    }
  }

  return grossPnl.toFixed()
}

export type MarginRateInfoResult = {
  margin: string | undefined
  marginRate: string | undefined
  marginRatePercent: string | undefined
  balance: string | undefined
}

// ============ 核心计算（纯函数，供 hook 和方法版共用）============

/**
 * 计算逐仓保证金率信息（支持单笔或多笔）
 * 逐仓净值 = 保证金 + 库存费 + 手续费 + 浮动盈亏
 * 逐仓保证金率 = 净值 / 基础保证金
 */
export const computeIsolatedMarginRateInfo = (
  priceData: Record<string, string | number | undefined>,
  filterList: Order.BgaOrderPageListItem[],
  currentAccountInfo: User.AccountItem | undefined,
): MarginRateInfoResult => {
  const compelCloseRatio = currentAccountInfo?.compelCloseRatio
  let orderMargin: BNumber | undefined = BNumber.from(0)
  let orderBaseMargin: BNumber | undefined = BNumber.from(0)
  let handlingFees: BNumber | undefined = BNumber.from(0)
  let interestFees: BNumber | undefined = BNumber.from(0)
  let profit: BNumber | undefined = BNumber.from(0)

  filterList.forEach((posItem) => {
    const pos = parseTradePositionInfo(posItem)
    const grossPnl = calcGrossPnlFromSnapshot(pos, priceData)
    orderMargin = orderMargin?.plus(posItem.orderMargin)
    orderBaseMargin = orderBaseMargin?.plus(posItem.orderBaseMargin)
    handlingFees = handlingFees?.plus(posItem.handlingFees)
    interestFees = interestFees?.plus(posItem.interestFees)
    if (grossPnl) profit = profit?.plus(grossPnl)
  })

  const isolatedBalance = orderMargin.plus(interestFees).plus(handlingFees).plus(profit)
  const marginRate = orderMargin && isolatedBalance ? isolatedBalance.div(orderBaseMargin) : undefined
  const margin = orderMargin.multipliedBy(compelCloseRatio)
  const balance = toFixed(isolatedBalance, 2)

  const info: MarginRateInfoResult = {
    marginRatePercent: marginRate?.multipliedBy(100).toFixed(),
    marginRate: marginRate?.toFixed(),
    margin: margin?.toFixed(),
    balance: balance?.toFixed(),
  }
  return info
}

/**
 * 计算全仓保证金率信息
 * 全仓净值 = 账户余额 + 所有持仓浮动盈亏 - 逐仓净值
 * 全仓保证金率 = 全仓净值 / 全仓占用保证金
 */
export const computeCrossMarginRateInfo = (
  priceData: Record<string, string | number | undefined>,
  positionList: Order.BgaOrderPageListItem[],
  currentAccountInfo: User.AccountItem | undefined,
): MarginRateInfoResult => {
  const parsedList = positionList.map(parseTradePositionInfo)

  const totalProfit = parsedList.reduce(
    (acc, pos) => {
      const grossPnl = calcGrossPnlFromSnapshot(pos, priceData)
      if (grossPnl) return acc.plus(grossPnl)
      return acc
    },
    BNumber.from(BNumber.from(0)),
  )

  let balance = BNumber.from(currentAccountInfo?.money)?.plus(totalProfit)

  const occupyMargin = Number(toFixed(Number(currentAccountInfo?.margin || 0), 2))
  const hasCrossMarginOrder = positionList.some((p) => p.marginType === 'CROSS_MARGIN')

  let marginRate: BNumber | undefined
  let margin: BNumber | undefined

  if (hasCrossMarginOrder) {
    const isolatedMarginInfo = computeIsolatedMarginRateInfo(
      priceData,
      positionList.filter((p) => p.marginType === 'ISOLATED_MARGIN'),
      currentAccountInfo,
    )
    balance = balance?.minus(isolatedMarginInfo.balance)
    marginRate = occupyMargin ? balance?.div(occupyMargin) : undefined

    let compelCloseRatio = positionList[0]?.compelCloseRatio || 0
    compelCloseRatio = compelCloseRatio ? compelCloseRatio / 100 : 0
    margin = BNumber.from(occupyMargin)?.multipliedBy(compelCloseRatio)
  }

  const info = {
    margin: margin?.toFixed(),
    marginRate: marginRate?.toFixed(),
    marginRatePercent: marginRate?.multipliedBy(100).toFixed(),
    balance: balance?.toFixed(),
  }

  return info
}

// ============ 方法版（适用于 callback / 事件处理器 / 异步函数）============

/**
 * 方法版：计算逐仓保证金率信息
 * 使用 getState() 读取快照，不订阅 store，适合在 callback 中调用
 * @param item 逐仓持仓单（必传）
 */
export const getIsolatedMarginRateInfo = (item: Order.BgaOrderPageListItem): MarginRateInfoResult => {
  const s = useRootStore.getState()
  const currentAccountInfo = userInfoActiveTradeAccountInfoSelector(s)
  const parsedList = [parseTradePositionInfo(item)]
  const priceData = extractMarginPriceData(s, parsedList)
  return computeIsolatedMarginRateInfo(priceData, [item], currentAccountInfo)
}

/**
 * 方法版：计算全仓保证金率信息
 * 使用 getState() 读取快照，不订阅 store，适合在 callback 中调用
 */
export const getCrossMarginRateInfo = (): MarginRateInfoResult => {
  const s = useRootStore.getState()
  const positionList = tradePositionListSelector(s)
  const currentAccountInfo = userInfoActiveTradeAccountInfoSelector(s)
  const parsedList = positionList.map((info) => parseTradePositionInfo(info))
  const priceData = extractMarginPriceData(s, parsedList)
  return computeCrossMarginRateInfo(priceData, positionList, currentAccountInfo)
}

// ============ Hook 版（适用于组件渲染，实时响应行情变化）============

/**
 * Hook 版：计算逐仓保证金率信息
 * 订阅该仓位品种行情，实时计算
 * @param item 逐仓持仓单（必传）
 */
export const useIsolatedMarginRateInfo = (item?: TradePositionInfo) => {
  const currentAccountInfo = useRootStore(userInfoActiveTradeAccountInfoSelector)

  const parsedItem = useMemo(() => (item ? [parseTradePositionInfo(item)] : undefined), [item])

  const priceDataSelector = useCallback((s: RootStoreState) => extractMarginPriceData(s, parsedItem), [parsedItem])
  const priceData = useRootStore(useShallow(priceDataSelector))

  return useMemo(
    () => (item ? computeIsolatedMarginRateInfo(priceData, [item], currentAccountInfo) : undefined),
    [priceData, item, currentAccountInfo],
  )
}

/**
 * Hook 版：计算全仓保证金率信息
 * 订阅所有持仓品种行情，实时计算
 */
export const useCrossMarginRateInfo = () => {
  const currentAccountInfo = useRootStore(userInfoActiveTradeAccountInfoSelector)
  const positionList = useRootStore(tradePositionListSelector)

  const parsedList = useMemo(() => positionList.map((info) => parseTradePositionInfo(info)), [positionList])

  const priceDataSelector = useCallback((s: RootStoreState) => extractMarginPriceData(s, parsedList), [parsedList])
  const priceData = useRootStore(useShallow(priceDataSelector))

  return useMemo(
    () => computeCrossMarginRateInfo(priceData, positionList, currentAccountInfo),
    [priceData, positionList, currentAccountInfo],
  )
}
