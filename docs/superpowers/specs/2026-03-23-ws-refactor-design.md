# WebSocket 重构设计文档

## 目标

重构 WS 层，实现「按需订阅」模式：业务组件通过 hook 声明式订阅行情，组件卸载自动取消，WS 类内部维护引用计数，只在最后一个订阅者离开时才真正取消订阅。

替代现有 `v1/stores/ws.ts` MobX 实现。

## 架构概览

```text
MulletWS (单例)
├── 连接管理 (connect / reconnect / close)
├── 心跳管理 (20s 间隔)
├── 前后台管理 (AppState 监听)
├── 订阅管理 (引用计数 + 批量合并)
│   ├── subscribe → queueMicrotask 批量发送
│   └── unsubscribe → setTimeout(2s) 延迟批量发送
└── 消息分发 (msgId 路由，复用现有处理逻辑)

useSubscribeQuote(symbols)  ← 业务 hook
├── effect 中 ws.subscribe(topics) → 返回 unsubscribe
├── cleanup 调用 unsubscribe
└── 行情数据通过 useMarketQuote 从 Zustand 读取（不变）
```

## 核心模块设计

### 1. MulletWS 类

#### 1.1 单例

```typescript
class MulletWS {
  private static instance: MulletWS | null = null

  static getInstance(): MulletWS {
    if (!MulletWS.instance) {
      MulletWS.instance = new MulletWS()
    }
    return MulletWS.instance
  }

  // 用户登出时调用，清理所有状态
  static destroy(): void {
    MulletWS.instance?.close()
    MulletWS.instance = null
  }

  private constructor() {}
}
```

#### 1.2 连接管理

```typescript
// 属性
private socket: ReconnectingWebSocket | null = null
private url: string = ''
private token: string = ''

// 方法
connect(url: string, token?: string): void
  - 如果已存在 socket，先 close() 再重新创建（防止重复调用泄漏）
  - 创建 ReconnectingWebSocket 实例
  - 配置：minReconnectionDelay=1, connectionTimeout=3000, maxRetries=10000000, maxEnqueuedMessages=0
  - 监听 open：启动心跳 + resubscribeAll()（按 refCounts 恢复所有活跃订阅）
  - 监听 message：解析 JSON → onMessage 分发
  - 监听 close：停止心跳
  - 监听 error：不处理（reconnecting-websocket 自动重连）
  - 启动 AppState 监听

close(): void
  - 保存行情快照到 storage
  - 关闭 socket（socket.close()），置 null
  - 停止心跳
  - 清理 unsubscribeTimer 和 pendingSubscribe、pendingUnsubscribe 队列
  - 移除 AppState 监听

reconnect(): void
  - close() → 500ms 后 connect()
```

#### 1.3 心跳管理

```typescript
private heartbeatTimer: ReturnType<typeof setInterval> | null = null
private readonly HEARTBEAT_INTERVAL = 20_000 // 20s

private startHeartbeat(): void
  - 有登录 token 才开启（游客不发心跳）
  - clearInterval 旧 timer 后再创建新 timer
  - 每隔 20s 发送 { msgId: 'heartbeat' }

private stopHeartbeat(): void
  - clearInterval，置 null
```

#### 1.4 订阅管理（核心）

```typescript
// 引用计数：topic → 订阅者数量
private refCounts: Map<string, number> = new Map()

// 批量合并队列
private pendingSubscribe: Set<string> = new Set()
private pendingUnsubscribe: Set<string> = new Set()
private subscribeFlushScheduled = false
private unsubscribeTimer: ReturnType<typeof setTimeout> | null = null
private readonly UNSUBSCRIBE_DELAY = 2_000 // 2s
```

**subscribe 方法：**

```typescript
subscribe(topics: string[]): () => void {
  topics.forEach(topic => {
    const count = this.refCounts.get(topic) || 0
    this.refCounts.set(topic, count + 1)
    if (count === 0) {
      // 首次订阅，加入待发送队列，同时从取消队列移除（页面切换场景）
      this.pendingSubscribe.add(topic)
      this.pendingUnsubscribe.delete(topic)
    }
  })
  this.scheduleSubscribeFlush()

  // 返回取消函数（幂等）
  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    topics.forEach(topic => {
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
```

