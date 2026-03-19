import { Symbol } from '@/v1/services/tradeCore/symbol/typings'

/**
 * 解析合约大小
 * @default 1 默认1手
 * @param symbolConf
 * @returns
 */
export const parseSymbolContractSize = (symbolConf?: Symbol.SymbolConf) => {
  return symbolConf?.contractSize ?? 1
}
