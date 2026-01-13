import { useMemo } from 'react'

import { useStores } from '@/v1/provider/mobxProvider'
import { getCurrentQuoteV2 } from '@/v1/utils/wsUtil'

export const useCurrentQuote = (symbolName?: string) => {
  const { trade, ws } = useStores()

  // 获取关键的依赖项
  const targetSymbol = symbolName ?? trade.activeSymbolName
  const symbolData = trade.symbolMapAll?.[targetSymbol]
  const accountGroupId = symbolData?.accountGroupId
  const dataSourceKey = `${accountGroupId}/${targetSymbol}`

  // 只依赖具体的行情数据，而不是整个 quotes Map
  const currentQuote = ws.quotes.get(dataSourceKey)
  const quoteTimestamp = currentQuote?.priceData?.id

  return useMemo(() => {
    if (!targetSymbol || !symbolData) return null

    return getCurrentQuoteV2(ws.quotes, targetSymbol, trade.symbolMapAll)
  }, [
    targetSymbol, // 品种名称变化
    quoteTimestamp, // 只有当前品种的行情时间戳变化
    symbolData?.symbolConf, // 品种配置变化
    ws.quotes.size, // quotes Map 大小变化（新增品种）
  ])
}
