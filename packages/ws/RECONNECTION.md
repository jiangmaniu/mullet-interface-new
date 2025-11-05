# WebSocket 重连机制说明

## 架构设计

重连机制完全由 **SubscriptionManager** 管理，Worker 和 Client 层只负责消息转发。

```
┌─────────────────────────────────────────┐
│      SubscriptionManager                │
│  - 维护所有订阅参数                     │
│  - 监听连接状态变化                     │
│  - 重连后自动重新订阅                   │
└────────────┬────────────────────────────┘
             │ onConnectionStatusChange
             ▼
┌─────────────────────────────────────────┐
│           WSClient                      │
│  - 转发连接状态                          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│           Worker                        │
│  - reconnecting-websocket 自动重连       │
│  - 通知主线程连接状态变化                │
└─────────────────────────────────────────┘
```

## 数据结构

### SubscriptionManager 维护三个 Map

```typescript
class SubscriptionManager {
  // 1. 业务层回调
  private subscriptionCallbacks: Map<SubscriptionType, Map<key, Set<callback>>>

  // 2. 底层取消订阅函数
  private clientUnsubscribers: Map<SubscriptionType, Map<key, unsubscribe>>

  // 3. 订阅参数（用于重连时重新订阅）
  private subscriptionParams: Map<SubscriptionType, Map<key, SubscriptionParams>>
}
```

## 重连流程

### 1. 连接断开

```typescript
Worker: WebSocket 连接断开
  ↓
Worker: reconnecting-websocket 自动重连
  ↓
Worker: 消息队列暂存待发送的消息
```

### 2. 连接恢复

```typescript
Worker: reconnecting-websocket 重连成功
  ↓
Worker: 发送队列中的消息
  ↓
Worker: 通知主线程连接恢复
  postMessage({ type: 'connectionStatus', connected: true })
  ↓
WSClient: 转发连接状态
  onConnectionStatusChange(true)
  ↓
SubscriptionManager: 监听到连接恢复
  _resubscribeAll() 被触发
  ↓
遍历 subscriptionParams
  ↓
对每个订阅调用 client.subscribe(type, params)
  ↓
Worker: 收到订阅请求，转发给服务器
  ↓
完成重新订阅 ✓
```

## 代码实现

### SubscriptionManager 构造函数

```typescript
constructor(client: WSClient) {
  this.client = client

  // 设置数据处理器
  this.client.setDataHandler((type, symbol, data) => {
    this._dispatchToCallbacks(type, symbol, data)
  })

  // 监听连接状态变化，重连后自动重新订阅
  this.client.onConnectionStatusChange((connected) => {
    if (connected) {
      this._resubscribeAll()
    }
  })
}
```

### 订阅时保存参数

```typescript
private _subscribeToClient(type: SubscriptionType, params: SubscriptionParams): void {
  const key = params.key

  // 1. 保存订阅参数（用于重连）
  if (!this.subscriptionParams.has(type)) {
    this.subscriptionParams.set(type, new Map())
  }
  this.subscriptionParams.get(type)!.set(key, params)

  // 2. 调用底层订阅
  const unsubscribe = this.client.subscribe(type, params)

  // 3. 保存取消订阅函数
  if (!this.clientUnsubscribers.has(type)) {
    this.clientUnsubscribers.set(type, new Map())
  }
  this.clientUnsubscribers.get(type)!.set(key, unsubscribe)
}
```

### 取消订阅时清理参数

```typescript
private _unsubscribeFromClient(type: SubscriptionType, key: string): void {
  // 1. 调用取消订阅
  const typeUnsubscribers = this.clientUnsubscribers.get(type)
  if (typeUnsubscribers) {
    const unsubscribe = typeUnsubscribers.get(key)
    if (unsubscribe) {
      unsubscribe()
      typeUnsubscribers.delete(key)
    }
  }

  // 2. 清理订阅参数
  const typeParams = this.subscriptionParams.get(type)
  if (typeParams) {
    typeParams.delete(key)
    if (typeParams.size === 0) {
      this.subscriptionParams.delete(type)
    }
  }
}
```

### 重新订阅实现

```typescript
private _resubscribeAll(): void {
  console.log('[SubscriptionManager] Reconnected, resubscribing all...')

  let resubscribeCount = 0

  // 遍历所有保存的订阅参数
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
```

## 使用示例

### 业务层使用

