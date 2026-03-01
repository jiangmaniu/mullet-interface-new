import type { Bar, LibrarySymbolInfo } from 'public/static/charting_library'

/** 获取 K 线参数 */
export interface GetBarsParams {
  symbolInfo: LibrarySymbolInfo
  resolution: string
  from: number
  to: number
  countBack: number
  firstDataRequest: boolean
}

/** 历史数据回调 */
export type OnHistoryCallback = (
  bars: Bar[],
  meta: { noData?: boolean }
) => void

/** 历史数据 Provider：负责获取 K 线历史 */
export interface IHistoryProvider {
  getBars(params: GetBarsParams, onResult: OnHistoryCallback): void
}

/** 订阅参数 */
export interface SubscribeBarsParams {
  symbolInfo: LibrarySymbolInfo
  resolution: string
  onRealtimeCallback: (bar: Bar) => void
  subscriberUID: string
  onResetCacheNeededCallback?: () => void
}

/** 实时数据 Provider：负责订阅/退订实时 tick */
export interface IRealtimeProvider {
  setActive(params: SubscribeBarsParams): void
  remove(subscriberUID: string): void
}

/** Datafeed 所需的外部能力（由上层注入） */
export interface IDatafeedHandlers {
  setActiveSymbolInfo: (data: Record<string, unknown>) => void
  getHistoryBars: IHistoryProvider['getBars']
  removeActiveSymbol: (subscriberUID: string) => void
}
