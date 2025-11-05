# CallbackId 移除重构说明

## 重构背景

在之前的实现中，整个订阅链路都在使用 `callbackId` 来标识和管理回调：

```
SubscriptionManager (维护回调数组)
    ↓ callbackId
WSClient (维护 callbackId → callback)
    ↓ callbackId
Worker (维护 type+symbol → Set<callbackId>)
```

这种设计存在冗余：

1. **多层维护**：三层都在维护 callbackId 相关的映射关系
2. **内存开销**：每层都需要额外的 Map 来存储 callbackId
3. **性能开销**：需要生成、传递、查找 callbackId

## 重构后的架构

### SubscriptionManager 层

**职责：管理业务层的多个回调**

```typescript
class SubscriptionManager {
  // 管理每个 type+symbol 的多个回调
  subscriptionCallbacks: Map<SubscriptionType, Map<symbol, Set<Callback>>>

  // 管理底层取消函数
  clientUnsubscribers: Map<SubscriptionType, Map<symbol, unsubscribe>>

  subscribe(type, symbol, callback) {
    // 添加回调到 Set
    // 如果是首次订阅该 type+symbol，调用 client.subscribe()
    // 传递一个"分发回调"给 client
  }
}
```

### WSClient 层

**职责：管理每个 type+symbol 的单一回调**

```typescript
class WSClientWorker {
  // 每个 type+symbol 只有一个回调（来自 SubscriptionManager 的分发回调）
  callbacks: Map<SubscriptionType, Map<symbol, callback>>

  subscribe(type, symbol, callback) {
    // 直接存储回调
    callbacks.get(type).set(symbol, callback)

    // 发送订阅请求到 Worker（不需要 callbackId）
    worker.postMessage({ type: 'subscribe', subscriptionType: type, symbol })
  }

  onData(type, symbol, data) {
    // 根据 type+symbol 查找回调并执行
    const callback = callbacks.get(type)?.get(symbol)
    callback?.(data)
  }
}
```

### Worker 层

**职责：跟踪需要订阅的 type+symbol 组合**

```typescript
class WSWorkerManager {
  // 只需要知道哪些 type+symbol 需要订阅
  subscriptions: Map<SubscriptionType, Set<symbol>>

  subscribe(type, symbol) {
    // 添加到 Set
    subscriptions.get(type).add(symbol)

    // 如果是首次订阅，发送订阅消息到服务器
    if (!had) {
      ws.send(toServerMessage({ type, action: 'subscribe', symbol }))
    }
  }

  onMessage(serverMessage) {
    // 解析消息，提取 type, symbol, data
    const { type, symbol, data } = fromServerMessage(serverMessage)

    // 检查是否有订阅
    if (subscriptions.get(type)?.has(symbol)) {
      // 发送到主线程（不需要 callbackId）
      postMessage({ type: 'data', subscriptionType: type, symbol, data })
    }
  }
}
```

## 数据流示例

### 订阅流程

```typescript
// 1. 业务层
subscriptionManager.subscribeMarketData('BTCUSDT', callback1)
subscriptionManager.subscribeMarketData('BTCUSDT', callback2)

// 2. SubscriptionManager 层
_subscribe(MARKET_DATA, 'BTCUSDT', callback1)
  → 首次订阅，调用 client.subscribe(MARKET_DATA, 'BTCUSDT', dispatchCallback)
  → 添加 callback1 到 Set

_subscribe(MARKET_DATA, 'BTCUSDT', callback2)
  → 已有订阅，不调用 client
  → 添加 callback2 到 Set

// 3. WSClient 层
subscribe(MARKET_DATA, 'BTCUSDT', dispatchCallback)
  → callbacks.get(MARKET_DATA).set('BTCUSDT', dispatchCallback)
  → worker.postMessage({ type: 'subscribe', subscriptionType: MARKET_DATA, symbol: 'BTCUSDT' })

// 4. Worker 层
handleMessage({ type: 'subscribe', subscriptionType: MARKET_DATA, symbol: 'BTCUSDT' })
  → subscriptions.get(MARKET_DATA).add('BTCUSDT')
  → ws.send(toServerMessage({ type: MARKET_DATA, action: 'subscribe', symbol: 'BTCUSDT' }))
```

