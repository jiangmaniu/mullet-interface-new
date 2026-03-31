# WebSocket 重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用独立单例 MulletWS 类 + useSubscribeQuote hook 替代现有 MobX WSStore，实现按需订阅行情

**Architecture:** MulletWS 单例管理 WebSocket 连接、心跳、前后台切换、引用计数订阅（subscribe 用 queueMicrotask 批量合并，unsubscribe 用 setTimeout 2s 延迟合并）。业务层通过 useSubscribeQuote hook 声明式订阅，行情数据仍写入 Zustand quoteMap 不变。

**Tech Stack:** React Native, ReconnectingWebSocket, Zustand, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-23-ws-refactor-design.md`

---

### Task 1: 类型定义

**Files:**

- Create: `apps/mobile/src/lib/ws/types.ts`

- [ ] **Step 1: 创建类型文件**

从 `v1/stores/ws.ts` 提取类型定义到独立文件：

```typescript
// apps/mobile/src/lib/ws/types.ts

export type Unsubscribe = () => void

/** WS 消息格式 */
export type IMessage = {
  header: {
    flowId: number
    msgId: string
    tenantId: string
    userId: string
  }
  body: any
}

/** 行情价格数据 */
export type IQuotePriceItem = {
  /** 卖交易量 */
  sellSize: number
  /** 买 */
  buy: number
  /** 卖 */
  sell: number
  /** 13位时间戳 */
  id: number
  /** 买交易量 */
  buySize: number
}

/** 行情数据项 */
export type IQuoteItem = {
  /** 品种名称（唯一） */
  symbol: string
  /** 账户组id */
  accountGroupId?: string
  /** 价格数据 */
  priceData: IQuotePriceItem
  /** 数据源code+数据源品种 例如 huobi-btcusdt */
  dataSource: string
  /** 前端计算的卖价涨跌 */
  bidDiff?: number
  /** 前端计算的买价涨跌 */
  askDiff?: number
  /** 获取行情数据的 key */
  dataSourceKey: string
  /** k线原始数据 */
  klineList?: Omit<IKlinePriceItem, 'symbol'>[]
}

/** k线图原始数据 */
export type IKlinePriceItem = {
  symbol: string
  price: number
  id: number
}

/** 深度价格项 */
export type IDepthPriceItem = {
  amount: number
  price: number
}

