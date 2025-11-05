# 交易类型订阅说明

## 概述

交易类型订阅将仓位、挂单、账户等交易相关的消息统一到一个订阅类型中，提供更灵活的订阅方式。

## 架构设计

### 订阅类型层级

```text
TRADE (交易类型)
  ├── POSITION (仓位子类型)
  ├── ORDER (挂单子类型)
  └── ACCOUNT (账户子类型)
```

### 消息格式

服务器推送的交易消息格式：

```json
{
  "type": "trade",
  "action": "data",
  "symbol": "BTCUSDT",
  "data": {
    "subType": "position",
    "symbol": "BTCUSDT",
    "data": {
      "symbol": "BTCUSDT",
      "side": "long",
      "size": "1.5",
      "entryPrice": "50000",
      "markPrice": "51000",
      "unrealizedPnl": "1500"
    },
    "timestamp": 1234567890
  }
}
```

## 使用方式

### 1. 统一订阅（推荐）

订阅交易对的所有交易消息，并分别处理：

```typescript
import { createWSClient } from '@mullet/ws'

const { subscriptionManager } = createWSClient({
  url: 'wss://...',
})

// 订阅 BTCUSDT 的所有交易消息
const unsubscribe = subscriptionManager.subscribeTrade('BTCUSDT', {
  // 仓位更新回调
  onPosition: (position) => {
    console.log('仓位更新:', position)
    console.log('  方向:', position.side)
    console.log('  数量:', position.size)
    console.log('  未实现盈亏:', position.unrealizedPnl)
  },

  // 挂单更新回调
  onOrder: (order) => {
    console.log('挂单更新:', order)
    console.log('  订单ID:', order.orderId)
    console.log('  状态:', order.status)
    console.log('  已成交:', order.filled)
  },

  // 账户更新回调
  onAccount: (account) => {
    console.log('账户更新:', account)
    console.log('  余额:', account.balance)
    console.log('  可用:', account.available)
    console.log('  净值:', account.equity)
  },
})

// 取消订阅
unsubscribe()
```

### 2. 单独订阅（快捷方式）

如果只需要订阅某一种交易消息：

```typescript
// 只订阅仓位信息
const unsubPos = subscriptionManager.subscribePosition('BTCUSDT', (position) => {
  console.log('仓位:', position)
})

// 只订阅挂单信息
const unsubOrder = subscriptionManager.subscribeOrder('BTCUSDT', (order) => {
  console.log('挂单:', order)
})

// 只订阅账户信息
const unsubAcc = subscriptionManager.subscribeAccount('BTCUSDT', (account) => {
  console.log('账户:', account)
})
```

### 3. 部分订阅

只订阅需要的消息类型：

```typescript
// 只监听仓位和挂单，不监听账户
subscriptionManager.subscribeTrade('BTCUSDT', {
  onPosition: (position) => {
    // 处理仓位
  },
  onOrder: (order) => {
    // 处理挂单
  },
  // onAccount 不提供，账户消息会被忽略
})
```

## React Hook 示例

### 统一订阅 Hook

```typescript
import { useEffect, useState } from 'react'
import { subscriptionManager } from '@/services/ws/client'
import type { PositionData, OrderData, AccountData } from '@mullet/ws'

export function useTradeData(symbol: string) {
  const [position, setPosition] = useState<PositionData | null>(null)
  const [orders, setOrders] = useState<OrderData[]>([])
  const [account, setAccount] = useState<AccountData | null>(null)

  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribeTrade(symbol, {
      onPosition: setPosition,
      onOrder: (order) => {
        setOrders((prev) => {
          // 更新或添加订单
          const index = prev.findIndex((o) => o.orderId === order.orderId)
          if (index >= 0) {
            const newOrders = [...prev]
            newOrders[index] = order
            return newOrders
          }
          return [...prev, order]
        })
      },
      onAccount: setAccount,
    })

    return unsubscribe
  }, [symbol])

  return { position, orders, account }
}

// 使用
function TradingPanel({ symbol }: { symbol: string }) {
  const { position, orders, account } = useTradeData(symbol)

  return (
    <div>
      <div>仓位: {position?.size}</div>
      <div>挂单数: {orders.length}</div>
      <div>账户余额: {account?.balance}</div>
    </div>
  )
}
```

