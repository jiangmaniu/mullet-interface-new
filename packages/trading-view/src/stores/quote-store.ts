import dayjs from 'dayjs'
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

  /** 更新最后一条 K 线 Bar */
  @action
  updateBar = (socketData: QuoteTick, currentSymbol: { resolution: string; precision: number }) => {
    const precision = currentSymbol.precision
    const lastBar = this.lastbar
    if (!lastBar?.time) return null

    let resolution: string | number = currentSymbol.resolution
    let rounded = socketData.t

    if (!resolution) return null

    if (!isNaN(Number(resolution)) || String(resolution).includes('D')) {
      if (String(resolution).includes('D')) {
        resolution = 1440
      }
      const coeff = Number(resolution) * 60
      rounded = Math.floor(socketData.t / coeff) * coeff
    } else if (String(resolution).includes('W')) {
      rounded =
        dayjs(socketData.t * 1000)
          .day(0)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .valueOf() / 1000
    } else if (String(resolution).includes('M')) {
      rounded =
        dayjs(socketData.t * 1000)
          .date(1)
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .valueOf() / 1000
    }

    const lastBarSec = lastBar.time / 1000
    if (rounded > lastBarSec) {
      return {
        time: rounded * 1000,
        open: NP.round(socketData.b, precision),
        high: NP.round(socketData.b, precision),
        low: NP.round(socketData.b, precision),
        close: NP.round(socketData.b, precision),
      }
    } else {
      return {
        time: lastBar.time,
        open: lastBar.open,
        high: NP.round(Math.max(lastBar.high, socketData.b), precision),
        low: NP.round(Math.min(lastBar.low, socketData.b), precision),
        close: NP.round(socketData.b, precision),
      }
    }
  }

  /** 设置当前活跃品种信息（由 Datafeed subscribeBars 调用） */
  @action
  setActiveSymbolInfo = (data: Record<string, unknown>) => {
    this.activeSymbolInfo = {
      ...this.activeSymbolInfo,
      ...data,
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
