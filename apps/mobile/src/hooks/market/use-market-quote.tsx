import { useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { multiply, subtract } from 'lodash-es'
import type { RootStoreState } from '@/stores/index'
import type { Symbol } from '@/v1/services/tradeCore/symbol/typings'

import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { useRootStore } from '@/stores/index'
import { useMarketSymbolInfo } from '@/stores/market-slice'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { stores } from '@/v1/provider/mobxProvider'
import { Account } from '@/v1/services/tradeCore/account/typings'
import { IQuoteItem } from '@/v1/stores/ws'
import { toFixed } from '@/v1/utils'

/** 订阅指定 symbol 的原始行情数据 */
export const useMarketQuote = (symbol?: string) => {
  return useRootStore(
    useShallow(useCallback((state: RootStoreState) => createMarketQuoteSelector(symbol)(state), [symbol])),
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
  let ask = toFixed(Number(currentQuote?.priceData?.sell || symbolNewPrice?.sell || 0), digits, false)
  let bid = toFixed(Number(currentQuote?.priceData?.buy || symbolNewPrice?.buy || 0), digits, false)
  const open = Number(symbolNewTicker?.open || 0)
  const high = Math.max.apply(Math, [Number(symbolNewTicker?.high || 0), bid])
  const low = Math.min.apply(Math, [Number(symbolNewTicker?.low || 0), bid])
  const close = Number(bid || symbolNewTicker?.close || 0)
  const percent = bid && open ? (((bid - open) / open) * 100).toFixed(2) : 0
  const spread = Math.abs(multiply(Math.abs(Number(subtract(bid, ask))), Math.pow(10, digits)) as number)

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
    ask,
    bid,
    high: toFixed(high, digits, false),
    low: toFixed(low, digits, false),
    open: toFixed(open, digits, false),
    close: toFixed(close, digits, false),
    spread,
    bidDiff: currentQuote?.bidDiff || 0,
    askDiff: currentQuote?.askDiff || 0,
    hasQuote: !!currentQuote?.priceData?.buy,
  }
}
