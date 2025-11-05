# WebSocket 客户端包 - 完整总结

## ✨ 特性

✅ **Dedicated Worker 实现** - 使用普通 Worker（每个标签页独立实例）  
✅ **TypeScript 支持** - Worker 文件使用 .ts 编写  
✅ **Turbopack 完美支持** - 兼容 Next.js 15 和 Turbopack  
✅ **自动降级机制** - Worker 不可用时自动使用直接连接  
✅ **自动重连** - 使用 reconnecting-websocket  
✅ **多种订阅类型** - 行情、仓位、深度、公告、挂单  
✅ **智能订阅管理** - 维护订阅数组，自动清理  
✅ **连接状态监听** - 实时获取连接状态

## 📁 核心文件

```text
packages/ws/src/
├── ws-client.ts                     # 主客户端（自动选择模式）
├── ws-client-worker.ts              # Worker 模式客户端
├── ws-client-fallback.ts            # 降级模式实现
├── worker/
│   └── ws-worker-dedicated.ts       # Dedicated Worker（TS）
├── subscription-manager.ts          # 订阅管理器
├── types.ts                         # 类型定义
└── index.ts                         # 导出入口
```

## 🔧 架构设计

### 1. 三层架构

```text
用户代码
    ↓
SubscriptionManager (业务层)
    ↓
WSClient (选择层) ←→ Worker 或 Fallback
    ↓
Worker Thread (Worker 模式) 或 Main Thread (降级模式)
    ↓
WebSocket 连接
```

### 2. 订阅管理机制

```javascript
// Worker 内部结构
;(Map < SubscriptionType,
  Map < symbol,
  Set <
    callbackId >>>
      // 示例
      {
        market_data: {
          BTCUSDT: Set(['callback_1', 'callback_2']),
          ETHUSDT: Set(['callback_3']),
        },
      })
```

### 3. 消息流

```text
主线程                Worker 线程              WebSocket 服务器
  |                      |                           |
  |------ subscribe ---->|                           |
  |                      |---- subscribe msg ------->|
  |                      |                           |
  |                      |<----- data msg -----------|
  |<----- data ----------|                           |
  |                      |                           |
  |---- unsubscribe ---->|                           |
  |                      |--- unsubscribe msg ------>|
```

## 📝 使用示例

### 基础用法

```typescript
import { createWSClient } from '@mullet/ws'

const { subscriptionManager } = createWSClient({
  url: 'wss://websocket.stellux.io/websocketServer',
  debug: true,
})

const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
  console.log(data.price)
})
```

### React Hook

```typescript
function useMarketData(symbol: string) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribeMarketData(symbol, setData)
    return unsubscribe
  }, [symbol])

  return data
}
```

## 🎯 WebSocket 消息协议

### 订阅请求

```json
{
  "type": "market_data",
  "action": "subscribe",
  "symbol": "BTCUSDT"
}
```

### 数据推送

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

### 取消订阅

```json
{
  "type": "market_data",
  "action": "unsubscribe",
  "symbol": "BTCUSDT"
}
```

## 🚀 启动测试

```bash
# 启动开发服务器
pnpm dev

# 访问测试页面
http://localhost:3001/test-ws
```

## 🔍 调试

### 控制台日志

开启 `debug: true` 查看详细日志：

```text
[WSClient] Using Worker mode
[WSClient] Worker initialized
[WSWorker] WebSocket initialized
[WSWorker] WebSocket connected
[WSWorker] Subscribed: market_data/BTCUSDT, callback: callback_1
[WSWorker] Received WebSocket message: {...}
```

### 工作模式识别

- `[WSClient] Using Worker mode` - ✅ Worker 模式
- `[WSClient] Worker not supported, using direct mode` - ⚠️ 降级模式

## 📊 订阅类型

| 类型     | 方法                   | 数据类型         |
| -------- | ---------------------- | ---------------- |
| 行情数据 | subscribeMarketData    | MarketData       |
| 仓位信息 | subscribePosition      | PositionData     |
| 行情深度 | subscribeMarketDepth   | MarketDepthData  |
| 公告信息 | subscribeAnnouncement  | AnnouncementData |
| 挂单信息 | subscribePendingOrders | PendingOrderData |

## 🎓 最佳实践

1. **全局单例**: 创建一个全局客户端实例
2. **及时清理**: 组件卸载时调用取消订阅
3. **错误处理**: 回调中添加 try-catch
4. **监听状态**: 使用 onConnectionStatusChange
5. **调试模式**: 开发环境开启 debug

## 📦 依赖

```json
{
  "dependencies": {
    "reconnecting-websocket": "^4.4.0"
  }
}
```

## 🌐 浏览器兼容性

- ✅ Chrome/Edge 80+
- ✅ Firefox 80+
- ✅ Safari 14+
- ❌ IE（自动降级）

## 📚 文档

- `README.md` - 完整文档
- `QUICK_START.md` - 快速开始
- `examples/usage.ts` - 使用示例
- `/test-ws` - 在线测试页面

## ✅ 完成状态

- [x] Worker 实现
- [x] 降级机制
- [x] 订阅管理
- [x] 类型定义
- [x] 测试页面
- [x] 文档完善
- [x] Turbopack 支持
- [x] TypeScript 支持