**批量发送逻辑：**

```typescript
// 订阅：queueMicrotask 合并（同一事件循环内所有 subscribe 合并为一条消息）
// 兼容 Hermes：queueMicrotask 从 Hermes 0.70+ 支持，需提供 fallback
private readonly enqueue = typeof queueMicrotask === 'function'
  ? queueMicrotask
  : (fn: () => void) => Promise.resolve().then(fn)

private scheduleSubscribeFlush(): void {
  if (this.subscribeFlushScheduled) return
  this.subscribeFlushScheduled = true
  this.enqueue(() => {
    this.subscribeFlushScheduled = false
    if (this.pendingSubscribe.size > 0) {
      this.sendSubscribe([...this.pendingSubscribe])
      this.pendingSubscribe.clear()
    }
  })
}

// 取消订阅：setTimeout(2s) 延迟合并
// 同一个 timer 窗口内的所有 unsubscribe 会被一次性 flush
// 二次检查确保延迟期间被重新订阅的 topic 不被误取消
private scheduleUnsubscribeFlush(): void {
  if (this.unsubscribeTimer) return  // timer 已存在，搭已有 timer 的顺风车
  this.unsubscribeTimer = setTimeout(() => {
    this.unsubscribeTimer = null
    const toUnsub = [...this.pendingUnsubscribe].filter(
      topic => !this.refCounts.has(topic)  // 二次检查：过滤已重新订阅的
    )
    this.pendingUnsubscribe.clear()
    if (toUnsub.length > 0) {
      this.sendUnsubscribe(toUnsub)
    }
  }, this.UNSUBSCRIBE_DELAY)
}

// 发送协议（与现有格式一致，topics 逗号拼接）
private sendSubscribe(topics: string[]): void {
  this.send({ topic: topics.join(','), cancel: false })
}

private sendUnsubscribe(topics: string[]): void {
  this.send({ topic: topics.join(','), cancel: true })
}
```

#### 1.5 前后台管理

```typescript
private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null
private pausedTopics: string[] = [] // 后台暂停时的快照

private setupAppStateListener(): void {
  this.appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'background' || state === 'inactive') {
      this.onEnterBackground()
    } else if (state === 'active') {
      this.onEnterForeground()
    }
  })
}

private onEnterBackground(): void {
  // 记录当前所有活跃 topic 快照
  this.pausedTopics = [...this.refCounts.keys()]
  // 发送取消订阅（不清 refCounts，业务层订阅状态不变）
  if (this.pausedTopics.length > 0) {
    this.sendUnsubscribe(this.pausedTopics)
  }
  this.stopHeartbeat()
}

private onEnterForeground(): void {
  // 用当前 refCounts 过滤：避免后台期间某些组件已卸载导致恢复了无效订阅
  const toResume = this.pausedTopics.filter(t => this.refCounts.has(t))
  this.pausedTopics = []

  if (this.socket?.readyState === WebSocket.OPEN) {
    // 连接正常，直接重新订阅
    if (toResume.length > 0) {
      this.sendSubscribe(toResume)
    }
    this.startHeartbeat()
  } else {
    // 连接已断，触发重连；resubscribeAll 会在 open 回调中执行
    this.checkSocketReady()
  }
}

// 检查连接，断开则重连（复用现有逻辑）
checkSocketReady(callback?: () => void): void {
  if (this.socket?.readyState === WebSocket.OPEN) {
    callback?.()
  } else {
    this.connect(this.url, this.token)
    // open 回调中会执行 resubscribeAll 和 callback
  }
}
```

#### 1.6 重连后重新订阅

```typescript
// 在 socket 'open' 事件中调用，恢复所有活跃订阅
private resubscribeAll(): void {
  const topics = [...this.refCounts.keys()]
  if (topics.length > 0) {
    this.sendSubscribe(topics)
  }
  // 恢复消息通知订阅（role/dept/post/user topic）
  this.subscribeMessage()
  // 恢复支付响应消息订阅
  this.subscribeNotify()
  // 恢复持仓/挂单/账户推送（如果有活跃账户）
  this.subscribePosition()
}
```

