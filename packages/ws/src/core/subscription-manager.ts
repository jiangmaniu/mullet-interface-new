import type {
  AccountData,
  AnnouncementData,
  MarketData,
  MarketDepthData,
  OrderData,
  PositionData,
  SubscriptionCallback,
  SubscriptionParams,
  TradeMessage,
  TradeSubscriptionCallbacks,
  WSSendMessageHeader,
} from './types'

import { SubscriptionType, TradeSubType } from './types'
import { WSClient } from './ws-client'
import { parseWSData } from './ws-data-parser'

/**
 * 订阅管理器
 * 提供针对不同订阅类型的独立订阅方法
 * 在这一层维护回调数组，管理订阅生命周期
 */
export class SubscriptionManager {
  private client: WSClient

  private userId: string = '123456789'
  private tenantId: string = '000000'
  /**
   * 订阅回调管理
   * 结构: Map<SubscriptionType, Map<symbol, Set<callback>>>
   */
  private subscriptionCallbacks: Map<SubscriptionType, Map<string, Set<SubscriptionCallback>>> = new Map()

  /**
   * 底层订阅取消函数管理
   * 结构: Map<SubscriptionType, Map<symbol, unsubscribe>>
   */
  private clientUnsubscribers: Map<SubscriptionType, Map<string, () => void>> = new Map()

  /**
   * 保存订阅参数，用于重连时重新订阅
   * 结构: Map<SubscriptionType, Map<key, SubscriptionParams>>
   */
  private subscriptionParams: Map<SubscriptionType, Map<string, SubscriptionParams>> = new Map()

  constructor(client: WSClient) {
    this.client = client

    // 设置数据处理器
    this.client.setDataHandler((type: SubscriptionType, data: string) => {
      // debugger
      this._dispatchToCallbacks(type, data)
    })

    // 监听连接状态变化，重连后自动重新订阅
    this.client.onConnectionStatusChange((connected) => {
      if (connected) {
        this._resubscribeAll()
      }
    })
  }

  /**
   * 通用订阅方法
   * @param type 订阅类型
   * @param symbol 交易对符号
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  private _subscribe<T>(
    type: SubscriptionType,
    params: SubscriptionParams,
    callback: SubscriptionCallback<T>,
  ): () => void {
    const key = params.key
    const tenantId = params.header?.tenantId ?? this.tenantId
    const topic = `/${tenantId}/${type}${params.topic}`
    params.topic = topic
    params.header = {
      ...params.header,
      userId: this.userId,
    }

    // 获取或创建订阅类型的 Map
    if (!this.subscriptionCallbacks.has(type)) {
      this.subscriptionCallbacks.set(type, new Map())
    }
    const typeCallbacks = this.subscriptionCallbacks.get(type)!

    // 获取或创建 key 的回调集合
    if (!typeCallbacks.has(key)) {
      typeCallbacks.set(key, new Set())

      // 首次订阅该 key，调用底层订阅
      this._subscribeToClient(type, params)
    }
    const callbacks = typeCallbacks.get(key)!

    // 添加回调
    callbacks.add(callback)

    // 返回取消订阅函数
    return () => this._unsubscribe(type, key, callback)
  }

  /**
   * 取消订阅
   * @param type 订阅类型
   * @param key
   * @param callback 要移除的回调函数
   */
  private _unsubscribe(type: SubscriptionType, key: string, callback: SubscriptionCallback): void {
    const typeCallbacks = this.subscriptionCallbacks.get(type)
    if (!typeCallbacks) return

    const callbacks = typeCallbacks.get(key)
    if (!callbacks) return

    // 从回调集合中移除
    callbacks.delete(callback)

    // 如果该 key 没有回调了，取消底层订阅
    if (callbacks.size === 0) {
      typeCallbacks.delete(key)
      this._unsubscribeFromClient(type, key)
    }

    // 如果该类型没有任何订阅了，清理类型 Map
    if (typeCallbacks.size === 0) {
      this.subscriptionCallbacks.delete(type)
    }
  }

  /**
   * 调用底层客户端订阅
   * @param type 订阅类型
   * @param params 订阅参数
   */
  private _subscribeToClient(type: SubscriptionType, params: SubscriptionParams): void {
    const key = params.key

    // 保存订阅参数，用于重连时重新订阅
    if (!this.subscriptionParams.has(type)) {
      this.subscriptionParams.set(type, new Map())
    }
    this.subscriptionParams.get(type)!.set(key, params)

    // 调用底层订阅（不需要传递回调，通过 dataHandler 统一处理）
    const unsubscribe = this.client.subscribe(type, params)

    // 保存取消订阅函数
    if (!this.clientUnsubscribers.has(type)) {
      this.clientUnsubscribers.set(type, new Map())
    }
    this.clientUnsubscribers.get(type)!.set(key, unsubscribe)
  }

  /**
   * 取消底层客户端订阅
   * @param type 订阅类型
   * @param key 交易对符号
   */
  private _unsubscribeFromClient(type: SubscriptionType, key: string): void {
    const typeUnsubscribers = this.clientUnsubscribers.get(type)
    if (!typeUnsubscribers) return

    const unsubscribe = typeUnsubscribers.get(key)
    if (unsubscribe) {
      unsubscribe()
      typeUnsubscribers.delete(key)
    }

    // 清理订阅参数
    const typeParams = this.subscriptionParams.get(type)
    if (typeParams) {
      typeParams.delete(key)
      if (typeParams.size === 0) {
        this.subscriptionParams.delete(type)
      }
    }

    // 清理空的 Map
    if (typeUnsubscribers.size === 0) {
      this.clientUnsubscribers.delete(type)
    }
  }

