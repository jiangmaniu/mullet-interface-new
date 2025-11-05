import type { WSClientConfig } from './types'

import { SubscriptionManager } from './subscription-manager'
import { WSClient } from './ws-client'

// 导出类型
export * from './types'
export type { UserConfig } from './message-converter'

// 导出核心类
export { WSClient } from './ws-client'
export { SubscriptionManager } from './subscription-manager'

/**
 * 创建 WebSocket 客户端实例
 * @param config 客户端配置
 * @returns 返回客户端实例和订阅管理器
 */
export function createWSClient(config: WSClientConfig) {
  const client = new WSClient(config)
  const subscriptionManager = new SubscriptionManager(client)

  return {
    client,
    subscriptionManager,
    // 便捷方法
    close: () => client.close(),
    getStatus: () => subscriptionManager.getSubscriptionStatus(),
    isConnected: () => subscriptionManager.isConnected(),
    onConnectionStatusChange: (callback: (connected: boolean) => void) =>
      subscriptionManager.onConnectionStatusChange(callback),
  }
}

/**
 * 创建默认的 WebSocket 客户端实例（用于开发环境）
 */
export function createDefaultWSClient(url: string, debug = false) {
  return createWSClient({
    url,
    debug,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  })
}
