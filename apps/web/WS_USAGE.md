# WebSocket 使用说明

## 测试页面

访问 `/test-ws` 查看 WebSocket 测试页面，验证连接是否正常。

## 在项目中使用

### 1. 创建全局 WebSocket 客户端

创建 `src/services/ws/client.ts`:

```typescript
import { createWSClient } from '@mullet/ws'

// 创建全局单例客户端
export const { subscriptionManager, close, isConnected, onConnectionStatusChange } = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_URL || 'wss://websocket.stellux.io/websocketServer',
  debug: process.env.NODE_ENV === 'development',
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
})

// 导出便捷方法
export { subscriptionManager as wsManager }
```

### 2. 创建自定义 Hook

创建 `src/hooks/useMarketData.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import type { MarketData } from '@mullet/ws'

import { wsManager } from '@/services/ws/client'

export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const unsubscribe = wsManager.subscribeMarketData(symbol, (marketData) => {
      setData(marketData)
      setLoading(false)
    })

    return unsubscribe
  }, [symbol])

  return { data, loading }
}
```

创建 `src/hooks/useWSConnection.ts`:

```typescript
'use client'

import { useEffect, useState } from 'react'

import { onConnectionStatusChange } from '@/services/ws/client'

export function useWSConnection() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const unwatch = onConnectionStatusChange((status) => {
      setConnected(status)
    })

    return unwatch
  }, [])

  return connected
}
```

### 3. 在组件中使用

```typescript
'use client'

import { useMarketData } from '@/hooks/useMarketData'
import { useWSConnection } from '@/hooks/useWSConnection'

export default function PriceDisplay({ symbol }: { symbol: string }) {
  const { data, loading } = useMarketData(symbol)
  const connected = useWSConnection()

  if (!connected) {
    return <div className="text-yellow-600">连接中...</div>
  }

  if (loading) {
    return <div>加载中...</div>
  }

  if (!data) {
    return <div>暂无数据</div>
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="mb-2 text-xl font-bold">{data.symbol}</div>
      <div className="text-2xl font-mono">{data.price}</div>
      <div
        className={`text-sm ${
          parseFloat(data.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {data.changePercent}%
      </div>
    </div>
  )
}
```

### 4. 订阅其他数据类型

```typescript
// 订阅仓位信息
wsManager.subscribePosition('BTCUSDT', (position) => {
  console.log('仓位:', position)
})

// 订阅行情深度
wsManager.subscribeMarketDepth('ETHUSDT', (depth) => {
  console.log('深度:', depth)
})

// 订阅公告
wsManager.subscribeAnnouncement('system', (announcement) => {
  console.log('公告:', announcement)
})

// 订阅挂单
wsManager.subscribePendingOrders('BTCUSDT', (order) => {
  console.log('挂单:', order)
})
```

## 启动项目

### 使用 Turbopack（推荐，更快）

```bash
pnpm dev
```

### 使用 Webpack

```bash
TURBOPACK=false pnpm dev
```

## 调试

1. **查看连接模式**：打开控制台，查看是否输出：
   - `[WSClient] Using SharedWorker mode` - SharedWorker 模式
   - `[WSClient] SharedWorker not supported, using direct mode` - 降级模式

2. **查看详细日志**：确保 `debug: true` 开启

3. **测试多标签页**：
   - 打开多个标签页
   - SharedWorker 模式下，所有标签页共享连接
   - 降级模式下，每个标签页独立连接

## 注意事项

1. **环境变量**：确保设置 `NEXT_PUBLIC_WS_URL`
2. **清理订阅**：组件卸载时务必调用返回的取消订阅函数
3. **错误处理**：在回调函数中添加 try-catch
4. **性能优化**：避免频繁订阅/取消订阅同一个 symbol

## 故障排查

### WebSocket 连接失败

1. 检查 WebSocket URL 是否正确
2. 检查网络连接
3. 查看浏览器控制台错误信息
4. 确认服务器 WebSocket 服务是否正常

### SharedWorker 不工作

1. 检查浏览器是否支持 SharedWorker
2. 查看控制台是否有错误信息
3. 客户端会自动降级到直接连接模式，功能不受影响

### 数据没有更新

1. 确认已正确订阅
2. 检查服务器是否推送数据
3. 查看控制台调试日志
4. 确认回调函数是否正确执行

