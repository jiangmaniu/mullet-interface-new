import NetInfo from '@react-native-community/netinfo'
import { AppState, Platform } from 'react-native'
import { groupBy } from 'lodash-es'
import ReconnectingWebSocket from 'reconnecting-websocket'
import type { NativeEventSubscription } from 'react-native'
import type Reactotron from 'reactotron-react-native'
import type { IDepth, IMessage, IQuoteItem, Unsubscribe } from './types'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import { EXPO_ENV_CONFIG } from '@/constants/expo'
import { saveSnapshot } from '@/lib/storage/snapshot'
import { useRootStore } from '@/stores'
import { marketQuoteSliceSelector } from '@/stores/market-slice/quote-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { formaOrderList } from '@/v1/services/tradeCore/order'
import trade from '@/v1/stores/trade'
import { uniqueObjectArray } from '@/v1/utils'
import mitt from '@/v1/utils/mitt'

import { parseDepthBodyData, parseQuoteBodyData } from './quote-parser'


// Reactotron WS 日志（仅开发环境）
let tron: typeof Reactotron | null = null
if (__DEV__) {
  try {
    tron = require('@/lib/reactotron').default
  } catch {}
}

class MulletWS {
  private static instance: MulletWS | null = null
  private static defaultToken: string = 'visitor'

  static getInstance(): MulletWS {
    if (!MulletWS.instance) {
      MulletWS.instance = new MulletWS()
    }
    return MulletWS.instance
  }

  /** 登出时调用，清理所有状态 */
  static destroy(): void {
    MulletWS.instance?.close()
    MulletWS.instance = null
  }

  private constructor() {}

  // ==================== 连接管理 ====================
  private socket: ReconnectingWebSocket | null = null
  private wsUrl: string = ''
  private wsToken: string | undefined = undefined

  async connect(token?: string): Promise<void> {
    if (token === this.wsToken && this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    // 防止重复调用泄漏
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.stopHeartbeat()
    }

    const wsUrl = EXPO_ENV_CONFIG.WS_URL
    this.wsUrl = wsUrl
    this.wsToken = token

    this.socket = new ReconnectingWebSocket(this.wsUrl, ['WebSocket', this.wsToken ?? MulletWS.defaultToken], {
      minReconnectionDelay: 1,
      connectionTimeout: 3000, // 重连时间
      maxEnqueuedMessages: 0, // 不缓存发送失败的指令
      maxRetries: 10000000, // 最大重连次数
      // debug: __DEV__
    })

    this.socket.addEventListener('open', () => {
      this.startHeartbeat()
      this.resubscribeAll()
    })

    this.socket.addEventListener('message', (event: any) => {
      try {
        const res = JSON.parse(event.data)
        this.onMessage(res)
      } catch {}
    })

    this.socket.addEventListener('close', () => {
      this.stopHeartbeat()
    })

    this.setupAppStateListener()
    this.setupNetworkListener()
  }

  close(): void {
    // 保存行情快照
    const quoteMap = marketQuoteSliceSelector(useRootStore.getState()).quoteMap
    if (Object.keys(quoteMap).length > 0) {
      saveSnapshot('quote', quoteMap)
    }

    this.socket?.close()
    this.socket = null
    this.stopHeartbeat()
    this.clearPendingQueues()
    this.removeAppStateListener()
    this.removeNetworkListener()
  }

  reconnect(): void {
    const token = this.wsToken
    this.close()
    setTimeout(() => {
      this.connect(token)
    }, 500)
  }

