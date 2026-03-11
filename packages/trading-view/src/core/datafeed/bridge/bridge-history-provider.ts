import type { Bar } from 'public/static/charting_library'

import { type BarData, BridgeOutgoing, type RequestBarsPayload, type WebToAppMessage } from '@/bridge/types'

import type { GetBarsParams, OnHistoryCallback } from '../types'

type PostToApp = (msg: WebToAppMessage) => void

const REQUEST_TIMEOUT = 30_000

let callIdCounter = 0
function nextCallId(): string {
  return `bars_${++callIdCounter}_${Date.now()}`
}

interface PendingRequest {
  resolve: (bars: Bar[]) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
}

/**
 * Bridge 历史数据 Provider
 * 通过 Bridge 向 App 请求历史 K 线，替代 Mt5HistoryProvider 的 HTTP 请求
 */
export class BridgeHistoryProvider {
  private pendingRequests = new Map<string, PendingRequest>()
  private postToApp: PostToApp

  constructor(postToApp: PostToApp) {
    this.postToApp = postToApp
  }

  getBars(params: GetBarsParams, onResult: OnHistoryCallback): void {
    const { symbolInfo, resolution, from, to, countBack, firstDataRequest } = params
    const symbol = (symbolInfo as { mtName?: string; name?: string }).mtName || (symbolInfo as { name?: string }).name || ''

    const callId = nextCallId()
    const payload: RequestBarsPayload = { symbol, resolution, from, to, countBack, firstDataRequest }

    const promise = new Promise<Bar[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(callId)
        reject(new Error(`RequestBars timeout: ${callId}`))
      }, REQUEST_TIMEOUT)

      this.pendingRequests.set(callId, { resolve, reject, timer })
    })

    this.postToApp({ type: BridgeOutgoing.RequestBars, callId, payload })

    promise
      .then((bars) => {
        if (bars.length > 0) {
          onResult(bars, { noData: false })
        } else {
          onResult([], { noData: true })
        }
      })
      .catch(() => {
        onResult([], { noData: true })
      })
  }

  /** 接收 App 返回的历史数据，由 Bridge 消息处理器调用 */
  handleBarsResponse(callId: string, bars: BarData[], noData: boolean): void {
    const pending = this.pendingRequests.get(callId)
    if (!pending) return

    clearTimeout(pending.timer)
    this.pendingRequests.delete(callId)

    if (noData || !bars.length) {
      pending.resolve([])
    } else {
      pending.resolve(
        bars.map((b) => ({
          time: b.time,
          open: b.open,
          high: b.high,
          low: b.low,
          close: b.close,
          volume: b.volume
        }))
      )
    }
  }

  destroy(): void {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timer)
      pending.reject(new Error('BridgeHistoryProvider destroyed'))
    })
    this.pendingRequests.clear()
  }
}
