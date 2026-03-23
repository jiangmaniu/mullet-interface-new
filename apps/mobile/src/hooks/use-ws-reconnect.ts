import { useCallback } from 'react'

import { useRootStore } from '@/stores'
import { stores } from '@/v1/provider/mobxProvider'
import { SymbolWSItem } from '@/v1/stores/ws'

/**
 * useWsReconnect - WS 断线重连 + 行情订阅恢复
 *
 * ## 背景
 * ReconnectingWebSocket 在 WS 断线后会自动重连，但重连成功后
 * 服务端不会保留之前的订阅状态，因此行情和持仓推送会停止。
 *
 * ## 触发时机（由调用方决定）
 * 1. 应用从后台恢复到前台（AppState: background → active）
 * 2. 网络从断开恢复连接（isConnected: false → true）
 *
 * ## 实现思路
 * 1. 未登录：直接跳过（无 token）
 * 2. WS 已连接（readyState === 1）：服务端订阅状态仍在，跳过重订阅
 * 3. WS 已断开：
 *    a. 从 sendingSymbols 收集所有当前应订阅的行情 symbol
 *    b. 调用 checkSocketReady 触发重连，连接成功后回调：
 *       - subscribeSymbol：重新订阅行情
 *       - subscribePosition：重新订阅持仓/挂单/账户推送
 */
export const useWsReconnect = () => {
  const reconnect = useCallback(() => {
    const token = useRootStore.getState().user.auth.accessToken
    if (!token) return

    const { ws } = stores

    // 若连接正常，无需重订阅（服务端订阅状态仍在）
    if (ws.socket?.readyState === 1) return

    // 收集当前所有已订阅的行情 symbol
    const symbols = [] as SymbolWSItem[]
    ws.sendingSymbols.forEach((_, key) => {
      symbols.push(ws.stringToSymbol(key))
    })

    ws.checkSocketReady(() => {
      // 重新订阅行情
      if (symbols.length > 0) {
        ws.subscribeSymbol(symbols, false)
      }
      // 重新订阅持仓/挂单/账户
      ws.subscribePosition()
    })
  }, [])

  return { reconnect }
}
