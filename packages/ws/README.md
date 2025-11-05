# @mullet/ws

智能 WebSocket 客户端包，使用 **Dedicated Worker** 实现，支持 TypeScript 和 Turbopack。

## 核心特性

- 🔄 **自动重连机制**
- 🌐 **Worker 模式** - 使用 Dedicated Worker 处理 WebSocket 连接
- 🎯 **自动降级** - Worker 不支持时自动使用直接连接
- 📦 **多种订阅类型** - 行情、仓位、深度、公告、挂单
- 🎯 **基于 symbol 的订阅管理**
- 🔔 **多回调支持** - 同一数据源可有多个订阅回调
- 🧹 **自动清理** - 最后一个订阅取消时自动向服务器发送取消订阅消息
- 📊 **订阅状态查询**
- 🐛 **调试模式支持**
- 🔌 **连接状态监听**
- ⚡ **Turbopack 完美支持**

## 工作模式

该包会自动检测浏览器环境并选择最合适的工作模式：

### Worker 模式（推荐）

当浏览器支持 Worker 时自动启用：

1. **独立线程**：WebSocket 连接在独立的 Worker 线程中处理
2. **不阻塞主线程**：所有网络操作不影响 UI 性能
3. **TypeScript 支持**：Worker 文件使用 TypeScript 编写
4. **Turbopack 兼容**：完美支持 Next.js 15 和 Turbopack

### 降级模式

当浏览器不支持 Worker 或初始化失败时，自动降级到直接连接模式：

1. **兼容性好**：支持所有现代浏览器
2. **功能完整**：保留所有订阅和管理功能
3. **直接连接**：在主线程中处理 WebSocket

## 安装

```bash
pnpm add reconnecting-websocket
```

## 使用方法

### 基础用法

```typescript
import { createWSClient } from '@mullet/ws'

// 创建 WebSocket 客户端
const { subscriptionManager, close, isConnected } = createWSClient({
  url: 'ws://localhost:8080',
  debug: true, // 开启调试日志
  reconnectInterval: 3000, // 重连间隔
  maxReconnectAttempts: 10, // 最大重连次数
})

// 订阅行情数据
const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log('收到 BTCUSDT 行情:', data)
})

// 检查连接状态
console.log('已连接:', isConnected())

// 取消订阅
unsubscribe()

// 关闭连接
close()
```

### 监听连接状态

```typescript
const { subscriptionManager } = createWSClient({
  url: 'ws://localhost:8080',
})

// 监听连接状态变化
const unwatch = subscriptionManager.onConnectionStatusChange((connected) => {
  if (connected) {
    console.log('WebSocket 已连接')
  } else {
    console.log('WebSocket 已断开')
  }
})

// 取消监听
unwatch()
```

### 订阅行情数据

```typescript
// 订阅单个交易对行情
const unsubscribe1 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log('价格:', data.price)
  console.log('涨跌幅:', data.changePercent)
})

// 同一交易对可以有多个订阅
const unsubscribe2 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  // 另一个组件的处理逻辑
  updateChart(data)
})

// 取消特定订阅
unsubscribe1()
unsubscribe2()
```

### 订阅交易消息（统一订阅 - 推荐）

```typescript
// 订阅交易对的所有交易消息
const unsubscribe = subscriptionManager.subscribeTrade('BTCUSDT', {
  // 仓位更新
  onPosition: (position) => {
    console.log('仓位大小:', position.size)
    console.log('未实现盈亏:', position.unrealizedPnl)
  },
  // 挂单更新
  onOrder: (order) => {
    console.log('订单ID:', order.orderId)
    console.log('订单状态:', order.status)
  },
  // 账户更新
  onAccount: (account) => {
    console.log('余额:', account.balance)
    console.log('可用:', account.available)
  },
})
```

### 订阅单个交易消息（快捷方式）

```typescript
// 只订阅仓位信息
const unsubPos = subscriptionManager.subscribePosition('BTCUSDT', (position) => {
  console.log('仓位大小:', position.size)
})

// 只订阅挂单信息
const unsubOrder = subscriptionManager.subscribeOrder('BTCUSDT', (order) => {
  console.log('订单状态:', order.status)
})

// 只订阅账户信息
const unsubAcc = subscriptionManager.subscribeAccount('BTCUSDT', (account) => {
  console.log('账户余额:', account.balance)
})
```

### 订阅行情深度

```typescript
const unsubscribe = subscriptionManager.subscribeMarketDepth('ETHUSDT', (depth) => {
  console.log('买单深度:', depth.bids)
  console.log('卖单深度:', depth.asks)
})
```

### 订阅公告信息

```typescript
const unsubscribe = subscriptionManager.subscribeAnnouncement('system', (announcement) => {
  console.log('公告标题:', announcement.title)
  console.log('公告内容:', announcement.content)
})
```

### React Hook 示例

```typescript
import { useEffect, useState } from 'react'
import { createWSClient, type MarketData } from '@mullet/ws'

// 创建全局客户端实例
const { subscriptionManager } = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_URL!,
  debug: process.env.NODE_ENV === 'development',
})

// 订阅行情数据的 Hook
export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null)

  useEffect(() => {
    // 订阅行情
    const unsubscribe = subscriptionManager.subscribeMarketData(symbol, (marketData) => {
      setData(marketData)
    })

    // 组件卸载时取消订阅
    return unsubscribe
  }, [symbol])

  return data
}

// 连接状态 Hook
export function useConnectionStatus() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const unwatch = subscriptionManager.onConnectionStatusChange((status) => {
      setConnected(status)
    })

    return unwatch
  }, [])

  return connected
}

// 使用 Hook
function PriceDisplay({ symbol }: { symbol: string }) {
  const marketData = useMarketData(symbol)
  const connected = useConnectionStatus()

  if (!connected) {
    return <div>连接中...</div>
  }

  if (!marketData) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <div>价格: {marketData.price}</div>
      <div>涨跌幅: {marketData.changePercent}%</div>
    </div>
  )
}
```

