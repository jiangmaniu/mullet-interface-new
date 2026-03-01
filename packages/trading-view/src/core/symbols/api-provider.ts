import type { ISymbolInfo, SearchSymbolResult } from './types'

/**
 * 从 API 拉取品种的 Provider（占位实现）
 * 后续可对接实际 API，并增加缓存逻辑
 *
 * @example
 * const provider = createApiSymbolProvider({ baseUrl: '/api/symbols' })
 * provider.resolve('GOLD')  // -> 从 API 或缓存获取
 */
export function createApiSymbolProvider(_options: { baseUrl?: string; cacheTtl?: number }) {
  const cache = new Map<string, ISymbolInfo>()
  const searchCache = new Map<string, SearchSymbolResult[]>()

  return {
    async resolve(symbolName: string): Promise<ISymbolInfo | undefined> {
      const cached = cache.get(symbolName)
      if (cached) return cached
      // TODO: fetch from API, populate cache
      return undefined
    },
    async search(keyword: string): Promise<SearchSymbolResult[]> {
      const k = (keyword || '').trim()
      const cached = searchCache.get(k)
      if (cached) return cached
      // TODO: fetch from API, populate searchCache
      return []
    },
  }
}