#### 1.7 消息分发

```typescript
// 行情节流参数（保留现有 ios/android 区别）
private readonly THROTTLE_QUOTE_INTERVAL = Platform.OS === 'ios' ? 16 : 32 // ms
private readonly THROTTLE_DEPTH_INTERVAL = 300 // ms
private readonly MAX_CACHE_SIZE = 150

// 复用现有 v1/stores/ws.ts 的 message() 分发逻辑
private onMessage(res: IMessage): void {
  const msgId = res.header?.msgId
  switch (msgId) {
    case 'symbol':
      this.batchUpdateQuoteData(res.body)  // 节流写入 Zustand quoteMap
      break
    case 'depth':
      this.batchUpdateDepthData(res.body)  // 节流写入 Zustand（如有）
      break
    case 'trade':
      this.handleTradeMessage(res.body)
      break
    case 'notice':
      mitt.emit('ws-message-popup', res.body)
      break
    case 'msg':
      mitt.emit('RESOLVE_MSG', res.body)
      break
  }
}

// handleTradeMessage 同时写入 MobX trade store 和 Zustand store
// 迁移期间保留 MobX trade store 写入，避免遗漏消费者（后续再清理）
private handleTradeMessage(data: any): void {
  const type = data.type
  if (type === 'ACCOUNT') {
    trade.currentAccountInfo = { ...trade.currentAccountInfo, ...data.account }
    useRootStore.getState().user.info.updateAccount(data.account)
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
```

**关于 `parseDepthBodyData` 的修正：**

现有代码（`ws.ts:818`）的深度解析中，price/amount 分隔符注释写的是 `*`，但代码写的是 `_`。迁移到 `quote-parser.ts` 时需要以实际服务端推送数据为准确认分隔符，不能直接复制现有代码。

#### 1.8 特殊订阅方法

以下命令式订阅不纳入引用计数，保持独立调用（与现有行为一致）：

```typescript
// 消息通知（role/dept/post/user topic）
subscribeMessage(cancel?: boolean): void

// 支付响应消息
subscribeNotify(cancel?: boolean): void

// 持仓/挂单/账户推送
subscribePosition(cancel?: boolean): void

// 深度订阅（暂不纳入引用计数，保持命令式调用）
subscribeDepth(symbolInfo?: TradeSymbolListItem, cancel?: boolean): void
```

> **注意：** `subscribeDepth` 暂不纳入引用计数管理。重连后的深度恢复由调用方（交易页面）自行处理，与现有行为一致。后续可视需要将深度也接入引用计数体系。

#### 1.9 send 方法

```typescript
private send(cmd: Record<string, any>, header?: Record<string, any>): void {
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

  // 开发环境 Reactotron 日志（保留，用于 WS 调试）
  if (tron && (header as any)?.msgId !== 'heartbeat') {
    tron.display({
      name: 'WS 发送',
      value: payload,
      preview: (payload.body as any)?.topic?.slice(0, 60) || (header as any)?.msgId || 'subscribe',
      important: true,
    })
  }
}
```

### 2. useSubscribeQuote Hook

```typescript
/**
 * 订阅行情 hook
 * @param symbols 品种名称列表，如 ['BTC', 'ETH']
 *
 * 使用方式：
 *   useSubscribeQuote(['BTC', 'ETH'])
 *   const btcQuote = useMarketQuote('BTC') // 从 Zustand 读取，不变
 */
function useSubscribeQuote(symbols: string[]): void {
  // 稳定引用：避免每次渲染数组引用变化
  const symbolsKey = symbols.join(',')

  // accountGroupId 作为依赖：用户切换账户时重新订阅正确 topic
  const accountGroupId = useRootStore(
    s => userInfoActiveTradeAccountInfoSelector(s)?.accountGroupId
  )

  useEffect(() => {
    if (!symbolsKey || !accountGroupId) return

    const ws = MulletWS.getInstance()
    const topics = symbolsKey.split(',').map(
      symbol => `/${DEFAULT_TENANT_ID}/symbol/${symbol}/${accountGroupId}`
    )

    const unsubscribe = ws.subscribe(topics)
    return unsubscribe  // cleanup 自动取消订阅
  }, [symbolsKey, accountGroupId])
}
```

