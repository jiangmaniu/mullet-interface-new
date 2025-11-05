import type { SubscriptionCallback, SubscriptionParams, SubscriptionType, WSClientConfig } from './types'

import { WSClientWorker } from './ws-client-worker'

/**
 * WebSocket 客户端（优先使用 Worker，不支持则降级）
 */
export class WSClient {
  private actualClient: WSClientWorker
  // | WSClientFallback

  constructor(config: WSClientConfig) {
    // 检测是否支持 Worker
    if (typeof Worker !== 'undefined' && typeof window !== 'undefined') {
      try {
        this.actualClient = new WSClientWorker(config)
        console.log('[WSClient] Using Worker mode')
      } catch (error) {
        console.warn('[WSClient] Worker failed, falling back to direct mode:', error)
        // this.actualClient = new WSClientFallback(config)
        throw new Error('Failed to initialize WebSocket client')
      }
    } else {
      console.log('[WSClient] Worker not supported, using direct mode')
      // this.actualClient = new WSClientFallback(config)
      throw new Error('Failed to initialize WebSocket client')
    }
  }

  public setDataHandler(handler: (type: SubscriptionType, data: string) => void): void {
    this.actualClient.setDataHandler(handler)
  }

  public subscribe(type: SubscriptionType, params: SubscriptionParams): () => void {
    return this.actualClient.subscribe(type, params)
  }

  public getSubscriptionStatus(): Promise<Record<string, Record<string, number>>> {
    return this.actualClient.getSubscriptionStatus()
  }

  public onConnectionStatusChange(callback: (connected: boolean) => void): () => void {
    return this.actualClient.onConnectionStatusChange(callback)
  }

  public isWebSocketConnected(): boolean {
    return this.actualClient.isWebSocketConnected()
  }

  public close() {
    this.actualClient.close()
  }
}
