import { calcPositionGrossPnlInfo } from '@/helpers/calc/pnl'
import { parseDataSourceKey } from '@/helpers/parse/symbol'
import { getMarketPlatformPrice } from '@/hooks/market/use-market-quote'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { parseTradePositionInfo } from '@/pages/(protected)/(trade)/_helpers/position'
import { RootStoreState } from '@/stores'
import { createSymbolInfoSelector } from '@/stores/market-slice'
import { createMarketQuoteSelector } from '@/stores/market-slice/quote-slice'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { BNumber } from '@mullet/utils/number'

/**
 * 从 Zustand state 提取持仓相关价格快照（品种报价 + 换汇品种报价）
 *
 * 换汇品种命名规则（与 calcCurrencyExchangeRate 保持一致）：
 *   divName = ${acctCurrency}${profitCurrency}  如 USDNZD，用除法
 *   mulName = ${profitCurrency}${acctCurrency}  如 NZDUSD，用乘法
 */
export const extractPositionPriceData = (
  s: RootStoreState,
  parsedList: ReturnType<typeof parseTradePositionInfo>[] = [],
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

    const profitCurrency = pos.conf?.profitCurrency
    if (acctCurrency && profitCurrency && acctCurrency !== profitCurrency) {
      const divName = `${acctCurrency}${profitCurrency}`.toUpperCase()
      const mulName = `${profitCurrency}${acctCurrency}`.toUpperCase()
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

/**
 * 计算单笔持仓的 Gross PnL（含换汇），从 priceData 快照中取价
 *
 * 换汇逻辑：
 *   divName 存在 → 除法
 *   mulName 存在 → 乘法
 */
export const calcGrossPnlFromSnapshot = (
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
    const divName = `${acctCurrency}${profitCurrency}`.toUpperCase()
    const mulName = `${profitCurrency}${acctCurrency}`.toUpperCase()
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
