import { Symbol } from '@/v1/services/tradeCore/symbol/typings'
import { Account } from '@/v1/services/tradeCore/account/typings'

/**
 * 解析合约大小
 * @default 1 默认1手
 * @param symbolConf
 * @returns
 */
export const parseSymbolContractSize = (symbolConf?: Symbol.SymbolConf) => {
  return symbolConf?.contractSize ?? 1
}

/**
 * 解析行情数据源 Key
 * 格式：accountGroupId 存在时用 `{accountGroupId}/{symbol}`，否则用 `{dataSourceCode}/{symbol}`
 */
export const parseDataSourceKey = (symbolInfo?: Account.TradeSymbolListItem): string | undefined => {
  if (!symbolInfo) return undefined
  const { symbol, dataSourceCode, accountGroupId } = symbolInfo
  return Number(accountGroupId) ? `${accountGroupId}/${symbol}` : `${dataSourceCode}/${symbol}`
}
