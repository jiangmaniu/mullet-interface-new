import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { multiply, subtract } from 'lodash-es'
import type { RootStoreState } from '@/stores/index'
import type { Symbol } from '@/v1/services/tradeCore/symbol/typings'

import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { parseTradeDirectionInfo } from '@/helpers/parse/trade'
import { IQuoteItem } from '@/lib/ws/types'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useRootStore } from '@/stores/index'
import { createSymbolInfoSelector, useMarketSymbolInfo } from '@/stores/market-slice'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { stores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { toFixed } from '@/v1/utils'
import { BNumber, BNumberValue } from '@mullet/utils/number'

import { useSubscribeQuote } from './use-subscribe-quote'

/** 订阅指定 symbol 的原始行情数据（纯读取，不触发 WS 订阅，列表 item 使用） */
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
    platformBidPrice,
    platformAskPrice,

    platformBidPriceDiff,
    platformAskPriceDiff,

    userSellPrice,
    userBuyPrice,

    userSellPriceDiff,
    userBuyPriceDiff,
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
 * 获取用户交易价格
 * 买入交易用 ask（卖方报价），卖出交易用 bid（买方报价）
 * 适用场景：开仓、平仓成交价
 */
export const getMarketUserPrice = (
  direction?: TradePositionDirectionEnum,
  { buy, sell }: { buy?: BNumberValue; sell?: BNumberValue } = {},
) => {
  const { isBuy, isSell } = parseTradeDirectionInfo(direction)
  return isBuy ? buy : isSell ? sell : undefined
}

/**
 * Hook：订阅行情，返回用户交易价格
 * 买入交易用 userBuyPrice，卖出交易用 userSellPrice
 */
export const useMarketUserPrice = (symbol?: string, direction?: TradePositionDirectionEnum) => {
  const symbolMarketInfo = useMarketQuoteInfo(symbol)
  return getMarketUserPrice(direction, { buy: symbolMarketInfo?.userBuyPrice, sell: symbolMarketInfo?.userSellPrice })
}

/**
 * 获取平台报价价格
 * 买入用 platformBidPrice，卖出用 platformAskPrice
 * 适用场景：持仓盈亏计算
 */
export const getMarketPlatformPrice = (
  direction?: TradePositionDirectionEnum,
  { bid, ask }: { bid?: BNumberValue; ask?: BNumberValue } = {},
) => {
  const { isBuy, isSell } = parseTradeDirectionInfo(direction)
  return isBuy ? bid : isSell ? ask : undefined
}

/**
 * Hook：订阅行情，返回平台报价价格
 * 买入用 platformBidPrice，卖出用 platformAskPrice
 */
export const useMarketPlatformPrice = (symbol?: string, direction?: TradePositionDirectionEnum) => {
  const symbolMarketInfo = useMarketQuoteInfo(symbol)
  return getMarketPlatformPrice(direction, {
    bid: symbolMarketInfo?.platformBidPrice,
    ask: symbolMarketInfo?.platformAskPrice,
  })
}

// ============ 带自动订阅的 hook（详情页使用）============

/** 订阅指定 symbol 的原始行情数据，组件挂载时自动订阅 WS，卸载时自动取消（详情页使用） */
export const useMarketQuoteWithSub = (symbol?: string) => {
  useSubscribeQuote(symbol ? [symbol] : [])
  return useMarketQuote(symbol)
}

/** 订阅指定 symbol 的解析后行情信息，组件挂载时自动订阅 WS，卸载时自动取消（详情页使用） */
export const useMarketQuoteInfoWithSub = (symbol?: string) => {
  useSubscribeQuote(symbol ? [symbol] : [])
  return useMarketQuoteInfo(symbol)
}
