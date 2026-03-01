import NP from 'number-precision'

import { KLINE_API_BASE } from '@/config/env'
import myrequest from '@/utils/axios'
import {
  arrayBufferToBase64,
  base64ToFloat32,
  base64ToInt,
  intToBin,
  stringToBin,
} from '@/utils/tools'

import type { Bar } from 'public/static/charting_library'
import type { GetBarsParams, OnHistoryCallback } from '../types'

NP.enableBoundaryChecking(false)

const MAX_BAR_CACHE = 500

function makeRequestKey(
  symbolName: string,
  resolution: string,
  from: number,
  to: number
): string {
  return [symbolName, resolution, from, to].join(':')
}

/**
 * MT5 协议 K 线历史 Provider
 * 通过 HTTP 请求获取历史数据，维护 lastBar / lastBarTime 用于分页
 * - 请求去重：相同 (symbol, resolution, from, to) 的并发请求复用
 * - 错误处理：请求失败时返回 { bars: [], noData: true }，不泄露脏数据
 * - 内存：barList 缓存上限 MAX_BAR_CACHE
 */
export class Mt5HistoryProvider {
  private lastBar: Bar | null = null
  private lastBarTime: number | null = null
  private barList: Bar[] = []
  private pendingRequests = new Map<string, Promise<Bar[]>>()

  getBars(params: GetBarsParams, onResult: OnHistoryCallback): void {
    const { symbolInfo, resolution, from, to, countBack, firstDataRequest } = params

    const sym = symbolInfo as { mtName?: string; name?: string }
    const symbolName = sym.mtName || sym.name || ''
    const toTimestamp = firstDataRequest ? to : this.lastBarTime ?? to
    const key = makeRequestKey(symbolName, resolution, from, toTimestamp)

    let promise = this.pendingRequests.get(key)
    if (!promise) {
      promise = this.fetchBars(
        symbolInfo,
        resolution,
        from,
        toTimestamp,
        countBack,
        firstDataRequest
      )
      this.pendingRequests.set(key, promise)
      promise.finally(() => this.pendingRequests.delete(key))
    }

    promise
      .then((bars) => {
        if (bars.length > 0) {
          if (firstDataRequest) {
            this.lastBarTime = bars[0].time / 1000 - 8 * 60 * 60
            this.lastBar = bars[bars.length - 1]
          } else {
            if (this.lastBarTime === bars[0].time / 1000 - 8 * 60 * 60) {
              onResult([], { noData: true })
              return
            }
            this.lastBarTime = bars[0].time / 1000 - 8 * 60 * 60
          }
          this.trimBarList(bars)
          onResult(bars, { noData: false })
        } else {
          onResult(bars, { noData: true })
        }
      })
      .catch(() => {
        onResult([], { noData: true })
      })
  }

  private trimBarList(latest: Bar[]): void {
    this.barList = latest
    if (this.barList.length > MAX_BAR_CACHE) {
      this.barList = this.barList.slice(-MAX_BAR_CACHE)
    }
  }

  private async fetchBars(
    symbolInfo: { name?: string; mtName?: string; precision?: number },
    resolution: string,
    from: number,
    to: number,
    countBack: number,
    _firstDataRequest: boolean
  ): Promise<Bar[]> {
    const resolutionToMin = resolution.includes('M')
      ? 43200
      : resolution.includes('W')
        ? 10080
        : resolution.includes('D')
          ? 1440
          : Number(resolution)

    const symbolName = [
      ...Array.from(stringToBin(symbolInfo.mtName || symbolInfo.name || '', 12)),
      ...Array.from(intToBin(resolutionToMin)),
      ...Array.from(intToBin(300)),
      ...Array.from(intToBin(0)),
      ...Array.from(intToBin(to + 8 * 60 * 60)),
    ]
    const encodeSymbolName = arrayBufferToBase64(new Int8Array(symbolName))
    const precision = symbolInfo.precision ?? 2

    const res = await myrequest.post<Array<{ b: string }>>(
      `${KLINE_API_BASE}/kline/TradeInfo/ChartRequestBinary`,
      { b: encodeSymbolName }
    )

    if (!res.data?.length) {
      return []
    }

    const bars: Bar[] = res.data.map((item) => {
      const blob = window.atob(item.b)
      const timeStamp = base64ToInt(blob.slice(20))[0] * 1000
      return {
        open: NP.round(base64ToFloat32(blob.slice(0, 4))[0], precision),
        close: NP.round(base64ToFloat32(blob.slice(4, 8))[0], precision),
        high: NP.round(base64ToFloat32(blob.slice(8, 12))[0], precision),
        low: NP.round(base64ToFloat32(blob.slice(12, 16))[0], precision),
        volume: NP.round(base64ToInt(blob.slice(16, 20))[0], precision),
        time: timeStamp,
      }
    })

    this.barList = bars
    return bars
  }
}
