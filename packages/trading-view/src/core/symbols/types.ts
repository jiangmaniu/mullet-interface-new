/** 品种信息项（可扩展字段，与 LibrarySymbolInfo 兼容） */
export interface ISymbolInfo {
  name: string
  description?: string
  type?: string
  session?: string
  exchange?: string
  timezone?: string
  precision?: number
  mtName?: string
  defaultType?: number
  [key: string]: unknown
}

/** 品种搜索项 */
export interface SearchSymbolResult {
  symbol: string
  full_name: string
  description?: string
  exchange?: string
  type?: string
  ticker?: string
}

/** 品种 Provider：负责解析 symbol、搜索 */
export interface ISymbolProvider {
  resolve(symbolName: string): ISymbolInfo | undefined
  search(keyword: string): SearchSymbolResult[]
}
