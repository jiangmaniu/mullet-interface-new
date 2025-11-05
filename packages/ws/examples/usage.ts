import type { MarketData } from '../src/core'

import { createWSClient } from '../src/core'

/**
 * @mullet/ws 使用示例（基于 SharedWorker）
 *
 * 这个文件展示了如何在实际项目中使用 WebSocket 客户端
 */

// ============================================
// 示例 1: 基础用法
// ============================================

const url = 'wss://websocket.stellux.io/websocketServer'

export function basicExample() {
  const token = ''
  // 创建 WebSocket 客户端
  const { subscriptionManager, close, isConnected } = createWSClient({
    url: url,
    debug: true,
    protocol: ['WebSocket', token ? token : 'visitor'],
  })
  const userId = '1968513004963692545'
  const tenantId = '000000'
  // 订阅行情数据
  const accountId = 1
  const unsubscribe = subscriptionManager.subscribeMarketData(
    { symbol: 'EURUSD', accountId: accountId.toString(), header: { userId, tenantId } },
    (data) => {
      console.log('BTCUSDT 行情:', data)
    },
  )

  // 检查连接状态
  console.log('已连接:', isConnected())

  // 5秒后取消订阅
  // setTimeout(() => {
  //   unsubscribe()
  //   close()
  // }, 5000)
}

// ============================================
// 示例 2: 监听连接状态
// ============================================

export function connectionStatusExample() {
  const { subscriptionManager } = createWSClient({
    url: 'ws://localhost:8080',
  })

  // 监听连接状态变化
  const unwatch = subscriptionManager.onConnectionStatusChange((connected) => {
    if (connected) {
      console.log('✅ WebSocket 已连接')
    } else {
      console.log('❌ WebSocket 已断开，正在重连...')
    }
  })

  // 10秒后取消监听
  setTimeout(() => {
    unwatch()
  }, 10000)
}

// ============================================
// 示例 3: 多个订阅
// ============================================

export function multipleSubscriptionsExample() {
  const { subscriptionManager } = createWSClient({
    url: 'ws://localhost:8080',
  })

  // 订阅多个交易对的行情
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
  const unsubscribers = symbols.map((symbol) =>
    subscriptionManager.subscribeMarketData(symbol, (data) => {
      console.log(`${symbol} 价格: ${data.price}`)
    }),
  )

  // 取消所有订阅
  const cleanup = () => unsubscribers.forEach((unsubscribe) => unsubscribe())

  return cleanup
}

// ============================================
// 示例 4: 同一交易对的多个回调
// ============================================

export function multipleCallbacksExample() {
  const { subscriptionManager } = createWSClient({
    url: 'ws://localhost:8080',
  })

  // 回调 1: 更新价格显示
  const unsubscribe1 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    updatePriceDisplay(data)
  })

  // 回调 2: 更新图表
  const unsubscribe2 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    updateChart(data)
  })

  // 回调 3: 检查价格警报
  const unsubscribe3 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    checkPriceAlert(data)
  })

  return () => {
    unsubscribe1()
    unsubscribe2()
    unsubscribe3()
  }
}

// ============================================
// 示例 5: 订阅不同类型的数据
// ============================================

export function differentTypesExample() {
  const { subscriptionManager } = createWSClient({
    url: 'ws://localhost:8080',
  })

  // 订阅行情数据
  subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('行情:', data.price)
  })

  // 订阅仓位信息
  subscriptionManager.subscribePosition('BTCUSDT', (position) => {
    console.log('仓位:', position.size)
  })

  // 订阅行情深度
  subscriptionManager.subscribeMarketDepth('BTCUSDT', (depth) => {
    console.log('深度 - 买单:', depth.bids[0])
    console.log('深度 - 卖单:', depth.asks[0])
  })

  // 订阅挂单信息
  subscriptionManager.subscribeOrder('BTCUSDT', (order) => {
    console.log('挂单状态:', order.status)
  })

  // 或使用统一订阅
  subscriptionManager.subscribeTrade('BTCUSDT', {
    onPosition: (position) => console.log('仓位:', position.size),
    onOrder: (order) => console.log('挂单:', order.status),
    onAccount: (account) => console.log('账户:', account.balance),
  })

  // 订阅公告
  subscriptionManager.subscribeAnnouncement('system', (announcement) => {
    console.log('新公告:', announcement.title)
  })
}

