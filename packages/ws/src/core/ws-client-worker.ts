import type { SubscriptionCallback, SubscriptionParams, SubscriptionType, WSClientConfig } from './types'

import { WSWorkerMessageData, WSWorkerMessageResponseType, WSWorkerMessageType } from './worker/types'

/**
 * WebSocket 客户端（使用 Dedicated Worker 实现）
 * 每个页面/标签页有独立的 Worker 实例
 */
export class WSClientWorker {
  private worker: Worker | null = null
  private config: WSClientConfig
  /**
   * 数据处理器：统一处理所有订阅数据
   * 由 SubscriptionManager 设置
   */
  private dataHandler: ((type: SubscriptionType, data: any) => void) | null = null
  private isConnected = false
  private connectionStatusCallbacks: Set<(connected: boolean) => void> = new Set()
  private statusCallback: ((status: any) => void) | null = null

  constructor(config: WSClientConfig) {
    this.config = config
    this.initialize()
  }

  /**
   * 初始化 Worker
   */
  private initialize() {
    try {
      // 创建 Worker - Turbopack/Next.js 支持这种方式
      this.worker = new Worker(new URL('./worker/ws-worker-dedicated.ts', import.meta.url), {
        type: 'module',
        name: 'ws-worker',
      })

      this.worker.onmessage = this.handleWorkerMessage.bind(this)
      this.worker.onerror = (error) => {
        console.error('[WSClient] Worker error:', error)
      }

      // 发送初始化配置
      this.sendToWorker({
        type: WSWorkerMessageType.INIT,
        config: this.config,
      })

      this.log('Worker initialized')
    } catch (error) {
      console.error('[WSClient] Failed to initialize Worker:', error)
      throw error
    }
  }

  /**
   * 处理来自 Worker 的消息
   */
  private handleWorkerMessage(event: MessageEvent) {
    const message = event.data

    switch (message.type) {
      case WSWorkerMessageResponseType.READY:
        this.log('Worker is ready')
        break
      case WSWorkerMessageResponseType.DATA:
        // 分发数据到对应的回调
        this.dispatchData(message.subscriptionType, message.data)
        break
      case WSWorkerMessageResponseType.CONNECTION_STATUS:
        // 连接状态变化
        this.isConnected = message.connected
        this.notifyConnectionStatus(message.connected)
        break
      case WSWorkerMessageResponseType.STATUS:
        // 订阅状态响应
        if (this.statusCallback) {
          this.statusCallback(message.data)
          this.statusCallback = null
        }
        break
    }
  }

  /**
   * 设置数据处理器
   * @param handler 数据处理函数
   */
  public setDataHandler(handler: (type: SubscriptionType, data: string) => void) {
    this.dataHandler = handler
  }

  /**
   * 分发数据到回调
   */
  private dispatchData(type: SubscriptionType, data: string) {
    if (this.dataHandler) {
      try {
        this.dataHandler(type, data)
      } catch (error) {
        this.log('Error in data handler:', error)
      }
    }
  }

  /**
   * 发送消息到 Worker
   */
  private sendToWorker(message: WSWorkerMessageData) {
    if (!this.worker) {
      this.log('Worker not available')
      return
    }

    try {
      this.worker.postMessage(message)
    } catch (error) {
      this.log('Failed to send message to worker:', error)
    }
  }

  /**
   * 订阅
   */
  public subscribe(type: SubscriptionType, params: SubscriptionParams): () => void {
    // 发送订阅请求到 Worker
    this.sendToWorker({
      type: WSWorkerMessageType.SUBSCRIBE,
      subscriptionType: type,
      params,
    })

    this.log(`Subscribed to ${type}/${params.topic}`)

    // 返回取消订阅函数
    return () => this.unsubscribe(type, params)
  }

  /**
   * 取消订阅
   */
  private unsubscribe(type: SubscriptionType, params: SubscriptionParams) {
    // 发送取消订阅请求到 Worker
    this.sendToWorker({
      type: WSWorkerMessageType.UNSUBSCRIBE,
      subscriptionType: type,
      params,
    })

    this.log(`Unsubscribed from ${type}/${params.topic}`)
  }

  /**
   * 获取订阅状态
   */
  public getSubscriptionStatus(): Promise<Record<string, Record<string, number>>> {
    return new Promise((resolve) => {
      this.statusCallback = resolve
      this.sendToWorker({
        type: WSWorkerMessageType.GET_STATUS,
      })
    })
  }

  /**
   * 监听连接状态变化
   */
  public onConnectionStatusChange(callback: (connected: boolean) => void) {
    this.connectionStatusCallbacks.add(callback)
    // 立即通知当前状态
    callback(this.isConnected)

    // 返回取消监听函数
    return () => {
      this.connectionStatusCallbacks.delete(callback)
    }
  }

  /**
   * 通知连接状态变化
   */
  private notifyConnectionStatus(connected: boolean) {
    this.connectionStatusCallbacks.forEach((callback) => {
      try {
        callback(connected)
      } catch (error) {
        this.log('Error in connection status callback:', error)
      }
    })
  }

  /**
   * 获取连接状态
   */
  public isWebSocketConnected(): boolean {
    return this.isConnected
  }

  /**
   * 关闭连接
   */
  public close() {
    // 清理
    this.dataHandler = null
    this.connectionStatusCallbacks.clear()

    // 通知 Worker 关闭
    if (this.worker) {
      this.sendToWorker({
        type: WSWorkerMessageType.CLOSE,
      })
      this.worker.terminate()
      this.worker = null
    }

    this.log('Client closed')
  }

  /**
   * 日志输出
   */
  private log(...args: any[]) {
    if (this.config.debug) {
      console.log('[WSClient]', ...args)
    }
  }
}
