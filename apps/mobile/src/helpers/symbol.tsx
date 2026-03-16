import { Symbol } from '@/v1/services/tradeCore/symbol/typings'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

export const parseSymbolLotsVolScale = (symbolConf?: Symbol.SymbolConf) => {
  return BNumber.from(symbolConf?.minTrade)?.decimalPlaces()
}

/**
 * 渲染格式化品种名称
 * @param symbolInfo 品种信息
 * @returns 格式化后的品种名称
 */
export const renderFormatSymbolName = (symbolInfo: Pick<Symbol.SymbolListItem, 'alias' | 'symbol'>) => {
  return renderFallback(symbolInfo?.alias || symbolInfo?.symbol)
}