// ============================================
// 示例 6: 查看订阅状态
// ============================================

export async function checkStatusExample() {
  const { subscriptionManager } = createWSClient({
    url: 'ws://localhost:8080',
  })

  // 添加一些订阅
  subscriptionManager.subscribeMarketData('BTCUSDT', () => {})
  subscriptionManager.subscribeMarketData('BTCUSDT', () => {}) // 同一交易对的第二个订阅
  subscriptionManager.subscribeMarketData('ETHUSDT', () => {})
  subscriptionManager.subscribePosition('BTCUSDT', () => {})

  // 查看订阅状态（异步）
  const status = await subscriptionManager.getSubscriptionStatus()
  console.log('订阅状态:', status)

  /**
   * 输出示例:
   * {
   *   "market_data": {
   *     "BTCUSDT": 2,
   *     "ETHUSDT": 1
   *   },
   *   "position": {
   *     "BTCUSDT": 1
   *   }
   * }
   */
}

// ============================================
// 示例 7: 多标签页场景
// ============================================

export function multiTabExample() {
  // 在标签页 A 中
  const { subscriptionManager: managerA } = createWSClient({
    url: 'ws://localhost:8080',
  })

  managerA.subscribeMarketData('BTCUSDT', (data) => {
    console.log('标签页 A 收到数据:', data)
  })

  // 在标签页 B 中（使用相同的 URL，会共享 SharedWorker）
  const { subscriptionManager: managerB } = createWSClient({
    url: 'ws://localhost:8080',
  })

  managerB.subscribeMarketData('BTCUSDT', (data) => {
    console.log('标签页 B 收到数据:', data)
  })

  // 两个标签页共享同一个 WebSocket 连接
  // 服务器只会收到一次 BTCUSDT 的订阅请求
  // 数据会同时推送到两个标签页
}

// ============================================
// React Hook 示例
// ============================================

/**
 * 在 React 中使用 WebSocket 的 Hook 示例
 */
export function useMarketDataHook() {
  // 注意：这只是伪代码示例，实际使用需要在 React 环境中

  const code = `
import { useEffect, useState } from 'react';
import { createWSClient, type MarketData } from '@mullet/ws';

// 创建全局客户端实例
const { subscriptionManager } = createWSClient({
  url: process.env.NEXT_PUBLIC_WS_URL!,
  debug: process.env.NODE_ENV === 'development',
});

// 订阅行情数据的 Hook
export function useMarketData(symbol: string) {
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribeMarketData(
      symbol,
      (marketData) => {
        setData(marketData);
      }
    );

    return unsubscribe;
  }, [symbol]);

  return data;
}

// 连接状态 Hook
export function useConnectionStatus() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unwatch = subscriptionManager.onConnectionStatusChange((status) => {
      setConnected(status);
    });

    return unwatch;
  }, []);

  return connected;
}

// 在组件中使用
function PriceDisplay({ symbol }: { symbol: string }) {
  const marketData = useMarketData(symbol);
  const connected = useConnectionStatus();

  if (!connected) {
    return <div>连接中...</div>;
  }

  if (!marketData) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div>价格: {marketData.price}</div>
      <div>涨跌幅: {marketData.changePercent}%</div>
      <div className={connected ? 'text-green-500' : 'text-red-500'}>
        {connected ? '已连接' : '未连接'}
      </div>
    </div>
  );
}
  `

  console.log(code)
}

// ============================================
// 工具函数（示例中使用）
// ============================================

function updatePriceDisplay(data: MarketData) {
  console.log('更新价格显示:', data.price)
}

function updateChart(data: MarketData) {
  console.log('更新图表:', data)
}

function checkPriceAlert(_data: MarketData) {
  // 检查价格警报逻辑
}