### 3. 业务层使用示例

```tsx
function MarketList({ symbols }: { symbols: string[] }) {
  // 1. 订阅行情（声明式，卸载自动取消）
  useSubscribeQuote(symbols)

  return (
    <>
      {symbols.map(symbol => (
        <MarketItem key={symbol} symbol={symbol} />
      ))}
    </>
  )
}

function MarketItem({ symbol }: { symbol: string }) {
  // 2. 从 Zustand 读取行情数据（现有逻辑不变）
  const quote = useMarketQuote(symbol)
  return <Text>{quote?.priceData?.buy}</Text>
}
```

### 4. 文件结构

```text
apps/mobile/src/
├── lib/
│   └── ws/
│       ├── mullet-ws.ts          # MulletWS 单例类
│       ├── types.ts              # 类型定义（IMessage, Unsubscribe 等）
│       └── quote-parser.ts       # 行情/深度解析（从 ws.ts 提取，修正深度分隔符）
├── hooks/
│   └── market/
│       └── use-subscribe-quote.ts  # useSubscribeQuote hook
```

**`types.ts` 主要类型：**

```typescript
export type Unsubscribe = () => void

export type IMessage = {
  header: { flowId: number; msgId: string; tenantId: string; userId: string }
  body: any
}

// IQuoteItem / IDepth 从 v1/stores/ws.ts 迁移过来
```

### 5. 迁移策略

迁移分阶段进行，新旧系统在过渡期共用同一 WebSocket 连接（不会）——实际是 **新实现完全替代旧实现**，一次性切换，不并行运行：

1. **新建 `lib/ws/`** — 实现 MulletWS 类，`quote-parser.ts` 从 `ws.ts` 提取并修正深度分隔符 bug
2. **新建 `useSubscribeQuote` hook**
3. **替换初始化入口** — `global.ts` 中用 `MulletWS.getInstance().connect()` 替代 `ws.connect()`
4. **替换业务层订阅调用** — 将各页面的 `ws.openSymbol` / `ws.closePosition` 改为 `useSubscribeQuote`
5. **深度/持仓/消息** — `subscribeDepth`、`subscribePosition`、`subscribeMessage` 调用改为 `MulletWS.getInstance().*`
6. **删除 `v1/stores/ws.ts`** — 完全迁移后删除旧实现
7. **`useMarketQuote` / `useMarketQuoteInfo`** — 不变，继续从 Zustand 读取

### 6. 引用计数场景分析

```text
场景1：正常订阅/取消
  mount A  → subscribe(BTC) → ref=1, 微任务发送订阅
  unmount A → unsubscribe   → ref=0, 2s 后发送取消

场景2：多组件共享
  mount A  → subscribe(BTC) → ref=1, 发送订阅
  mount B  → subscribe(BTC) → ref=2, 不发送（已订阅）
  unmount A → unsubscribe   → ref=1, 不取消
  unmount B → unsubscribe   → ref=0, 2s 后取消

场景3：页面切换（最常见）
  unmount A → unsubscribe(BTC) → ref=0, 进入 pendingUnsubscribe 队列
  mount B   → subscribe(BTC)   → ref=1, 从 pendingUnsubscribe 移除, 进 pendingSubscribe
  2s 后 flush: BTC 已有 ref, 不发送取消 ✅

场景4：进入后台
  background → 记录 pausedTopics 快照 → 发送 unsubscribe(所有) → 停止心跳
  foreground → 用 refCounts 过滤 pausedTopics（排除后台期间卸载的组件）
             → 若连接正常: sendSubscribe(过滤后列表) + startHeartbeat
             → 若连接断开: checkSocketReady → open → resubscribeAll

场景5：断线重连
  断线 → ReconnectingWebSocket 自动重连
  open → resubscribeAll() 根据 refCounts 重新订阅所有活跃 topic

场景6：账户切换
  accountGroupId 变化 → useSubscribeQuote effect 重新执行
  → 旧 unsubscribe 被调用（旧 topics 引用计数 -1）
  → 新 topics 用新 accountGroupId 重新 subscribe
```