### 数据接收流程

```typescript
// 1. Worker 层收到服务器消息
onMessage(serverMessage)
  → { type: MARKET_DATA, symbol: 'BTCUSDT', data: { price: 50000 } }
  → 检查 subscriptions.get(MARKET_DATA).has('BTCUSDT') ✓
  → postMessage({ type: 'data', subscriptionType: MARKET_DATA, symbol: 'BTCUSDT', data })

// 2. WSClient 层收到 Worker 消息
onWorkerMessage({ type: 'data', subscriptionType: MARKET_DATA, symbol: 'BTCUSDT', data })
  → callback = callbacks.get(MARKET_DATA).get('BTCUSDT')
  → callback(data) // 执行 SubscriptionManager 的分发回调

// 3. SubscriptionManager 层分发数据
dispatchCallback(data)
  → _dispatchToCallbacks(MARKET_DATA, 'BTCUSDT', data)
  → callbacks.forEach(cb => cb(data))
  → callback1(data)  // 业务回调 1
  → callback2(data)  // 业务回调 2
```

## 优势对比

### 之前（使用 callbackId）

| 层级                | 维护的数据结构                            | 额外开销                   |
| ------------------- | ----------------------------------------- | -------------------------- |
| SubscriptionManager | `Map<Type, Map<Symbol, Set<Callback>>>`   | ✅ 必需                    |
| WSClient            | `Map<CallbackId, Callback>`               | ❌ 冗余                    |
| Worker              | `Map<Type, Map<Symbol, Set<CallbackId>>>` | ❌ 冗余                    |
| **总计**            | 3 层维护映射关系                          | 生成和查找 callbackId 开销 |

### 现在（移除 callbackId）

| 层级                | 维护的数据结构                          | 职责                 |
| ------------------- | --------------------------------------- | -------------------- |
| SubscriptionManager | `Map<Type, Map<Symbol, Set<Callback>>>` | 管理多个业务回调     |
| WSClient            | `Map<Type, Map<Symbol, Callback>>`      | 存储单一分发回调     |
| Worker              | `Map<Type, Set<Symbol>>`                | 跟踪订阅状态         |
| **总计**            | 3 层各司其职                            | 无冗余，结构清晰简单 |

## 性能提升

1. **内存占用减少**
   - 移除了 callbackId 字符串的存储
   - WSClient 层从 `Map<string, callback>` 简化为 `Map<Type, Map<Symbol, callback>>`
   - Worker 层从 `Map<Type, Map<Symbol, Set<string>>>` 简化为 `Map<Type, Set<Symbol>>`

2. **CPU 开销减少**
   - 不需要生成 callbackId（`Date.now()` + `Math.random()`）
   - 减少了 Map 查找次数（从 1 次变为 2 次链式查找，但总体更高效）
   - 消息传递的数据量减少（不需要传递 callbackId）

3. **代码更简洁**
   - 每层的职责更清晰
   - 减少了维护成本
   - 更容易理解和调试

## 兼容性

此重构是内部实现优化，**不影响外部 API**：

```typescript
// 外部使用方式完全不变
const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log(data.price)
})

unsubscribe() // 取消订阅
```

## 总结

移除 callbackId 是一次架构优化，通过明确各层职责，消除了冗余设计：

- **SubscriptionManager**：管理多个业务回调
- **WSClient**：存储单一分发回调
- **Worker**：跟踪订阅状态

这种设计更符合"单一职责原则"，每层只做自己该做的事，最终实现了更高的性能和更好的可维护性。

