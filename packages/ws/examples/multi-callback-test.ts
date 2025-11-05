/**
 * 多回调订阅测试示例
 * 演示 SubscriptionManager 如何管理同一 symbol 的多个订阅
 */

import { createWSClient } from '../src'

async function testMultipleCallbacks() {
  console.log('=== 多回调订阅测试 ===\n')

  // 创建客户端
  const { subscriptionManager } = createWSClient({
    url: 'wss://example.com/ws',
  })

  // 模拟多个组件订阅同一个 symbol
  console.log('1. 组件 A 订阅 BTCUSDT')
  const unsubA = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 组件 A 收到数据:', data.price)
  })

  console.log('2. 组件 B 订阅 BTCUSDT')
  const unsubB = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 组件 B 收到数据:', data.price)
  })

  console.log('3. 组件 C 订阅 BTCUSDT')
  const unsubC = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 组件 C 收到数据:', data.price)
  })

  console.log('\n注意：虽然有 3 个订阅，但只会向服务器发送 1 次订阅消息\n')

  // 等待一段时间接收数据
  await new Promise((resolve) => setTimeout(resolve, 5000))

  // 模拟组件卸载
  console.log('\n4. 组件 A 卸载')
  unsubA()
  console.log('  → 底层订阅继续保持（还有 B 和 C）\n')

  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('5. 组件 B 卸载')
  unsubB()
  console.log('  → 底层订阅继续保持（还有 C）\n')

  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('6. 组件 C 卸载')
  unsubC()
  console.log('  → 最后一个订阅取消，发送取消订阅消息给服务器\n')
}

async function testTradeMultipleCallbacks() {
  console.log('\n=== 交易消息多回调测试 ===\n')

  const { subscriptionManager } = createWSClient({
    url: 'wss://example.com/ws',
  })

  // 订阅 1：只关心仓位
  console.log('1. 订阅仓位信息')
  const unsubPos = subscriptionManager.subscribePosition('BTCUSDT', (position) => {
    console.log('  → 仓位更新:', position.size)
  })

  // 订阅 2：只关心订单
  console.log('2. 订阅订单信息')
  const unsubOrder = subscriptionManager.subscribeOrder('BTCUSDT', (order) => {
    console.log('  → 订单更新:', order.orderId, order.status)
  })

  // 订阅 3：同时关心多个
  console.log('3. 订阅所有交易消息')
  const unsubTrade = subscriptionManager.subscribeTrade('BTCUSDT', {
    onPosition: (pos) => console.log('  → [Trade] 仓位:', pos.size),
    onOrder: (order) => console.log('  → [Trade] 订单:', order.orderId),
    onAccount: (acc) => console.log('  → [Trade] 账户:', acc.balance),
  })

  console.log('\n注意：虽然有 3 个订阅，但只会向服务器发送 1 次 TRADE 订阅消息')
  console.log('收到消息后会根据 subType 分发给对应的回调\n')

  await new Promise((resolve) => setTimeout(resolve, 5000))

  console.log('\n取消所有订阅...')
  unsubPos()
  console.log('  → 取消仓位订阅（底层订阅保持）')
  unsubOrder()
  console.log('  → 取消订单订阅（底层订阅保持）')
  unsubTrade()
  console.log('  → 取消交易订阅（发送取消订阅消息）\n')
}

async function testMixedSubscriptions() {
  console.log('\n=== 混合订阅测试 ===\n')

  const { subscriptionManager } = createWSClient({
    url: 'wss://example.com/ws',
  })

  // 同时订阅多种类型
  console.log('1. 订阅 BTCUSDT 行情')
  const unsubMarket = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 行情:', data.price)
  })

  console.log('2. 订阅 BTCUSDT 深度')
  const unsubDepth = subscriptionManager.subscribeMarketDepth('BTCUSDT', (depth) => {
    console.log('  → 深度:', depth.bids.length, '个买单')
  })

  console.log('3. 订阅 BTCUSDT 仓位')
  const unsubPos = subscriptionManager.subscribePosition('BTCUSDT', (pos) => {
    console.log('  → 仓位:', pos.size)
  })

  console.log('\n注意：这是 3 种不同类型的订阅，会分别发送 3 次订阅消息')
  console.log('  - MARKET_DATA: BTCUSDT')
  console.log('  - MARKET_DEPTH: BTCUSDT')
  console.log('  - TRADE: BTCUSDT\n')

  // 再添加相同类型的订阅
  console.log('4. 再次订阅 BTCUSDT 行情（不同组件）')
  const unsubMarket2 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 行情 2:', data.price)
  })

  console.log('  → 不会发送新的订阅消息（复用已有订阅）\n')

  await new Promise((resolve) => setTimeout(resolve, 5000))

  console.log('\n清理所有订阅...')
  unsubMarket()
  unsubMarket2() // 这个取消后才会真正取消 MARKET_DATA 订阅
  unsubDepth()
  unsubPos()
  console.log('  → 完成\n')
}

async function testErrorHandling() {
  console.log('\n=== 错误处理测试 ===\n')

  const { subscriptionManager } = createWSClient({
    url: 'wss://example.com/ws',
  })

  // 订阅 1：正常回调
  const unsub1 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 回调 1 正常执行:', data.price)
  })

  // 订阅 2：会抛出错误的回调
  const unsub2 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 回调 2 开始执行')
    throw new Error('回调 2 故意抛出错误')
  })

  // 订阅 3：正常回调
  const unsub3 = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
    console.log('  → 回调 3 正常执行:', data.price)
  })

  console.log('\n注意：即使回调 2 抛出错误，回调 3 仍然会执行')
  console.log('错误会被捕获并记录到控制台\n')

  await new Promise((resolve) => setTimeout(resolve, 5000))

  console.log('\n清理订阅...')
  unsub1()
  unsub2()
  unsub3()
}

// 运行所有测试
async function runAllTests() {
  try {
    await testMultipleCallbacks()
    await testTradeMultipleCallbacks()
    await testMixedSubscriptions()
    await testErrorHandling()

    console.log('\n=== 所有测试完成 ===')
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 如果需要直接运行此文件，请在 Node.js 环境中使用：
// ts-node examples/multi-callback-test.ts

export { testMultipleCallbacks, testTradeMultipleCallbacks, testMixedSubscriptions, testErrorHandling }
