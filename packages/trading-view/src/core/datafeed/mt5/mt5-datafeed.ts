import type {
  DatafeedConfiguration,
  IBasicDataFeed,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem
} from 'public/static/charting_library'

import type { ISymbolProvider } from '../../symbols/types'
import type { IDatafeedHandlers } from '../types'

/**
 * MT5 协议 Datafeed 实现
 * 通过依赖注入的 SymbolProvider 和 Handlers 实现 TradingView Datafeed API
 */
export function createMt5Datafeed(
  symbolProvider: ISymbolProvider,
  handlers: IDatafeedHandlers,
  options: { isZh?: boolean }
): IBasicDataFeed {
  const { setActiveSymbolInfo, getHistoryBars, removeActiveSymbol } = handlers
  const isZh = options.isZh ?? false

  const supportedResolutions = ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
  const intradayMultipliers = ['1', '5', '15', '30', '60', '240']
  const configuration = {
    supports_time: true,
    supports_timescale_marks: true,
    supports_marks: true,
    supported_resolutions: supportedResolutions,
    intraday_multipliers: intradayMultipliers
  } as unknown as DatafeedConfiguration

  return {
    onReady(callback) {
      setTimeout(() => callback(configuration), 0)
    },

    resolveSymbol(symbolName: string, onResolve: (symbol: LibrarySymbolInfo) => void, onError: (reason: string) => void) {
      const current = symbolProvider.resolve(symbolName)
      if (!current) {
        onError(`Symbol not found: ${symbolName}`)
        return
      }

      const common: Partial<LibrarySymbolInfo> = {
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        intraday_multipliers: intradayMultipliers as ResolutionString[],
        supported_resolutions: supportedResolutions as ResolutionString[],
        data_status: 'streaming',
        format: 'price',
        minmov: 1,
        pricescale: Math.pow(10, current.precision ?? 2),
        ticker: current.exchange ?? current.name
      }

      const symbolInfo: LibrarySymbolInfo = {
        ...common,
        ...current,
        name: current.name,
        description: isZh ? current.description : current.name,
        exchange: isZh ? (current.exchange ?? '') : '',
        session: '0000-0000|0000-0000:1234567;1',
        timezone: 'Etc/UTC'
      } as LibrarySymbolInfo

      setTimeout(() => onResolve(symbolInfo), 0)
    },

    searchSymbols(userInput: string, _exchange: string, _symbolType: string, onResult: (result: SearchSymbolResultItem[]) => void) {
      const results: SearchSymbolResultItem[] = symbolProvider.search(userInput || '').map((r) => ({
        symbol: r.symbol,
        full_name: r.full_name,
        description: (isZh ? r.description : r.symbol) ?? '',
        exchange: (isZh ? r.exchange : '') ?? '',
        type: r.type ?? '',
        ticker: r.ticker ?? r.symbol
      }))
      setTimeout(() => onResult(results), 0)
    },

    getBars(
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: {
        from: number
        to: number
        countBack: number
        firstDataRequest: boolean
      },
      onResult: (bars: import('public/static/charting_library').Bar[], meta: { noData?: boolean }) => void,
      _onError: (reason: string) => void
    ) {
      const { from, to, firstDataRequest, countBack } = periodParams
      setActiveSymbolInfo({ symbolInfo, resolution })
      getHistoryBars({ symbolInfo, resolution, from, to, countBack, firstDataRequest }, onResult)
    },

    subscribeBars(
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onRealtimeCallback: (bar: import('public/static/charting_library').Bar) => void,
      subscriberUID: string,
      onResetCacheNeededCallback?: () => void
    ) {
      setActiveSymbolInfo({
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback
      })
    },

    unsubscribeBars(subscriberUID: string) {
      removeActiveSymbol(subscriberUID)
    }
  }
}
