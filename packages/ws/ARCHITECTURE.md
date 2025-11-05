# WebSocket 包架构说明

## 架构概览

```text
┌─────────────────────────────────────────────────────────┐
│                   业务层 (App Code)                      │
│  调用 SubscriptionManager 的订阅方法                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              SubscriptionManager                         │
│  • 维护回调数组 (Map<Type, Map<Symbol, Set<Callback>>>)│
│  • 管理订阅生命周期                                      │
│  • 自动合并同一 symbol 的多个订阅                        │
│  • 最后一个回调移除时取消底层订阅                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    WSClient                              │
│  • 抽象层，自动选择 Worker 或 Fallback 实现              │
│  • 提供统一的订阅接口                                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│ WSClientWorker  │         │ WSClientFallback │
│ (Dedicated      │         │ (Direct WS)      │
│  Worker 实现)   │         │                  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         ▼                           │
┌─────────────────┐                 │
│ ws-worker-      │                 │
│ dedicated.ts    │                 │
│ (Worker 线程)   │                 │
└────────┬────────┘                 │
         │                           │
         └────────────┬──────────────┘
                      ▼
              ┌───────────────┐
              │ reconnecting- │
              │ websocket     │
              │ (WebSocket 连接)│
              └───────────────┘
```

## 订阅管理机制

### 1. SubscriptionManager 层

**职责：**

- 维护业务层的所有订阅回调
- 管理订阅的生命周期
- 优化底层订阅（同一 symbol 多次订阅只建立一次底层连接）

**数据结构：**

```typescript
// 回调管理
subscriptionCallbacks: Map<SubscriptionType, Map<symbol, Set<callback>>>

// 底层取消函数管理
clientUnsubscribers: Map<SubscriptionType, Map<symbol, unsubscribe>>
```

**工作流程：**

1. **添加订阅时：**

   ```typescript
   subscribeMarketData('BTCUSDT', callback1)
   ↓
   检查 MARKET_DATA 类型是否存在 → 不存在则创建
   ↓
   检查 BTCUSDT symbol 是否存在 → 不存在则创建并调用底层订阅
   ↓
   将 callback1 添加到 Set 中
   ↓
   返回取消订阅函数
   ```

2. **再次订阅同一 symbol：**

   ```typescript
   subscribeMarketData('BTCUSDT', callback2)
   ↓
   检查 MARKET_DATA/BTCUSDT 已存在 → 直接添加 callback2
   ↓
   不会重复调用底层订阅
   ```

3. **取消订阅时：**

   ```typescript
   unsubscribe1()
   ↓
   从 Set 中移除 callback1
   ↓
   检查 Set 是否为空 → 不为空，保留底层订阅

   unsubscribe2()
   ↓
   从 Set 中移除 callback2
   ↓
   检查 Set 是否为空 → 为空，调用底层取消订阅
   ↓
   清理相关数据结构
   ```

4. **数据分发：**
   ```typescript
   底层收到 BTCUSDT 行情数据
   ↓
   _dispatchToCallbacks(MARKET_DATA, 'BTCUSDT', data)
   ↓
   遍历 Set<callback>
   ↓
   依次执行 callback1(data), callback2(data), ...
   ```

### 2. WSClient 层

**职责：**

- 提供统一的订阅接口
- 自动选择实现方式（Worker 或 Fallback）
- 处理与 Worker/Fallback 的通信

**特点：**

- 每个订阅只会收到一个回调（由 SubscriptionManager 提供的分发回调）
- 不负责管理多个回调，这是 SubscriptionManager 的职责

### 3. Worker/Fallback 层

**职责：**

- 管理实际的 WebSocket 连接
- 处理重连逻辑
- 解析和分发消息

## 订阅优化示例

### 场景 1：多个组件订阅同一 symbol

```typescript
// 组件 A
const unsubA = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log('组件 A 收到数据:', data.price)
})

// 组件 B
const unsubB = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log('组件 B 收到数据:', data.price)
})

// 组件 C
const unsubC = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log('组件 C 收到数据:', data.price)
})

// 实际只建立了 1 次底层 WebSocket 订阅
// 收到数据后，3 个组件都会收到回调
```

