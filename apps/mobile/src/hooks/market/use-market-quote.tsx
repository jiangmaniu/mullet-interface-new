import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { multiply, subtract } from 'lodash-es'
import type { RootStoreState } from '@/stores/index'
import type { Symbol } from '@/v1/services/tradeCore/symbol/typings'

import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { parseTradeDirectionInfo } from '@/helpers/parse/trade'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useRootStore } from '@/stores/index'
import { createSymbolInfoSelector, useMarketSymbolInfo } from '@/stores/market-slice'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { stores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { IQuoteItem } from '@/v1/stores/ws'
import { toFixed } from '@/v1/utils'
import { BNumber, BNumberValue } from '@mullet/utils/number'

/** 订阅指定 symbol 的原始行情数据 */
export const useMarketQuote = (symbol?: string) => {
  const symbolInfo = useRootStore(useShallow(useCallback((s) => createSymbolInfoSelector(symbol)(s), [symbol])))

  const dataSourceKey = useMemo(() => {
    if (!symbolInfo) return undefined
    return parseDataSourceKey(symbolInfo)
  }, [symbolInfo])

  return useRootStore(
    useShallow(
      useCallback((state: RootStoreState) => createMarketQuoteSelector(dataSourceKey)(state), [dataSourceKey]),
    ),
  )
}

/** 订阅指定 symbol 的解析后行情信息 */
export const useMarketQuoteInfo = (symbol?: string) => {
  const quote = useMarketQuote(symbol)
  const symbolInfo = useMarketSymbolInfo(symbol)
  return useMemo(() => parseMarketQuote({ quote, symbolInfo }), [quote, symbolInfo])
}

type ParseMarketQuoteParams = {
  quote?: IQuoteItem
  symbolInfo?: Account.TradeSymbolListItem
}

/**
 * bid 和 ask 就是平台报的买价和卖价
 * buy 和 sell 是用户的买价和卖价

 * 这两者的关系是：
 * 用户 buy = 平台 ask
 * 用户 sell = 平台 bid
 */
export type MarketQuoteInfo = {
  /**
   * @deprecated 请使用 platformAskPrice 代替
   */
  ask?: string
  /**
   * @deprecated 请使用 platformBidPrice 代替
   */
  bid?: string

  /** 平台报的买价 */
  platformBidPrice?: string
  /** 平台报的卖价 */
  platformAskPrice?: string

  /** 平台报的买价涨跌价差 */
  platformBidPriceDiff?: string
  /** 平台报的卖价涨跌价差 */
  platformAskPriceDiff?: string

  /** 用户买价（取平台卖价 ask） */
  userBuyPrice?: string
  /** 用户卖价（取平台买价 bid）*/
  userSellPrice?: string

  /** 用户买价涨跌价差 */
  userBuyPriceDiff?: string
  /** 用户卖价涨跌价差 */
  userSellPriceDiff?: string
}

export function parseMarketQuote({ quote, symbolInfo }: ParseMarketQuoteParams) {
  if (!symbolInfo || !symbolInfo) return undefined

  let symbol = symbolInfo.symbol
  const currentSymbol = symbolInfo
  const dataSourceKey = parseDataSourceKey(symbolInfo)

  const currentQuote = quote

  const dataSourceSymbol = currentSymbol?.dataSourceSymbol
  const symbolConf = currentSymbol?.symbolConf as Symbol.SymbolConf
  const prepaymentConf = currentSymbol?.symbolConf?.prepaymentConf as Symbol.PrepaymentConf
  const transactionFeeConf = currentSymbol?.symbolConf?.transactionFeeConf as Symbol.TransactionFeeConf
  const holdingCostConf = currentSymbol?.symbolConf?.holdingCostConf as Symbol.HoldingCostConf
  const spreadConf = currentSymbol?.symbolConf?.spreadConf as Symbol.SpreadConf
  const tradeTimeConf = currentSymbol?.symbolConf?.tradeTimeConf as Symbol.TradeTimeConf
  const quotationConf = currentSymbol?.symbolConf?.quotationConf as Symbol.QuotationConf
  const symbolNewTicker = stores.trade.tradeSymbolTickerMap[symbol] || currentSymbol.symbolNewTicker
  const symbolNewPrice = currentSymbol.symbolNewPrice
  const quoteTimeStamp = currentQuote?.priceData?.id || symbolNewPrice?.id

  const digits = Number(currentSymbol?.symbolDecimal || 2)
  const platformAskPrice = BNumber.from(currentQuote?.priceData?.sell || symbolNewPrice?.sell)?.toFixed()
  const platformBidPrice = BNumber.from(currentQuote?.priceData?.buy || symbolNewPrice?.buy)?.toFixed()
  const userBuyPrice = platformAskPrice
  const userSellPrice = platformBidPrice

  const platformBidPriceDiff = BNumber.from(currentQuote?.bidDiff)?.toFixed()
  const platformAskPriceDiff = BNumber.from(currentQuote?.askDiff)?.toFixed()

  const userBuyPriceDiff = platformAskPriceDiff
  const userSellPriceDiff = platformBidPriceDiff

  let bid = toFixed(Number(currentQuote?.priceData?.buy || symbolNewPrice?.buy || 0), digits, false)
  let ask = toFixed(Number(currentQuote?.priceData?.sell || symbolNewPrice?.sell || 0), digits, false)

  const open = Number(symbolNewTicker?.open || 0)
  const high = Math.max.apply(Math, [Number(symbolNewTicker?.high || 0), bid])
  const low = Math.min.apply(Math, [Number(symbolNewTicker?.low || 0), bid])
  const close = Number(bid || symbolNewTicker?.close || 0)
  const percent = bid && open ? (((bid - open) / open) * 100).toFixed(2) : 0
  const spread = Math.abs(multiply(Math.abs(Number(subtract(bid, ask))), Math.pow(10, digits)) as number)

  const info: MarketQuoteInfo = {
    platformBidPrice: platformBidPrice,
    platformAskPrice: platformAskPrice,

    platformBidPriceDiff: platformBidPriceDiff,
    platformAskPriceDiff: platformAskPriceDiff,

    userSellPrice: userBuyPrice,
    userBuyPrice: userSellPrice,

    userSellPriceDiff: userSellPriceDiff,
    userBuyPriceDiff: userBuyPriceDiff,
  }
  return {
    symbol,
    dataSourceSymbol,
    dataSourceKey,
    digits,
    currentQuote,
    quoteTimeStamp,
    currentSymbol,
    symbolConf,
    prepaymentConf,
    transactionFeeConf,
    holdingCostConf,
    spreadConf,
    tradeTimeConf,
    quotationConf,
    symbolNewTicker,
    symbolNewPrice,
    percent,
    consize: Number(symbolConf?.contractSize || 0),
    ask: platformAskPrice,
    bid: platformBidPrice,
    high: toFixed(high, digits, false),
    low: toFixed(low, digits, false),
    open: toFixed(open, digits, false),
    close: toFixed(close, digits, false),
    spread,
    bidDiff: currentQuote?.bidDiff || 0,
    askDiff: currentQuote?.askDiff || 0,
    hasQuote: !!currentQuote?.priceData?.buy,

    ...info,
  }
}

// ============ 方向价格 ============

/**
 * 获取市价成交价格
 * 买入成交用 ask（卖方报价），卖出成交用 bid（买方报价）
 * 适用场景：开仓、平仓成交价
 */
export const getMarketTradePrice = (direction?: TradePositionDirectionEnum, bid?: BNumberValue, ask?: BNumberValue) => {
  const { isBuy } = parseTradeDirectionInfo(direction)
  return isBuy ? ask : bid
}

/**
 * 获取市价报价价格
 * 买入用 bid（买方报价），卖出用 ask（卖方报价）
 * 适用场景：持仓盈亏计算
 */
export const getMarketQuotePrice = (direction?: TradePositionDirectionEnum, bid?: BNumberValue, ask?: BNumberValue) => {
  const { isBuy } = parseTradeDirectionInfo(direction)
  return isBuy ? bid : ask
}

/**
 * Hook：订阅行情，返回市价成交价格
 * 买入成交用 ask，卖出成交用 bid
 */
export const useMarketTradePrice = (symbol?: string, direction?: TradePositionDirectionEnum) => {
  const symbolMarketInfo = useMarketQuoteInfo(symbol)
  return getMarketTradePrice(direction, symbolMarketInfo?.bid, symbolMarketInfo?.ask)
}

/**
 * Hook：订阅行情，返回市价报价价格
 * 买入用 bid，卖出用 ask
 */
export const useMarketQuotePrice = (symbol?: string, direction?: TradePositionDirectionEnum) => {
  const symbolMarketInfo = useMarketQuoteInfo(symbol)
  return getMarketQuotePrice(direction, symbolMarketInfo?.bid, symbolMarketInfo?.ask)
}
