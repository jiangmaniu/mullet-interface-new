import { BNumber } from "@mullet/utils/number"

export const parseSymbolLotsVolScale = (symbolConf?: Symbol.SymbolConf) => {
  return BNumber.from(symbolConf?.tradeStep)?.decimalPlaces()
}