**组件卸载：**

```typescript
// 组件 A 卸载
unsubA() // 底层订阅继续保持，因为还有 B 和 C

// 组件 B 卸载
unsubB() // 底层订阅继续保持，因为还有 C

// 组件 C 卸载
unsubC() // 最后一个订阅取消，发送取消订阅消息给服务器
```

### 场景 2：交易消息的多回调

```typescript
// 订阅 1：只关心仓位
const unsub1 = subscriptionManager.subscribePosition('BTCUSDT', (pos) => {
  console.log('仓位更新:', pos.size)
})

// 订阅 2：只关心订单
const unsub2 = subscriptionManager.subscribeOrder('BTCUSDT', (order) => {
  console.log('订单更新:', order.status)
})

// 订阅 3：同时关心多个
const unsub3 = subscriptionManager.subscribeTrade('BTCUSDT', {
  onPosition: (pos) => console.log('仓位:', pos.size),
  onOrder: (order) => console.log('订单:', order.status),
  onAccount: (acc) => console.log('账户:', acc.balance),
})

// 实际只建立了 1 次 TRADE 类型的底层订阅
// 收到不同 subType 的消息时，会分发给对应的回调
```

## 内存管理

### 自动清理

1. **回调集合为空时：**
   - 自动删除 symbol 的 Map 条目
   - 调用底层取消订阅
   - 清理 unsubscriber 引用

2. **类型订阅全部取消时：**
   - 自动删除类型的 Map 条目
   - 释放相关内存

### 防止内存泄漏

```typescript
// ❌ 错误：忘记取消订阅
useEffect(() => {
  subscriptionManager.subscribeMarketData('BTCUSDT', handleData)
  // 组件卸载时没有取消订阅 → 内存泄漏
}, [])

// ✅ 正确：总是在清理函数中取消订阅
useEffect(() => {
  const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', handleData)
  return () => unsubscribe() // 组件卸载时自动取消
}, [])
```

## 性能优势

1. **减少 WebSocket 消息数量**
   - 同一 symbol 的多个订阅只发送一次订阅消息
   - 减少服务器负担和网络流量

2. **减少数据处理开销**
   - Worker 中只需要解析一次消息
   - 在主线程中进行快速的回调分发
   - **移除 callbackId**：减少了字符串生成和 Map 查找的开销

3. **更好的可扩展性**
   - 可以轻松支持数百个订阅
   - 内存占用随订阅数量线性增长（而非指数增长）
   - **简化的数据结构**：每层只维护必要的信息

## 类型安全

整个架构中的类型安全保证：

```typescript
// 订阅时的类型推断
subscribeMarketData('BTCUSDT', (data) => {
  // data 的类型自动推断为 MarketData
  console.log(data.price) // ✅ 类型安全
  console.log(data.xxx) // ❌ 编译错误
})

// 交易订阅的类型安全
subscribeTrade('BTCUSDT', {
  onPosition: (data) => {
    // data 的类型为 PositionData
    console.log(data.size) // ✅
  },
  onOrder: (data) => {
    // data 的类型为 OrderData
    console.log(data.orderId) // ✅
  },
})
```

## 错误处理

### 回调执行错误

```typescript
// 某个回调抛出错误不会影响其他回调
callbacks.forEach((callback) => {
  try {
    callback(data)
  } catch (error) {
    console.error(`Error in subscription callback for ${type}/${symbol}:`, error)
    // 继续执行下一个回调
  }
})
```

### 连接错误

```typescript
// Worker 层会自动重连
// SubscriptionManager 无需关心连接状态
// 重连成功后会自动重新订阅
```

## 总结

这种分层架构的优势：

1. **职责清晰**：每一层都有明确的职责
2. **易于维护**：订阅逻辑集中在 SubscriptionManager
3. **性能优化**：自动合并重复订阅
4. **类型安全**：完整的 TypeScript 类型支持
5. **内存安全**：自动清理无用订阅
6. **易于测试**：各层可以独立测试