  checkSocketReady(callback?: () => void): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      callback?.()
    } else {
      this.connect(this.wsToken).then(callback)
    }
  }

  /** 获取 socket readyState */
  get readyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED
  }

  // ==================== 心跳管理 ====================
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private readonly HEARTBEAT_INTERVAL = 20_000

  private startHeartbeat(): void {
    const token = useRootStore.getState().user.auth.accessToken
    if (!token) return
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.send({}, { msgId: 'heartbeat' })
    }, this.HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // ==================== 订阅管理（引用计数 + 批量合并） ====================
  private refCounts: Map<string, number> = new Map()
  private pendingSubscribe: Set<string> = new Set()
  private pendingUnsubscribe: Set<string> = new Set()
  private subscribeFlushScheduled = false
  private unsubscribeTimer: ReturnType<typeof setTimeout> | null = null
  private readonly UNSUBSCRIBE_DELAY = 5_000

  // queueMicrotask 兼容 Hermes
  private readonly enqueue =
    typeof queueMicrotask === 'function' ? queueMicrotask : (fn: () => void) => Promise.resolve().then(fn)

  /**
   * 订阅 topics，返回取消订阅函数
   * - 内部维护引用计数，同一 topic 被多个组件订阅时只发送一次
   * - 订阅通过 queueMicrotask 批量合并
   * - 取消订阅延迟 UNSUBSCRIBE_DELAY s 批量合并，避免页面切换时无效取消
   */
  subscribe(topics: NestedStringArray[]): Unsubscribe {
    const flatTopics = (topics as unknown[]).flat(Infinity) as string[]
    flatTopics.forEach((topic) => {
      const count = this.refCounts.get(topic) || 0
      this.refCounts.set(topic, count + 1)
      if (count === 0) {
        // 首次订阅，加入待发送队列
        this.pendingSubscribe.add(topic)
        // 从取消队列移除（页面切换场景）
        this.pendingUnsubscribe.delete(topic)
      }
    })
    this.scheduleSubscribeFlush()

    // 返回幂等的取消函数
    let disposed = false
    return () => {
      if (disposed) return
      disposed = true
      flatTopics.forEach((topic) => {
        const count = this.refCounts.get(topic) || 0
        if (count <= 1) {
          this.refCounts.delete(topic)
          this.pendingUnsubscribe.add(topic)
          this.pendingSubscribe.delete(topic)
        } else {
          this.refCounts.set(topic, count - 1)
        }
      })
      this.scheduleUnsubscribeFlush()
    }
  }

  /** 微任务批量合并订阅 */
  private scheduleSubscribeFlush(): void {
    if (this.subscribeFlushScheduled) return
    this.subscribeFlushScheduled = true
    this.enqueue(() => {
      this.subscribeFlushScheduled = false
      if (this.pendingSubscribe.size > 0) {
        this.sendTopics([...this.pendingSubscribe], false)
        this.pendingSubscribe.clear()
      }
    })
  }

  /** 延迟 UNSUBSCRIBE_DELAY s 批量合并取消订阅 */
  private scheduleUnsubscribeFlush(): void {
    if (this.unsubscribeTimer) return
    this.unsubscribeTimer = setTimeout(() => {
      this.unsubscribeTimer = null
      // 二次检查：过滤掉延迟期间被重新订阅的 topic
      const toUnsub = [...this.pendingUnsubscribe].filter((topic) => !this.refCounts.has(topic))
      this.pendingUnsubscribe.clear()
      if (toUnsub.length > 0) {
        this.sendTopics(toUnsub, true)
      }
    }, this.UNSUBSCRIBE_DELAY)
  }

  private sendTopics(topics: string[], cancel: boolean): void {
    console.log('mullet-ws', topics, cancel)
    this.send({ topic: topics.join(','), cancel })
  }

  private clearPendingQueues(): void {
    this.pendingSubscribe.clear()
    this.pendingUnsubscribe.clear()
    this.subscribeFlushScheduled = false
    if (this.unsubscribeTimer) {
      clearTimeout(this.unsubscribeTimer)
      this.unsubscribeTimer = null
    }
  }

  // ==================== 前后台管理 ====================
  private appStateSubscription: NativeEventSubscription | null = null
  private pausedTopics: string[] = []

  private setupAppStateListener(): void {
    this.removeAppStateListener()
    this.appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        this.onEnterBackground()
      } else if (state === 'active') {
        this.onEnterForeground()
      }
    })
  }

  private removeAppStateListener(): void {
    this.appStateSubscription?.remove()
    this.appStateSubscription = null
  }

  private onEnterBackground(): void {
    // 记录当前活跃订阅快照（不清 refCounts，保留业务层状态）
    this.pausedTopics = [...this.refCounts.keys()]
    if (this.pausedTopics.length > 0) {
      this.sendTopics(this.pausedTopics, true)
    }
    this.stopHeartbeat()
  }

  private onEnterForeground(): void {
    // 用当前 refCounts 过滤：排除后台期间已卸载组件的订阅
    const toResume = this.pausedTopics.filter((t) => this.refCounts.has(t))
    this.pausedTopics = []

    if (this.socket?.readyState === WebSocket.OPEN) {
      if (toResume.length > 0) {
        this.sendTopics(toResume, false)
      }
      this.startHeartbeat()
    } else {
      // 连接已断，重连后 resubscribeAll 会在 open 回调中恢复
      this.connect(this.wsToken)
    }
  }

  // ==================== 网络状态监听 ====================
  private netInfoUnsubscribe?: () => void

  private setupNetworkListener(): void {
    this.removeNetworkListener()

    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      // 当网络恢复且 WebSocket 未连接（或正在重连但未成功）时，主动触发重连
      // 这比等待 reconnecting-websocket 的下一个退避周期更快
      if (
        state.isConnected &&
        this.socket &&
        this.socket.readyState !== WebSocket.OPEN &&
        this.socket.readyState !== WebSocket.CONNECTING
      ) {
        this.reconnect()
      }
    })
  }

  private removeNetworkListener(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe()
      this.netInfoUnsubscribe = undefined
    }
  }

  // ==================== 重连后重新订阅 ====================
  private resubscribeAll(): void {
    const topics = [...this.refCounts.keys()]
    if (topics.length > 0) {
      this.sendTopics(topics, false)
    }
    if (this.wsToken) {
      this.subscribeMessage()
      this.subscribeNotify()
      this.subscribePosition()
    }
  }

  // ==================== 特殊订阅（不纳入引用计数） ====================

  /** 当前已订阅的账户 ID，切换账户时用于取消旧订阅 */
  private subscribedAccountId: string | null = null

  /** 切换账户后重新订阅持仓/消息/通知 */
  onAccountSwitch(): void {
    // 取消旧账户的持仓推送
    if (this.subscribedAccountId) {
      this.send({ topic: `/${DEFAULT_TENANT_ID}/trade/${this.subscribedAccountId}`, cancel: true })
      this.subscribedAccountId = null
    }
    this.subscribeMessage()
    this.subscribeNotify()
    this.subscribePosition()
  }

  /** 订阅系统消息通知 */
  subscribeMessage(cancel?: boolean): void {
    const userInfo = useRootStore.getState().user.auth.loginInfo as User.UserInfo
    if (!userInfo?.user_id) return
    this.send({ topic: `/${DEFAULT_TENANT_ID}/public/1`, cancel })
    this.send({ topic: `/${DEFAULT_TENANT_ID}/role/${userInfo.role_id}`, cancel })
    this.send({ topic: `/${DEFAULT_TENANT_ID}/dept/${userInfo.dept_id}`, cancel })
    this.send({ topic: `/${DEFAULT_TENANT_ID}/post/${userInfo.post_id}`, cancel })
    this.send({ topic: `/${DEFAULT_TENANT_ID}/user/${userInfo?.user_id}`, cancel })
  }

  /** 订阅支付响应消息 */
  subscribeNotify(cancel?: boolean): void {
    const userInfo = useRootStore.getState().user.auth.loginInfo as User.UserInfo
    if (!userInfo?.user_id) return
    this.send({ topic: `/${DEFAULT_TENANT_ID}/msg/${userInfo?.user_id}`, cancel })
  }

  /** 订阅持仓/挂单/账户推送 */
  subscribePosition(cancel?: boolean): void {
    const accountId = userInfoActiveTradeAccountIdSelector(useRootStore.getState())
    if (!accountId) return
    if (!cancel) this.subscribedAccountId = accountId
    this.send({ topic: `/${DEFAULT_TENANT_ID}/trade/${accountId}`, cancel })
  }

  /** 订阅深度报价（命令式，不纳入引用计数） */
  subscribeDepth(symbol?: string, accountGroupId?: string, cancel?: boolean): void {
    if (!symbol) return
    const topic = `/${DEFAULT_TENANT_ID}/depth/${symbol}/${accountGroupId}`
    setTimeout(() => {
      this.send({ topic, cancel })
    }, 300)
  }

  // ==================== 消息分发 ====================
  private readonly THROTTLE_QUOTE_INTERVAL = Platform.OS === 'ios' ? 150 : 200
  private readonly THROTTLE_DEPTH_INTERVAL = 300
  private readonly MAX_CACHE_SIZE = 150
  private quotesCache: string[] = []
  private depthCache: string[] = []
  private lastQuoteUpdateTime = 0
  private lastDepthUpdateTime = 0
  private quoteCount = 0

  // 暂保留 quotes 和 depth Map，供 wsUtil.ts 等消费者读取（过渡期）
  quotes = new Map<string, IQuoteItem>()
  depth = new Map<string, IDepth>()

  private onMessage(res: IMessage): void {
    const msgId = res.header?.msgId
    const data = res.body

    switch (msgId) {
      case 'symbol':
        this.batchUpdateQuoteData(data)
        break
      case 'depth':
        this.batchUpdateDepthData(data)
        break
      case 'trade':
        this.handleTradeMessage(data)
        break
      case 'notice':
        if (tron) {
          tron.display({ name: 'WS 通知', value: data, preview: data?.title || 'notice', important: true })
        }
        mitt.emit('ws-message-popup', data)
        break
      case 'msg':
        if (tron) {
          tron.display({ name: 'WS 响应', value: data, preview: 'msg', important: true })
        }
        mitt.emit('RESOLVE_MSG', data)
        break
    }
  }

  // ---- 行情数据批量更新 ----
  private batchUpdateQuoteData(data: string): void {
    if (!data || typeof data !== 'string') return
    this.quotesCache.push(data)

    // 加快首次渲染
    if (this.quoteCount < this.MAX_CACHE_SIZE) {
      this.updateQuoteData()
      this.quoteCount++
      return
    }
    // 缓存过大，强制刷新
    if (this.quotesCache.length >= this.MAX_CACHE_SIZE) {
      this.updateQuoteData()
      return
    }
    // 节流
    if (Date.now() - this.lastQuoteUpdateTime >= this.THROTTLE_QUOTE_INTERVAL) {
      this.updateQuoteData()
    }
  }

  private updateQuoteData(): void {
    if (!this.quotesCache.length) return

    const quotesCacheItems = this.quotesCache.map(parseQuoteBodyData)
    const symbolMap = groupBy(quotesCacheItems, 'symbol')

    const changedQuoteItems = quotesCacheItems
      .map((item) => {
        const dataSourceKey = item.dataSourceKey
        if (!dataSourceKey) return undefined
        const quoteData = this.quotes.get(dataSourceKey)

        let klineList = uniqueObjectArray(
          (symbolMap[item.symbol] || []).map((i) => ({
            price: i.priceData?.buy,
            id: i.priceData?.id,
          })),
          'price',
        )

        if (quoteData) {
          const prevSell = quoteData?.priceData?.sell || 0
          const prevBuy = quoteData?.priceData?.buy || 0
          const buy = item.priceData?.buy
          const sell = item.priceData?.sell
          const flag = buy && sell
          item.bidDiff = flag ? buy - prevBuy : 0
          item.askDiff = flag ? sell - prevSell : 0

          if (item.priceData) {
            item.priceData.buy = item.priceData.buy || prevBuy
            item.priceData.sell = item.priceData.sell || prevSell
          }

          if (flag && (buy !== prevBuy || sell !== prevSell)) {
            return { ...item, klineList }
          }
        } else {
          return { ...item, klineList }
        }
        return undefined
      })
      .filter(Boolean) as IQuoteItem[]

    changedQuoteItems.forEach((item) => {
      this.quotes.set(item.dataSourceKey, item)
    })

    if (changedQuoteItems.length > 0) {
      marketQuoteSliceSelector(useRootStore.getState()).addQuotes(changedQuoteItems)
    }

    this.quotesCache = []
    this.lastQuoteUpdateTime = Date.now()
  }

  // ---- 深度数据批量更新 ----
  private batchUpdateDepthData(data: string): void {
    if (!data || typeof data !== 'string') return
    this.depthCache.push(data)

    if (this.depthCache.length >= this.MAX_CACHE_SIZE) {
      this.updateDepthData()
      return
    }
    if (Date.now() - this.lastDepthUpdateTime >= this.THROTTLE_DEPTH_INTERVAL) {
      this.updateDepthData()
    }
  }

  private updateDepthData(): void {
    if (!this.depthCache.length) return

    this.depthCache.forEach((str) => {
      const item = parseDepthBodyData(str)
      if (item.dataSourceKey) {
        this.depth.set(item.dataSourceKey, item)
      }
    })

    this.depthCache = []
    this.lastDepthUpdateTime = Date.now()
  }

  // ---- 交易消息处理 ----
  private handleTradeMessage(data: any): void {
    if (tron) {
      tron.display({ name: 'WS 交易', value: data, preview: `type: ${data.type}`, important: true })
    }
    const type = data.type
    if (type === 'ACCOUNT') {
      const accountInfo = data.account || {}
      trade.currentAccountInfo = { ...trade.currentAccountInfo, ...accountInfo }
      useRootStore.getState().user.info.updateAccount(accountInfo)
    } else if (type === 'MARKET_ORDER') {
      const formatted = formaOrderList(data.bagOrderList || [])
      trade.positionList = formatted
      useRootStore.getState().trade.position.update(formatted)
    } else if (type === 'LIMIT_ORDER') {
      const formatted = formaOrderList(data.limiteOrderList || [])
      trade.pendingList = formatted
      useRootStore.getState().trade.order.update(formatted)
    }
  }

  // ==================== 发送 ====================
  private send(cmd: Record<string, any> = {}, header: Record<string, any> = {}): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return

    const userInfo = useRootStore.getState().user.auth.loginInfo as User.UserInfo
    const payload = {
      header: {
        tenantId: DEFAULT_TENANT_ID,
        userId: userInfo?.user_id || '123456789',
        msgId: 'subscribe',
        flowId: Date.now(),
        ...header,
      },
      body: {
        cancel: false,
        ...cmd,
      },
    }
    this.socket.send(JSON.stringify(payload))

    if (tron && header?.msgId !== 'heartbeat') {
      tron.display({
        name: 'WS 发送',
        value: payload,
        preview: (payload.body as any)?.topic?.slice(0, 60) || header?.msgId || 'subscribe',
        important: true,
      })
    }
  }
}

export default MulletWS
