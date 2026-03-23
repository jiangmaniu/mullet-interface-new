import { dayjs } from '@mullet/utils/dayjs'
import { action, makeAutoObservable, observable } from 'mobx'
import NP from 'number-precision'

import type { QuoteTick } from '@/bridge/types'

NP.enableBoundaryChecking(false)

/**
 * QuoteStore - 行情数据处理（纯计算，无网络）
 * 接收 Bridge 推送的实时行情，计算并更新 K 线最后一根 Bar
 * 替代原 WsStore，移除了 WebSocket / Protobuf 等网络代码
 */
class QuoteStore {
  constructor() {
    makeAutoObservable(this)
  }

  @observable activeSymbolInfo: Record<string, any> = { symbolInfo: {} }
  @observable lastbar: Record<string, any> = {}

  /** 处理 App 推送的实时行情 */
  @action
  setQuoteData = (data: QuoteTick) => {
    if (!this.activeSymbolInfo.symbolInfo) return
    const activeSymbolName = this.activeSymbolInfo.symbolInfo.name
    if (data.n !== activeSymbolName) return

    const resolution = this.activeSymbolInfo.resolution
    const pricescale = this.activeSymbolInfo.symbolInfo.pricescale ?? 100
    const precision = Math.round(Math.log10(pricescale))
    const newLastBar = this.updateBar(data, { resolution, precision })
    if (newLastBar) {
      this.activeSymbolInfo.onRealtimeCallback?.(newLastBar)
      this.lastbar = newLastBar
    }
  }

  /** 将时间戳（毫秒）对齐到指定 resolution 的周期起点（毫秒） */
  private alignTime(timeMs: number, resolution: string): number {
    if (String(resolution).includes('D')) {
      return dayjs.utc(timeMs).startOf('day').valueOf()
    }
    if (String(resolution).includes('W')) {
      return dayjs.utc(timeMs).day(0).startOf('day').valueOf()
    }
    if (String(resolution).includes('M')) {
      return dayjs.utc(timeMs).date(1).startOf('day').valueOf()
    }
    if (!isNaN(Number(resolution))) {
      const coeff = Number(resolution) * 60 * 1000
      return Math.floor(timeMs / coeff) * coeff
    }
    return timeMs
  }

  /** 更新最后一条 K 线 Bar */
  @action
  updateBar = (socketData: QuoteTick, currentSymbol: { resolution: string; precision: number }) => {
    const precision = currentSymbol.precision
    const lastBar = this.lastbar
    if (!lastBar?.time) return null

    const resolution = currentSymbol.resolution
    if (!resolution) return null

    // 将 tick 时间和 lastbar 时间都按当前 resolution 对齐
    // 解决切换周期后 lastbar 来自不同 resolution 导致时间不匹配的问题
    const rounded = this.alignTime(socketData.t * 1000, resolution)
    const alignedLastBar = this.alignTime(lastBar.time, resolution)

    if (rounded > alignedLastBar) {
      return {
        time: rounded,
        open: NP.round(socketData.b, precision),
        high: NP.round(socketData.b, precision),
        low: NP.round(socketData.b, precision),
        close: NP.round(socketData.b, precision)
      }
    } else {
      return {
        time: rounded,
        open: lastBar.open,
        high: NP.round(Math.max(lastBar.high, socketData.b), precision),
        low: NP.round(Math.min(lastBar.low, socketData.b), precision),
        close: NP.round(socketData.b, precision)
      }
    }
  }

  /** 设置当前活跃品种信息（由 Datafeed subscribeBars 调用） */
  @action
  setActiveSymbolInfo = (data: Record<string, unknown>) => {
    this.activeSymbolInfo = {
      ...this.activeSymbolInfo,
      ...data
    }
  }

  /** 设置最后一根 K 线（由 Datafeed getBars 首次加载后调用） */
  @action
  setLastbar = (bar: Record<string, any>) => {
    this.lastbar = bar
  }

  /** 取消订阅 */
  removeActiveSymbol = (subscriberUID: string) => {
    if (this.activeSymbolInfo.subscriberUID !== subscriberUID) return
    this.activeSymbolInfo = { symbolInfo: {} }
  }
}

const quoteStore = new QuoteStore()
export default quoteStore
