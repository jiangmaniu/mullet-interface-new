/**
 * WebSocket 连接测试脚本
 * 用于验证 WebSocket 客户端是否正常工作
 */

import { createWSClient } from '../src'

const WS_URL = 'wss://websocket.stellux.io/websocketServer'

export function testConnection() {
  console.log('🚀 开始测试 WebSocket 连接...')
  console.log('URL:', WS_URL)

  const { subscriptionManager, isConnected, close } = createWSClient({
    url: WS_URL,
    debug: true, // 开启调试日志
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  })

  // 监听连接状态
  const unwatch = subscriptionManager.onConnectionStatusChange((connected) => {
    if (connected) {
      console.log('✅ WebSocket 连接成功!')
      testSubscription()
    } else {
      console.log('❌ WebSocket 连接断开')
    }
  })

  // 测试订阅
  function testSubscription() {
    console.log('📡 开始测试订阅...')

    // 订阅 BTCUSDT 行情
    const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
      console.log('📊 收到行情数据:', {
        symbol: data.symbol,
        price: data.price,
        volume: data.volume,
        timestamp: new Date(data.timestamp).toLocaleString(),
      })
    })

    // 10秒后取消订阅
    setTimeout(() => {
      console.log('🛑 取消订阅...')
      unsubscribe()

      // 再过2秒关闭连接
      setTimeout(() => {
        console.log('👋 关闭连接...')
        unwatch()
        close()
        console.log('✅ 测试完成')
      }, 2000)
    }, 10000)
  }

  // 检查初始连接状态
  console.log('初始连接状态:', isConnected() ? '已连接' : '未连接')
}

// 如果直接运行此文件
if (import.meta.url === new URL(import.meta.url).href) {
  testConnection()
}

