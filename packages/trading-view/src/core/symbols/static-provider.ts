import type { ISymbolInfo, SearchSymbolResult } from './types'

/**
 * 静态品种 Provider，从配置数组读取
 */
export function createStaticSymbolProvider(symbols: ISymbolInfo[]) {
  return {
    resolve(symbolName: string): ISymbolInfo | undefined {
      return symbols.find((item) => symbolName.includes(item.name))
    },
    search(keyword: string): SearchSymbolResult[] {
      const k = (keyword || '').trim()
      return symbols
        .filter((item) => item.name.includes(k))
        .map((item) => ({
          symbol: item.name,
          full_name: item.name,
          description: item.description,
          exchange: item.exchange,
          type: item.type,
          ticker: item.name,
        }))
    },
  }
}