```typescript
const { subscriptionManager } = createWSClient({
  url: 'wss://example.com/ws',
})

// 订阅行情
const unsubscribe = subscriptionManager.subscribeMarketData({ symbol: 'BTCUSDT', accountId: '123' }, (data) => {
  console.log('行情数据:', data.price)
})

// 监听连接状态（可选）
subscriptionManager.onConnectionStatusChange((connected) => {
  if (connected) {
    console.log('WebSocket 已连接')
  } else {
    console.log('WebSocket 已断开')
  }
})

// 当 WebSocket 断开并重连后：
// 1. reconnecting-websocket 自动重连
// 2. 连接恢复后，SubscriptionManager 自动重新订阅
// 3. 数据继续流向业务层回调
// 业务层无需任何额外操作 ✓
```

## 优势

### 1. 业务层无感知

业务层只需要订阅一次，重连后自动恢复订阅，无需手动处理。

### 2. 状态集中管理

所有订阅状态和参数都在 SubscriptionManager 中管理，避免了多层状态同步的复杂性。

### 3. Worker 职责简化

Worker 只负责 WebSocket 连接和消息转发，不需要维护订阅状态。

### 4. 可靠性保证

- `reconnecting-websocket` 确保连接自动重连
- `subscriptionParams` 确保重连后能准确恢复所有订阅
- 消息队列确保断开期间的消息不丢失

### 5. 调试友好

重连过程有详细的日志输出：

```
[SubscriptionManager] Reconnected, resubscribing all...
[SubscriptionManager] Resubscribing MARKET_DATA/BTCUSDT
[SubscriptionManager] Resubscribing TRADE/ETHUSDT
[SubscriptionManager] Resubscribed 2 subscriptions
```

## 注意事项

### 1. 订阅参数完整性

确保 `SubscriptionParams` 包含重新订阅所需的所有信息：

- `topic`: 完整的订阅路径
- `key`: 用于标识订阅的键
- `header`: 认证信息等

### 2. 内存管理

取消订阅时会自动清理 `subscriptionParams`，避免内存泄漏。

### 3. 重连时机

重连只在连接状态从 `false` 变为 `true` 时触发，避免重复订阅。

### 4. 订阅顺序

重连后的订阅顺序可能与初始订阅顺序不同（Map 遍历顺序），但这通常不影响功能。

## 测试场景

### 场景 1：正常重连

```typescript
1. 建立连接，订阅 3 个 symbol
2. 断开网络
3. 恢复网络
4. WebSocket 自动重连
5. SubscriptionManager 自动重新订阅 3 个 symbol
6. 数据继续流向业务层
✓ 成功
```

### 场景 2：重连期间新增订阅

```typescript
1. 建立连接，订阅 symbol1
2. 断开网络
3. 业务层订阅 symbol2（会被加入队列）
4. 恢复网络
5. WebSocket 自动重连
6. SubscriptionManager 重新订阅 symbol1
7. 队列中的 symbol2 订阅请求被发送
✓ 成功
```

### 场景 3：重连期间取消订阅

```typescript
1. 建立连接，订阅 symbol1, symbol2
2. 断开网络
3. 业务层取消订阅 symbol1
4. 恢复网络
5. WebSocket 自动重连
6. SubscriptionManager 只重新订阅 symbol2（symbol1 已被清理）
✓ 成功
```

## 与旧实现对比

### 旧实现（Worker 维护订阅）

```
Worker 维护 subscriptions
  ↓
重连后 Worker 遍历 subscriptions 重新订阅
  ↓
问题：
1. 状态分散在 Worker 和 SubscriptionManager 两层
2. 需要同步两层的状态
3. Worker 职责过重
```

### 新实现（SubscriptionManager 维护订阅）

```
SubscriptionManager 维护 subscriptionParams
  ↓
监听连接状态变化
  ↓
重连后遍历 subscriptionParams 重新订阅
  ↓
优势：
1. 状态集中管理
2. Worker 职责简化
3. 更易维护和测试
```

## 总结

通过将重连逻辑集中到 SubscriptionManager，我们实现了：

- ✅ **职责清晰**：各层职责单一明确
- ✅ **状态集中**：所有订阅状态在一处管理
- ✅ **自动恢复**：业务层无感知的订阅恢复
- ✅ **易于维护**：简化的架构更容易理解和调试
- ✅ **可靠性高**：完整的参数保存确保准确恢复

这是一个健壮、可靠、易维护的重连机制设计！🎉