### 单独订阅 Hook

```typescript
export function usePosition(symbol: string) {
  const [position, setPosition] = useState<PositionData | null>(null)

  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribePosition(symbol, setPosition)
    return unsubscribe
  }, [symbol])

  return position
}

export function useOrders(symbol: string) {
  const [orders, setOrders] = useState<OrderData[]>([])

  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribeOrder(symbol, (order) => {
      setOrders((prev) => {
        const index = prev.findIndex((o) => o.orderId === order.orderId)
        if (index >= 0) {
          const newOrders = [...prev]
          newOrders[index] = order
          return newOrders
        }
        return [...prev, order]
      })
    })

    return unsubscribe
  }, [symbol])

  return orders
}
```

## 数据类型

### PositionData（仓位数据）

```typescript
interface PositionData {
  symbol: string // 交易对
  side: 'long' | 'short' // 方向
  size: string // 持仓数量
  entryPrice: string // 入场价格
  markPrice: string // 标记价格
  liquidationPrice: string // 强平价格
  unrealizedPnl: string // 未实现盈亏
  leverage: number // 杠杆倍数
  timestamp: number // 时间戳
}
```

### OrderData（挂单数据）

```typescript
interface OrderData {
  symbol: string // 交易对
  orderId: string // 订单ID
  side: 'buy' | 'sell' // 买卖方向
  type: string // 订单类型
  price: string // 价格
  quantity: string // 数量
  filled: string // 已成交数量
  status: string // 订单状态
  timestamp: number // 时间戳
}
```

### AccountData（账户数据）

```typescript
interface AccountData {
  symbol: string // 交易对
  balance: string // 总余额
  available: string // 可用余额
  frozen: string // 冻结金额
  equity: string // 净值
  margin: string // 保证金
  timestamp: number // 时间戳
}
```

## 服务器协议

### 订阅请求

客户端发送：

```json
{
  "type": "trade",
  "action": "subscribe",
  "symbol": "BTCUSDT"
}
```

### 数据推送

服务器推送（包含子类型标识）：

```json
{
  "type": "trade",
  "action": "data",
  "symbol": "BTCUSDT",
  "data": {
    "subType": "position", // 子类型：position、order、account
    "symbol": "BTCUSDT",
    "data": {
      /* 具体数据 */
    },
    "timestamp": 1234567890
  }
}
```

### 取消订阅

```json
{
  "type": "trade",
  "action": "unsubscribe",
  "symbol": "BTCUSDT"
}
```

## 优势

1. **统一管理**: 一次订阅可以接收所有交易相关消息
2. **灵活配置**: 可以选择只监听需要的消息类型
3. **类型安全**: 完整的 TypeScript 类型支持
4. **向后兼容**: 保留了单独订阅的快捷方法
5. **性能优化**: 减少 WebSocket 订阅连接数

## 最佳实践

1. **优先使用统一订阅**: 在需要多种交易消息时，使用 `subscribeTrade`
2. **单一职责**: 每个回调只处理一种类型的消息
3. **及时清理**: 组件卸载时调用返回的取消订阅函数
4. **错误处理**: 在回调函数中添加 try-catch
5. **状态管理**: 使用 useState 或状态管理库管理数据

## 迁移指南

### 从旧 API 迁移

```typescript
// 旧方式（已弃用）
subscriptionManager.subscribePosition('BTCUSDT', callback)
subscriptionManager.subscribePendingOrders('BTCUSDT', callback)

// 新方式（推荐）
subscriptionManager.subscribeTrade('BTCUSDT', {
  onPosition: callback,
  onOrder: callback,
})

// 或者使用快捷方法
subscriptionManager.subscribePosition('BTCUSDT', callback) // 仍然可用
subscriptionManager.subscribeOrder('BTCUSDT', callback) // 新方法名
```

## 注意事项

1. 同一个 symbol 的 trade 订阅只需要一次，会接收所有子类型的消息
2. 单独订阅（subscribePosition 等）内部也是使用 subscribeTrade
3. 服务器需要在消息中包含 `subType` 字段来区分消息类型
4. 取消订阅会停止接收该 symbol 的所有交易消息