  /**
   * 分发数据到所有回调
   * @param type 订阅类型
   * @param data 数据
   */
  private _dispatchToCallbacks(type: SubscriptionType, data: string): void {
    // debugger
    const typeCallbacks = this.subscriptionCallbacks.get(type)
    if (!typeCallbacks) return

    const parsedData = parseWSData(type, data)
    const key = parsedData?.key
    if (!key) return

    const callbacks = typeCallbacks.get(key)
    if (!callbacks) return

    // 遍历执行所有回调
    callbacks.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in subscription callback for ${type}/${key}:`, error)
      }
    })
  }

  /**
   * 重新订阅所有已有的订阅（用于重连后）
   */
  private _resubscribeAll(): void {
    console.log('[SubscriptionManager] Reconnected, resubscribing all...')

    let resubscribeCount = 0

    // 遍历所有保存的订阅参数，重新发送订阅请求
    this.subscriptionParams.forEach((paramsMap, type) => {
      paramsMap.forEach((params, key) => {
        console.log(`[SubscriptionManager] Resubscribing ${type}/${key}`)

        // 重新调用底层订阅
        const unsubscribe = this.client.subscribe(type, params)

        // 更新取消订阅函数
        const typeUnsubscribers = this.clientUnsubscribers.get(type)
        if (typeUnsubscribers) {
          typeUnsubscribers.set(key, unsubscribe)
        }

        resubscribeCount++
      })
    })

    console.log(`[SubscriptionManager] Resubscribed ${resubscribeCount} subscriptions`)
  }

  /**
   * 订阅行情数据
   * @param symbol 交易对符号
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  public subscribeMarketData(
    params: {
      symbol: string
      accountId: string
      header?: Partial<WSSendMessageHeader>
    },
    callback: SubscriptionCallback<MarketData>,
  ): () => void {
    const subscriptionParams: SubscriptionParams = {
      topic: `/${params.symbol}/${params.accountId}`,
      key: params.symbol,
      header: params.header,
    }
    // debugger
    return this._subscribe(SubscriptionType.MARKET_DATA, subscriptionParams, callback)
  }

  /**
   * 订阅行情深度
   * @param symbol 交易对符号
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  // public subscribeMarketDepth(symbol: string, callback: SubscriptionCallback<MarketDepthData>): () => void {
  //   return this._subscribe(SubscriptionType.MARKET_DEPTH, symbol, callback)
  // }

  /**
   * 订阅公告信息
   * @param symbol 交易对符号或分类标识
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  // public subscribeAnnouncement(symbol: string, callback: SubscriptionCallback<AnnouncementData>): () => void {
  //   return this._subscribe(SubscriptionType.ANNOUNCEMENT, symbol, callback)
  // }

  /**
   * 订阅交易类型消息（统一的交易订阅）
   * @param symbol 交易对符号
   * @param callbacks 回调函数配置
   * @returns 取消订阅函数
   */
  // public subscribeTrade(symbol: string, callbacks: TradeSubscriptionCallbacks): () => void {
  //   // 创建一个统一的回调来处理所有交易消息
  //   const unifiedCallback: SubscriptionCallback<TradeMessage> = (message) => {
  //     switch (message.subType) {
  //       case TradeSubType.POSITION:
  //         if (callbacks.onPosition) {
  //           callbacks.onPosition(message.data as PositionData)
  //         }
  //         break
  //       case TradeSubType.ORDER:
  //         if (callbacks.onOrder) {
  //           callbacks.onOrder(message.data as OrderData)
  //         }
  //         break
  //       case TradeSubType.ACCOUNT:
  //         if (callbacks.onAccount) {
  //           callbacks.onAccount(message.data as AccountData)
  //         }
  //         break
  //     }
  //   }

  //   return this._subscribe(SubscriptionType.TRADE, symbol, unifiedCallback)
  // }

  /**
   * 订阅仓位信息（快捷方法）
   * @param symbol 交易对符号
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  // public subscribePositionList(symbol: string, callback: SubscriptionCallback<PositionData>): () => void {
  //   return this.subscribeTrade(symbol, { onPosition: callback })
  // }

  /**
   * 订阅挂单信息（快捷方法）
   * @param symbol 交易对符号
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  // public subscribeOrder(symbol: string, callback: SubscriptionCallback<OrderData>): () => void {
  //   return this.subscribeTrade(symbol, { onOrder: callback })
  // }

  /**
   * 订阅账户信息（快捷方法）
   * @param symbol 交易对符号
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  // public subscribeAccount(symbol: string, callback: SubscriptionCallback<AccountData>): () => void {
  //   return this.subscribeTrade(symbol, { onAccount: callback })
  // }

  /**
   * 获取当前订阅状态（异步）
   */
  public getSubscriptionStatus(): Promise<Record<string, Record<string, number>>> {
    return this.client.getSubscriptionStatus()
  }

  /**
   * 监听连接状态变化
   * @param callback 连接状态回调函数
   * @returns 取消监听函数
   */
  public onConnectionStatusChange(callback: (connected: boolean) => void): () => void {
    return this.client.onConnectionStatusChange(callback)
  }

  /**
   * 获取当前连接状态
   */
  public isConnected(): boolean {
    return this.client.isWebSocketConnected()
  }
}
