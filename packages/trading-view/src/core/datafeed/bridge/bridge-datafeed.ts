import type {
  Bar,
  DatafeedConfiguration,
  IBasicDataFeed,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem
} from 'public/static/charting_library'

import { BridgeOutgoing, type WebToAppMessage } from '@/bridge/types'

import type { BridgeHistoryProvider } from './bridge-history-provider'
import type { BridgeSymbolProvider } from './bridge-symbol-provider'

type PostToApp = (msg: WebToAppMessage) => void

interface QuoteStore {
  setActiveSymbolInfo: (data: Record<string, unknown>) => void
  setLastbar: (bar: Record<string, any>) => void
  removeActiveSymbol: (subscriberUID: string) => void
}

const SUPPORTED_RESOLUTIONS = ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M']
const INTRADAY_MULTIPLIERS = ['1', '5', '15', '30', '60', '240']

/**
 * Bridge Datafeed
 * 实现 TradingView IBasicDataFeed 接口
 * 所有数据通过 Bridge 从 App 获取，WebView 内无网络请求
 */
export function createBridgeDatafeed(
  symbolProvider: BridgeSymbolProvider,
  historyProvider: BridgeHistoryProvider,
  quoteStore: QuoteStore,
  postToApp: PostToApp,
  options: { isZh?: boolean }
): IBasicDataFeed {
  const isZh = options.isZh ?? false

  const configuration: DatafeedConfiguration = {
    supports_time: true,
    supports_timescale_marks: true,
    supports_marks: true,
    supported_resolutions: SUPPORTED_RESOLUTIONS,
    intraday_multipliers: INTRADAY_MULTIPLIERS
  } as unknown as DatafeedConfiguration

  return {
    onReady(callback) {
      setTimeout(() => callback(configuration), 0)
    },

    resolveSymbol(symbolName: string, onResolve: (symbol: LibrarySymbolInfo) => void, onError: (reason: string) => void) {
      symbolProvider
        .resolveAsync(symbolName)
        .then((info) => {
          const symbolInfo: LibrarySymbolInfo = {
            name: info.name,
            full_name: info.name,
            description: isZh ? (info.description ?? info.name) : info.name,
            type: info.type ?? 'stock',
            session: '0000-0000|0000-0000:1234567;1',
            exchange: isZh ? (info.exchange ?? '') : '',
            listed_exchange: isZh ? (info.exchange ?? '') : '',
            // 使用用户本地时区，TradingView 会自动将UTC时间戳转换为本地时间显示
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as import('public/static/charting_library').Timezone,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            intraday_multipliers: INTRADAY_MULTIPLIERS as ResolutionString[],
            supported_resolutions: SUPPORTED_RESOLUTIONS as ResolutionString[],
            data_status: 'streaming',
            format: 'price',
            minmov: 1,
            pricescale: Math.pow(10, info.precision ?? 2),
            ticker: info.name
          } as LibrarySymbolInfo

          setTimeout(() => onResolve(symbolInfo), 0)
        })
        .catch((err) => {
          onError(err?.message ?? `Symbol not found: ${symbolName}`)
        })
    },

    searchSymbols(_userInput: string, _exchange: string, _symbolType: string, onResult: (result: SearchSymbolResultItem[]) => void) {
      // Bridge 模式下搜索由 App 端处理，WebView 不支持
      setTimeout(() => onResult([]), 0)
    },

    getBars(
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: { from: number; to: number; countBack: number; firstDataRequest: boolean },
      onResult: (bars: Bar[], meta: { noData?: boolean }) => void,
      _onError: (reason: string) => void
    ) {
      const { from, to, firstDataRequest, countBack } = periodParams
      quoteStore.setActiveSymbolInfo({ symbolInfo, resolution })
      historyProvider.getBars({ symbolInfo, resolution, from, to, countBack, firstDataRequest }, (bars, meta) => {
        if (firstDataRequest && bars.length > 0) {
          quoteStore.setLastbar(bars[bars.length - 1])
        }
        onResult(bars, meta)
      })
    },

    subscribeBars(
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onRealtimeCallback: (bar: Bar) => void,
      subscriberUID: string,
      onResetCacheNeededCallback?: () => void
    ) {
      quoteStore.setActiveSymbolInfo({
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback
      })
      postToApp({
        type: BridgeOutgoing.Subscribe,
        payload: { symbol: symbolInfo.name }
      })
    },

    unsubscribeBars(subscriberUID: string) {
      quoteStore.removeActiveSymbol(subscriberUID)
      postToApp({
        type: BridgeOutgoing.Unsubscribe,
        payload: { symbol: subscriberUID }
      })
    }
  }
}
