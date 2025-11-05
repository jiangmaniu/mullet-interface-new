# WebSocket 客户端快速开始

## 📦 文件结构

```text
packages/ws/src/
├── ws-client.ts                     # 主客户端（自动选择模式）
├── ws-client-worker.ts              # Worker 模式客户端
├── ws-client-fallback.ts            # 降级模式客户端
├── worker/
│   └── ws-worker-dedicated.ts       # Worker 实现（TypeScript）
├── subscription-manager.ts          # 订阅管理器
├── types.ts                         # 类型定义
└── index.ts                         # 导出入口
```

## 🚀 快速使用

### 1. 基础示例

```typescript
import { createWSClient } from '@mullet/ws'

const { subscriptionManager } = createWSClient({
  url: 'wss://websocket.stellux.io/websocketServer',
  debug: true,
})

// 订阅行情
const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log('价格:', data.price)
})

// 取消订阅
unsubscribe()
```

### 2. React Hook

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createWSClient } from '@mullet/ws'
import type { MarketData } from '@mullet/ws'

// 全局客户端
const { subscriptionManager } = createWSClient({
  url: 'wss://websocket.stellux.io/websocketServer',
  debug: true,
})

export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null)

  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribeMarketData(symbol, setData)
    return unsubscribe
  }, [symbol])

  return data
}

// 使用
function PriceDisplay() {
  const data = useMarketData('BTCUSDT')
  return <div>价格: {data?.price}</div>
}
```

### 3. 监听连接状态

```typescript
const { subscriptionManager } = createWSClient({ url: 'ws://...' })

subscriptionManager.onConnectionStatusChange((connected) => {
  console.log(connected ? '已连接' : '已断开')
})
```

## 📝 订阅类型

```typescript
// 行情数据
subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {})

// 仓位信息
subscriptionManager.subscribePosition('BTCUSDT', (position) => {})

// 行情深度
subscriptionManager.subscribeMarketDepth('BTCUSDT', (depth) => {})

// 公告信息
subscriptionManager.subscribeAnnouncement('system', (announcement) => {})

// 挂单信息
subscriptionManager.subscribePendingOrders('BTCUSDT', (order) => {})
```

## 🧪 测试

访问 `/test-ws` 页面测试 WebSocket 连接。

## 💡 提示

1. **自动选择模式**: 支持 Worker 时使用 Worker，否则降级到直接连接
2. **控制台日志**: `debug: true` 查看详细日志
3. **及时清理**: 组件卸载时调用返回的取消订阅函数
4. **Turbopack 支持**: 完美支持 Next.js 15 和 Turbopack

## 🎯 消息格式

### 客户端 → 服务器

```json
{
  "type": "market_data",
  "action": "subscribe",
  "symbol": "BTCUSDT"
}
```

### 服务器 → 客户端

```json
{
  "type": "market_data",
  "action": "data",
  "symbol": "BTCUSDT",
  "data": {
    "symbol": "BTCUSDT",
    "price": "50000.00",
    "timestamp": 1234567890
  }
}
```

## ✅ 检查清单

- [ ] 确认 `reconnecting-websocket` 已安装
- [ ] 设置正确的 WebSocket URL
- [ ] 开启 `debug: true` 查看日志
- [ ] 访问 `/test-ws` 测试连接
- [ ] 检查浏览器控制台输出工作模式