### 查询订阅状态

```typescript
// 获取所有订阅状态（异步）
const status = await subscriptionManager.getSubscriptionStatus()
console.log(status)

// 输出示例:
// {
//   "market_data": {
//     "BTCUSDT": 2,  // 2 个回调订阅
//     "ETHUSDT": 1   // 1 个回调订阅
//   },
//   "position": {
//     "BTCUSDT": 1
//   }
// }
```

## API 文档

### createWSClient(config)

创建 WebSocket 客户端实例

**参数：**

- `config.url: string` - WebSocket 服务器地址
- `config.debug?: boolean` - 是否开启调试日志（默认：false）
- `config.reconnectInterval?: number` - 重连间隔毫秒数（默认：3000）
- `config.maxReconnectAttempts?: number` - 最大重连次数（默认：10）

**返回：**

```typescript
{
  client: WSClient,
  subscriptionManager: SubscriptionManager,
  close: () => void,
  getStatus: () => Promise<Record<string, Record<string, number>>>,
  isConnected: () => boolean,
  onConnectionStatusChange: (callback: (connected: boolean) => void) => () => void
}
```

### SubscriptionManager 方法

| 方法                       | 说明                 | 返回值         |
| -------------------------- | -------------------- | -------------- |
| `subscribeMarketData`      | 订阅行情数据         | `() => void`   |
| `subscribeMarketDepth`     | 订阅行情深度         | `() => void`   |
| `subscribeAnnouncement`    | 订阅公告信息         | `() => void`   |
| `subscribeTrade`           | 订阅交易消息（统一） | `() => void`   |
| `subscribePosition`        | 订阅仓位（快捷方法） | `() => void`   |
| `subscribeOrder`           | 订阅挂单（快捷方法） | `() => void`   |
| `subscribeAccount`         | 订阅账户（快捷方法） | `() => void`   |
| `getSubscriptionStatus`    | 获取订阅状态（异步） | `Promise<...>` |
| `onConnectionStatusChange` | 监听连接状态变化     | `() => void`   |
| `isConnected`              | 获取当前连接状态     | `boolean`      |

## 订阅类型

| 类型     | 方法                     | 说明                   |
| -------- | ------------------------ | ---------------------- |
| 行情数据 | `subscribeMarketData`    | 订阅交易对的实时行情   |
| 仓位信息 | `subscribePosition`      | 订阅交易对的仓位变化   |
| 行情深度 | `subscribeMarketDepth`   | 订阅交易对的买卖盘深度 |
| 公告信息 | `subscribeAnnouncement`  | 订阅系统公告           |
| 挂单信息 | `subscribePendingOrders` | 订阅挂单状态变化       |

## 订阅管理机制

1. **首次订阅**：当第一个回调订阅某个 symbol 时，Worker 向服务器发送订阅消息
2. **多重订阅**：同一 symbol 可以有多个回调函数订阅
3. **消息分发**：收到服务器推送时，Worker 遍历执行所有订阅回调
4. **取消订阅**：调用返回的取消订阅函数
5. **自动清理**：当最后一个回调被取消时，向服务器发送取消订阅消息并清理数据

## WebSocket 消息格式

### 客户端发送

```json
{
  "type": "market_data",
  "action": "subscribe",
  "symbol": "BTCUSDT"
}
```

### 服务器推送

```json
{
  "type": "market_data",
  "action": "data",
  "symbol": "BTCUSDT",
  "data": {
    "symbol": "BTCUSDT",
    "price": "50000.00",
    "volume": "1234.56",
    "timestamp": 1234567890
  }
}
```

## 类型定义

所有的类型定义都从包中导出，可以在业务代码中使用：

```typescript
import type {
  AnnouncementData,
  MarketData,
  MarketDepthData,
  PendingOrderData,
  PositionData,
  SubscriptionCallback,
  SubscriptionType,
} from '@mullet/ws'
```

## 最佳实践

1. **全局单例**：建议在应用中创建一个全局的 WebSocket 客户端实例
2. **及时清理**：在组件卸载时务必取消订阅，避免内存泄漏
3. **错误处理**：在回调函数中添加适当的错误处理
4. **调试模式**：开发环境下开启 debug 模式，便于排查问题
5. **重连策略**：根据实际需求调整重连参数
6. **监听连接状态**：使用 `onConnectionStatusChange` 监听连接状态，做好离线处理

## 浏览器兼容性

### Worker 支持

- ✅ Chrome/Edge 80+
- ✅ Firefox 80+
- ✅ Safari 14+
- ❌ IE（不支持，自动降级）

### 降级模式支持

- ✅ 所有支持 WebSocket 的现代浏览器
- ✅ Chrome/Edge/Firefox/Safari/Opera
- ⚠️ IE 10+（需要 WebSocket polyfill）

**注意**：客户端会自动检测并选择最合适的模式，无需手动配置。控制台会输出当前使用的模式：

- `[WSClient] Using Worker mode` - Worker 模式
- `[WSClient] Worker not supported, using direct mode` - 降级模式

## Turbopack 支持

该包完美支持 Next.js 15 和 Turbopack：

- ✅ Worker 文件使用 TypeScript 编写
- ✅ 使用 `new URL()` 动态导入 Worker
- ✅ Turbopack 自动处理 Worker 编译
- ✅ 开发和生产环境都能正常工作

## License

MIT
