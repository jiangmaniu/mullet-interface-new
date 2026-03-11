import { BridgeOutgoing, type BridgeSymbolInfo, type WebToAppMessage } from '@/bridge/types'

import type { ISymbolInfo, ISymbolProvider, SearchSymbolResult } from '../../symbols/types'

type PostToApp = (msg: WebToAppMessage) => void

const REQUEST_TIMEOUT = 10_000

let callIdCounter = 0
function nextCallId(): string {
  return `sym_${++callIdCounter}_${Date.now()}`
}

interface PendingRequest {
  resolve: (info: BridgeSymbolInfo) => void
  reject: (err: Error) => void
  timer: ReturnType<typeof setTimeout>
}

/**
 * Bridge 品种信息 Provider
 * 通过 Bridge 向 App 请求品种信息，替代静态 symbols.ts 硬编码
 * 内置缓存，同一品种只请求一次
 */
export class BridgeSymbolProvider implements ISymbolProvider {
  private cache = new Map<string, ISymbolInfo>()
  private pendingRequests = new Map<string, PendingRequest>()
  private postToApp: PostToApp

  constructor(postToApp: PostToApp) {
    this.postToApp = postToApp
  }

  /** 同步解析（仅从缓存），TradingView resolveSymbol 需要异步版本 */
  resolve(symbolName: string): ISymbolInfo | undefined {
    return this.cache.get(symbolName)
  }

  /** 异步解析品种信息，通过 Bridge 请求 App */
  resolveAsync(symbolName: string): Promise<ISymbolInfo> {
    const cached = this.cache.get(symbolName)
    if (cached) return Promise.resolve(cached)

    const callId = nextCallId()

    return new Promise<ISymbolInfo>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(callId)
        reject(new Error(`ResolveSymbol timeout: ${symbolName}`))
      }, REQUEST_TIMEOUT)

      this.pendingRequests.set(callId, {
        resolve: (info) => {
          const symbolInfo: ISymbolInfo = { ...info }
          this.cache.set(symbolName, symbolInfo)
          resolve(symbolInfo)
        },
        reject,
        timer,
      })

      this.postToApp({
        type: BridgeOutgoing.ResolveSymbol,
        callId,
        payload: { symbol: symbolName },
      })
    })
  }

  /** 搜索品种（Bridge 模式下不支持搜索，返回空） */
  search(_keyword: string): SearchSymbolResult[] {
    return []
  }

  /** 接收 App 返回的品种信息，由 Bridge 消息处理器调用 */
  handleSymbolResponse(callId: string, info: BridgeSymbolInfo): void {
    const pending = this.pendingRequests.get(callId)
    if (!pending) return

    clearTimeout(pending.timer)
    this.pendingRequests.delete(callId)
    pending.resolve(info)
  }

  destroy(): void {
    this.pendingRequests.forEach((pending) => {
      clearTimeout(pending.timer)
      pending.reject(new Error('BridgeSymbolProvider destroyed'))
    })
    this.pendingRequests.clear()
    this.cache.clear()
  }
}
