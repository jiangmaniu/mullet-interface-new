import { type } from 'os'
import ReconnectingWebSocket from 'reconnecting-websocket'
import type {
  InternalWSMessage,
  SubscriptionParams,
  SubscriptionType,
  UnsubscribeParams,
  WSClientConfig,
  WSReceivedMessage,
  WSSendMessageHeader,
} from '../types'

import {
  WSWorkerMessageData,
  WSWorkerMessageResponseType,
  WSWorkerMessageType,
  WSWorkerSubscribeMessageData,
  WSWorkerUnsubscribeMessageData,
} from './types'

/**
 * Dedicated Worker 内的 WebSocket 管理器
 * 每个页面/标签页有独立的 Worker 实例
 */
/**
 * Worker 只负责 WebSocket 连接和消息转发
 * 不维护订阅状态，所有状态由 SubscriptionManager 管理
 */
class WSWorkerManager {
  private ws: ReconnectingWebSocket | null = null
  private config: WSClientConfig | null = null

  /**
   * 连接状态
   */
  private isConnected = false

  /**
   * 待发送的消息队列（连接断开时暂存）
   */
  private messageQueue: InternalWSMessage[] = []

  /**
   * 处理来自主线程的消息
   */
  public handleMessage(message: WSWorkerMessageData) {
    switch (message.type) {
      case WSWorkerMessageType.INIT:
        this.initialize(message.config)
        break
      case WSWorkerMessageType.SUBSCRIBE:
        // 直接转发订阅请求到服务器
        this.sendSubscribeMessage(message.subscriptionType, message.params)
        break
      case WSWorkerMessageType.UNSUBSCRIBE:
        // 直接转发取消订阅请求到服务器
        this.sendUnsubscribeMessage(message.subscriptionType, message.params)
        break
      case WSWorkerMessageType.CLOSE:
        this.close()
        break
      case WSWorkerMessageType.GET_STATUS:
        // Worker 不维护状态，返回空对象
        this.sendToMain({
          type: WSWorkerMessageResponseType.STATUS,
          data: {},
        })
        break
    }
  }

  /**
   * 初始化 WebSocket 连接
   */
  private initialize(config: WSClientConfig) {
    if (this.ws) {
      this.log('WebSocket already initialized')
      return
    }

    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      debug: false,
      ...config,
    }

    try {
      this.ws = new ReconnectingWebSocket(this.config.url, this.config.protocol ?? [], {
        maxRetries: this.config.maxReconnectAttempts,
        reconnectionDelayGrowFactor: 1.3,
        minReconnectionDelay: this.config.reconnectInterval,
        maxReconnectionDelay: this.config.reconnectInterval! * 3,
        debug: this.config.debug,
      })

      this.ws.addEventListener('open', this.handleOpen.bind(this))
      this.ws.addEventListener('message', this.handleWSMessage.bind(this))
      this.ws.addEventListener('close', this.handleClose.bind(this))
      this.ws.addEventListener('error', ((error: Event) => this.handleError(error)) as any)

      this.log('WebSocket initialized')
    } catch (error) {
      this.log('Failed to initialize WebSocket:', error)
    }
  }

  /**
   * 处理连接打开
   */
  private handleOpen() {
    this.isConnected = true
    this.log('WebSocket connected')

    // 通知主线程连接状态
    this.sendToMain({
      type: WSWorkerMessageResponseType.CONNECTION_STATUS,
      connected: true,
    })

    // 发送队列中的消息
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.sendMessage(message)
      }
    }

    // Worker 不维护订阅状态
    // 重连后，SubscriptionManager 会通过 onConnectionStatusChange 监听到连接恢复
    // 并自动重新发送订阅请求
  }

  /**
   * 处理收到的 WebSocket 消息
   */
  private handleWSMessage(event: MessageEvent) {
    try {
      const serverMessage = JSON.parse(event.data)
      this.log('Received WebSocket message:', serverMessage)

      const receivedMessage = serverMessage as WSReceivedMessage

      if (!receivedMessage.body || !receivedMessage?.header?.msgId) {
        return
      }

      // 将服务器消息转换为内部格式
      if (receivedMessage) {
        this.dispatchMessage(receivedMessage.header.msgId, receivedMessage.body)
      }
    } catch (error) {
      this.log('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * 处理连接关闭
   */
  private handleClose() {
    this.isConnected = false
    this.log('WebSocket disconnected')

    // 通知主线程连接状态
    this.sendToMain({
      type: WSWorkerMessageResponseType.CONNECTION_STATUS,
      connected: false,
    })
  }

  /**
   * 处理错误
   */
  private handleError(error: Event) {
    this.log('WebSocket error:', error)
  }

  /**
   * 转发消息到主线程
   * Worker 不验证订阅状态，直接转发所有收到的数据
   * 由 SubscriptionManager 负责过滤和分发
   */
  private dispatchMessage(type: SubscriptionType, data: string) {
    this.sendToMain({
      type: WSWorkerMessageResponseType.DATA,
      subscriptionType: type,
      data,
    })
  }

  /**
   * 发送消息到 WebSocket 服务器
   */
  private sendMessage(message: InternalWSMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('WebSocket not connected, queueing message:', message)
      this.messageQueue.push(message)
      return
    }

    try {
      // 转换为服务器格式再发送
      const params = message.params
      if (!params.topic) {
        throw new Error('topic is required for server message')
      }

      const header: WSSendMessageHeader = {
        msgId: 'subscribe',
        flowId: Date.now(),
        ...params.header,
      }

      const topic = params.topic
      const cancel = message.action === 'unsubscribe'

      const serverMessage = {
        header,
        body: {
          cancel,
          topic,
        },
      }

      this.ws.send(JSON.stringify(serverMessage))
      this.log('Sent WebSocket message:', serverMessage)
    } catch (error) {
      this.log('Failed to send WebSocket message:', error)
    }
  }

  /**
   * 发送订阅消息
   */
  private sendSubscribeMessage(type: SubscriptionType, params: SubscriptionParams) {
    this.sendMessage({
      type,
      action: 'subscribe',
      params,
    })
  }

  /**
   * 发送取消订阅消息
   */
  private sendUnsubscribeMessage(type: SubscriptionType, params: UnsubscribeParams) {
    this.sendMessage({
      type,
      action: 'unsubscribe',
      params,
    })
  }

  /**
   * 发送消息到主线程
   */
  private sendToMain(message: any) {
    try {
      self.postMessage(message)
    } catch (error) {
      this.log('Failed to send message to main thread:', error)
    }
  }

  /**
   * 关闭连接
   */
  private close() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageQueue = []
    this.isConnected = false
    this.log('WebSocket closed')
  }

  /**
   * 日志输出
   */
  private log(...args: any[]) {
    if (this.config?.debug) {
      console.log('[WSWorker]', ...args)
    }
  }
}

// 创建全局管理器实例
const manager = new WSWorkerManager()

// 监听来自主线程的消息
self.addEventListener('message', (event: MessageEvent) => {
  manager.handleMessage(event.data)
})

// 通知主线程 Worker 已就绪
self.postMessage({ type: 'ready' })

console.log('[WSWorker] Dedicated Worker initialized and ready')