/** 深度数据 */
export type IDepth = {
  symbol: string
  dataSource: string
  asks: IDepthPriceItem[]
  bids: IDepthPriceItem[]
  ts?: number
  accountGroupId?: string
  dataSourceKey: string
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/lib/ws/types.ts
git commit -m "feat(ws): 添加 WS 类型定义文件"
```

---

### Task 2: 行情/深度解析器

**Files:**

- Create: `apps/mobile/src/lib/ws/quote-parser.ts`
- Reference: `apps/mobile/src/v1/stores/ws.ts:762-836`（现有解析逻辑）

- [ ] **Step 1: 创建解析器文件**

从 `v1/stores/ws.ts` 提取 `parseQuoteBodyData` 和 `parseDepthBodyData`，修正深度分隔符 bug（现有代码用 `_` 分隔 price/amount，实际服务端数据用 `*`）。

```typescript
// apps/mobile/src/lib/ws/quote-parser.ts
import type { IDepth, IQuoteItem } from './types'

/**
 * 解析行情 body 数据
 * 格式：id,buy,buySize,sell,sellSize,dataSource,symbol,accountGroupId
 */
export const parseQuoteBodyData = (body: string): IQuoteItem => {
  const quoteItem = {} as IQuoteItem
  if (body && typeof body === 'string') {
    const [id, buy, buySize, sell, sellSize, dataSource, symbol, accountGroupId] = body.split(',')
    const [dataSourceCode, dataSourceSymbol] = String(dataSource || '')
      .split('-')
      .filter((v: any) => v)
    const sbl = symbol === '0' ? dataSourceSymbol : symbol
    const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`

    quoteItem.symbol = sbl
    quoteItem.dataSource = dataSource
    quoteItem.dataSourceKey = dataSourceKey
    quoteItem.accountGroupId = accountGroupId
    quoteItem.priceData = {
      sellSize: Number(sellSize || 0),
      buy: Number(buy || 0),
      sell: Number(sell || 0),
      id: Number(id || 0),
      buySize: Number(buySize || 0),
    }
  }
  return quoteItem
}

/**
 * 解析深度 body 数据
 * 格式：asks(price*amount;price*amount;...),bids(...),dataSource,symbol,accountGroupId,ts
 *
 * 注意：旧代码用 split('_') 分隔 price/amount，但实际服务端推送数据用 '*' 分隔
 */
export const parseDepthBodyData = (body: string): IDepth => {
  const depthData = {} as IDepth
  if (body && typeof body === 'string') {
    const [asks, bids, dataSource, symbol, accountGroupId, ts] = body.split(',')
    const [dataSourceCode, dataSourceSymbol] = (dataSource || '').split('-').filter((v: any) => v)
    const sbl = symbol || dataSourceSymbol
    const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${sbl}` : `${dataSourceCode}/${sbl}`
    depthData.symbol = sbl
    depthData.dataSource = dataSource
    depthData.dataSourceKey = dataSourceKey
    depthData.accountGroupId = accountGroupId
    depthData.ts = Number(ts || 0)

    const parseItems = (str: string) =>
      str
        ? str.split(';').map((item) => {
            // 修正：服务端用 * 分隔 price 和 amount
            const [price, amount] = (item || '').split('*')
            return { price: Number(price || 0), amount: Number(amount || 0) }
          })
        : []

    depthData.asks = parseItems(asks)
    depthData.bids = parseItems(bids)
  }
  return depthData
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/lib/ws/quote-parser.ts
git commit -m "feat(ws): 提取行情/深度解析器，修正深度 price*amount 分隔符"
```

---

### Task 3: MulletWS 核心类

**Files:**

- Create: `apps/mobile/src/lib/ws/mullet-ws.ts`
- Reference: `apps/mobile/src/v1/stores/ws.ts`（现有 WSStore 全部逻辑）
- Reference: `apps/mobile/src/lib/ws/types.ts`
- Reference: `apps/mobile/src/lib/ws/quote-parser.ts`

这是最核心的 task，包含连接管理、心跳、订阅引用计数、批量合并、前后台处理、消息分发。

- [ ] **Step 1: 创建 MulletWS 类骨架（单例 + 连接管理 + 心跳）**

```typescript
// apps/mobile/src/lib/ws/mullet-ws.ts
import { AppState, Platform } from 'react-native'
import { groupBy } from 'lodash-es'
import ReconnectingWebSocket from 'reconnecting-websocket'
import type { NativeEventSubscription } from 'react-native'
import type Reactotron from 'reactotron-react-native'
import type { IDepth, IMessage, IQuoteItem, Unsubscribe } from './types'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import { saveSnapshot } from '@/lib/storage/snapshot'
import { formaOrderList } from '@/services/tradeCore/order'
import { useRootStore } from '@/stores'
import { marketQuoteSliceSelector } from '@/stores/market-slice/quote-slice'
import {
  userInfoActiveTradeAccountIdSelector,
  userInfoActiveTradeAccountInfoSelector,
} from '@/stores/user-slice/infoSlice'
import { uniqueObjectArray } from '@/utils'
import mitt from '@/utils/mitt'

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

  static getInstance(): MulletWS {
    if (!MulletWS.instance) {
      MulletWS.instance = new MulletWS()
    }
    return MulletWS.instance
  }

  static destroy(): void {
    MulletWS.instance?.close()
    MulletWS.instance = null
  }

  private constructor() {}

  // ==================== 连接管理 ====================
  private socket: ReconnectingWebSocket | null = null
  private wsUrl: string = ''
  private wsToken: string = ''

  async connect(url: string, token?: string): Promise<void> {
    // 防止重复调用
    if (this.socket) {
      this.close()
    }

    this.wsUrl = url
    this.wsToken = token || ''

    this.socket = new ReconnectingWebSocket(url, ['WebSocket', token || 'visitor'], {
      minReconnectionDelay: 1,
      connectionTimeout: 3000,
      maxEnqueuedMessages: 0,
      maxRetries: 10000000,
    })

    this.socket.addEventListener('open', () => {
      this.startHeartbeat()
      this.resubscribeAll()
    })

    this.socket.addEventListener('message', (event: any) => {
      const res = JSON.parse(event.data)
      this.onMessage(res)
    })

    this.socket.addEventListener('close', () => {
      this.stopHeartbeat()
    })

    this.setupAppStateListener()
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
  }

  reconnect(): void {
    const url = this.wsUrl
    const token = this.wsToken
    this.close()
    setTimeout(() => {
      this.connect(url, token)
    }, 500)
  }

  checkSocketReady(callback?: () => void): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      callback?.()
    } else {
      this.connect(this.wsUrl, this.wsToken).then(callback)
    }
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
  private readonly UNSUBSCRIBE_DELAY = 2_000

  // queueMicrotask 兼容 Hermes
  private readonly enqueue =
    typeof queueMicrotask === 'function' ? queueMicrotask : (fn: () => void) => Promise.resolve().then(fn)

  subscribe(topics: string[]): Unsubscribe {
    topics.forEach((topic) => {
      const count = this.refCounts.get(topic) || 0
      this.refCounts.set(topic, count + 1)
      if (count === 0) {
        this.pendingSubscribe.add(topic)
        this.pendingUnsubscribe.delete(topic)
      }
    })
    this.scheduleSubscribeFlush()

    let disposed = false
    return () => {
      if (disposed) return
      disposed = true
      topics.forEach((topic) => {
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

  private scheduleUnsubscribeFlush(): void {
    if (this.unsubscribeTimer) return
    this.unsubscribeTimer = setTimeout(() => {
      this.unsubscribeTimer = null
      const toUnsub = [...this.pendingUnsubscribe].filter((topic) => !this.refCounts.has(topic))
      this.pendingUnsubscribe.clear()
      if (toUnsub.length > 0) {
        this.sendTopics(toUnsub, true)
      }
    }, this.UNSUBSCRIBE_DELAY)
  }

  private sendTopics(topics: string[], cancel: boolean): void {
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
    this.pausedTopics = [...this.refCounts.keys()]
    if (this.pausedTopics.length > 0) {
      this.sendTopics(this.pausedTopics, true)
    }
    this.stopHeartbeat()
  }

  private onEnterForeground(): void {
    const toResume = this.pausedTopics.filter((t) => this.refCounts.has(t))
    this.pausedTopics = []

    if (this.socket?.readyState === WebSocket.OPEN) {
      if (toResume.length > 0) {
        this.sendTopics(toResume, false)
      }
      this.startHeartbeat()
    } else {
      // 连接已断，重连后 resubscribeAll 会恢复
      this.connect(this.wsUrl, this.wsToken)
    }
  }

  // ==================== 重连后重新订阅 ====================
  private resubscribeAll(): void {
    const topics = [...this.refCounts.keys()]
    if (topics.length > 0) {
      this.sendTopics(topics, false)
    }
    this.subscribeMessage()
    this.subscribeNotify()
    this.subscribePosition()
  }

  // ==================== 特殊订阅（不纳入引用计数） ====================

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
  private readonly THROTTLE_QUOTE_INTERVAL = Platform.OS === 'ios' ? 16 : 32
  private readonly MAX_CACHE_SIZE = 150
  private quotesCache: string[] = []
  private depthCache: string[] = []
  private lastQuoteUpdateTime = 0
  private lastDepthUpdateTime = 0
  private quoteCount = 0
  // MobX 兼容：暂保留 quotes 和 depth Map，供 wsUtil.ts 等消费者读取
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

  // ---- 行情数据批量更新（从 ws.ts 迁移） ----
  private batchUpdateQuoteData(data: string): void {
    if (!data || typeof data !== 'string') return
    this.quotesCache.push(data)

    if (this.quoteCount < this.MAX_CACHE_SIZE) {
      this.updateQuoteData()
      this.quoteCount++
      return
    }
    if (this.quotesCache.length >= this.MAX_CACHE_SIZE) {
      this.updateQuoteData()
      return
    }
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
      .filter((item): item is IQuoteItem => !!item)

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
  private readonly THROTTLE_DEPTH_INTERVAL = 300

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
      useRootStore.getState().user.info.updateAccount(accountInfo)
    } else if (type === 'MARKET_ORDER') {
      const formatted = formaOrderList(data.bagOrderList || [])
      useRootStore.getState().trade.position.update(formatted)
    } else if (type === 'LIMIT_ORDER') {
      const formatted = formaOrderList(data.limiteOrderList || [])
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

  // ==================== 兼容方法（过渡期使用，供 wsUtil.ts 调用） ====================

  /** 获取 socket readyState */
  get readyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED
  }
}

export default MulletWS
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/lib/ws/mullet-ws.ts
git commit -m "feat(ws): 实现 MulletWS 核心类（连接、心跳、引用计数订阅、前后台、消息分发）"
```

---

### Task 4: useSubscribeQuote Hook

**Files:**

- Create: `apps/mobile/src/hooks/market/use-subscribe-quote.ts`

- [ ] **Step 1: 创建 hook**

```typescript
// apps/mobile/src/hooks/market/use-subscribe-quote.ts
import { useEffect } from 'react'

import { DEFAULT_TENANT_ID } from '@/constants/config/trade'
import MulletWS from '@/lib/ws/mullet-ws'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'

/**
 * 订阅行情 hook
 * 组件挂载时订阅，卸载时自动取消
 *
 * @param symbols 品种名称列表，如 ['BTC', 'ETH']
 *
 * @example
 * useSubscribeQuote(['BTC', 'ETH'])
 * const btcQuote = useMarketQuote('BTC') // 从 Zustand 读取
 */
export function useSubscribeQuote(symbols: string[]): void {
  const symbolsKey = symbols.join(',')
  const accountGroupId = useRootStore((s) => userInfoActiveTradeAccountInfoSelector(s)?.accountGroupId)

  useEffect(() => {
    if (!symbolsKey || !accountGroupId) return

    const ws = MulletWS.getInstance()
    const topics = symbolsKey.split(',').map((symbol) => `/${DEFAULT_TENANT_ID}/symbol/${symbol}/${accountGroupId}`)

    return ws.subscribe(topics)
  }, [symbolsKey, accountGroupId])
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/hooks/market/use-subscribe-quote.ts
git commit -m "feat(ws): 添加 useSubscribeQuote 声明式订阅 hook"
```

---

### Task 5: 替换初始化入口

**Files:**

- Modify: `apps/mobile/src/v1/stores/global.ts:94-98`

- [ ] **Step 1: 修改 global.ts**

将 `stores.ws.checkSocketReady()` 替换为 `MulletWS` 初始化：

```typescript
// 在 global.ts 顶部添加 import
import { getEnv } from '@/env'
import MulletWS from '@/lib/ws/mullet-ws'
```

修改 `onStartApp` 方法中的 WS 初始化部分：

```typescript
// 替换 stores.ws.checkSocketReady()
const { ws: websocketUrl } = await getEnv()
MulletWS.getInstance().connect(websocketUrl, token)
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/v1/stores/global.ts
git commit -m "refactor(ws): 替换 global.ts 中的 WS 初始化为 MulletWS"
```

---

### Task 6: 替换 use-ws-reconnect

**Files:**

- Modify: `apps/mobile/src/hooks/use-ws-reconnect.ts`

- [ ] **Step 1: 重写 use-ws-reconnect**

MulletWS 内部已处理前后台切换和重连后重订阅，`useWsReconnect` 简化为只触发 checkSocketReady：

```typescript
// apps/mobile/src/hooks/use-ws-reconnect.ts
import { useCallback } from 'react'

import MulletWS from '@/lib/ws/mullet-ws'
import { useRootStore } from '@/stores'

export const useWsReconnect = () => {
  const reconnect = useCallback(() => {
    const token = useRootStore.getState().user.auth.accessToken
    if (!token) return

    const ws = MulletWS.getInstance()
    // MulletWS 内部 resubscribeAll 会在 open 回调中自动恢复所有订阅
    if (ws.readyState !== WebSocket.OPEN) {
      ws.reconnect()
    }
  }, [])

  return { reconnect }
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/hooks/use-ws-reconnect.ts
git commit -m "refactor(ws): 简化 useWsReconnect，复用 MulletWS 内部重连逻辑"
```

---

### Task 7: 更新类型导入

**Files:**

- Modify: `apps/mobile/src/stores/market-slice/quote-slice.tsx:5`
- Modify: `apps/mobile/src/hooks/market/use-market-quote.tsx:13`
- Modify: `apps/mobile/src/hooks/use-announcement-listener.ts`（如有 ws 类型导入）
- Modify: `apps/mobile/src/v1/utils/wsUtil.ts:7`

- [ ] **Step 1: 将 `IQuoteItem` 等类型导入从 `v1/stores/ws` 改为 `@/lib/ws/types`**

各文件将：

```typescript
// 旧
import type { IQuoteItem } from '@/v1/stores/ws'
// 新
import type { IQuoteItem } from '@/lib/ws/types'
```

注意 `wsUtil.ts` 还导入了 `SymbolWSItem`，该类型在新实现中不再需要（hook 直接接受 `string[]`）。但 `wsUtil.ts` 中的 `subscribeCurrentAndPositionSymbol` 等函数仍在使用，这些函数的迁移在 Task 8 处理。此步骤仅更新纯类型导入。

- [ ] **Step 2: 提交**

```bash
git add apps/mobile/src/stores/market-slice/quote-slice.tsx \
  apps/mobile/src/hooks/market/use-market-quote.tsx \
  apps/mobile/src/hooks/use-announcement-listener.ts
git commit -m "refactor(ws): 更新 IQuoteItem 等类型导入源为 lib/ws/types"
```

---

### Task 8: 迁移 wsUtil.ts 中的 WS 依赖

**Files:**

- Modify: `apps/mobile/src/v1/utils/wsUtil.ts`

- [ ] **Step 1: 将 `ws.quotes` 读取改为从 MulletWS.getInstance().quotes 读取**

```typescript
// 旧
const { ws } = stores
const quotes = ws.quotes

// 新
import MulletWS from '@/lib/ws/mullet-ws'
const quotes = MulletWS.getInstance().quotes
```

同理 `depth` 读取改为 `MulletWS.getInstance().depth`。

- [ ] **Step 2: 将 `subscribeCurrentAndPositionSymbol` 等函数中的 `stores.ws.*` 替换为 MulletWS 调用**

关键替换：

- `stores.ws.checkSocketReady(() => { ... })` → `MulletWS.getInstance().checkSocketReady(() => { ... })`
- `stores.ws.openPosition({ symbols, cover })` → `MulletWS.getInstance().subscribe(topics)`（构造 topic 字符串）
- `stores.ws.subscribeExchangeRateQuote(conf, symbol)` → 保留逻辑但改用 `MulletWS.getInstance().subscribe([topic])`
- `stores.ws.makeWsSymbolBySemi` → 直接构造 topic（不再需要 SymbolWSItem 中间类型）

- [ ] **Step 3: 提交**

```bash
git add apps/mobile/src/v1/utils/wsUtil.ts
git commit -m "refactor(ws): 迁移 wsUtil.ts 中的 WS 依赖到 MulletWS"
```

---

### Task 9: 验证与清理

**Files:**

- Reference: `apps/mobile/src/v1/stores/ws.ts`（确认无其他消费者后可删除）

- [ ] **Step 1: 全局搜索确认没有残留的 `stores.ws` 引用**

```bash
rg "stores\.ws\." apps/mobile/src --type ts -l
rg "from.*@/v1/stores/ws" apps/mobile/src --type ts -l
```

预期结果：除 `v1/stores/ws.ts` 自身外不再有引用。

- [ ] **Step 2: TypeScript 编译检查**

```bash
cd apps/mobile && npx tsc --noEmit
```

修复所有类型错误。

- [ ] **Step 3: 提交最终清理**

```bash
git commit -m "refactor(ws): 清理残留引用，通过类型检查"
```

> **注意：** `v1/stores/ws.ts` 暂不删除。等整体迁移验证稳定后，在后续 PR 中移除。
