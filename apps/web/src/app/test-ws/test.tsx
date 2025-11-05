'use client'

import { useEffect, useState } from 'react'

import { createWSClient } from '@mullet/ws'

export default function TestWS() {
  const [logs, setLogs] = useState<string[]>([])
  const [connected, setConnected] = useState(false)

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev.slice(-50), `[${time}] ${msg}`])
  }

  useEffect(() => {
    addLog('🚀 初始化 WebSocket 客户端...')

    const { subscriptionManager, close, isConnected } = createWSClient({
      url: 'wss://websocket.stellux.io/websocketServer',
      debug: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
    })

    addLog(`初始状态: ${isConnected() ? '已连接' : '未连接'}`)

    // 监听连接状态
    const unwatch = subscriptionManager.onConnectionStatusChange((status) => {
      setConnected(status)
      addLog(status ? '✅ WebSocket 已连接' : '❌ WebSocket 已断开')
    })

    // 订阅行情
    addLog('📡 订阅 BTCUSDT 行情...')
    const unsubscribe = subscriptionManager.subscribeMarketData('BTCUSDT', (data) => {
      addLog(`📊 收到数据: ${data.symbol} - ${data.price}`)
    })

    return () => {
      addLog('🛑 清理资源...')
      unsubscribe()
      unwatch()
      close()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">WebSocket 测试</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">连接状态</h2>
          <div className="flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-lg">{connected ? '已连接' : '未连接'}</span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">运行日志</h2>
          <div className="h-96 overflow-y-auto rounded bg-gray-900 p-4 font-mono text-sm text-green-400">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

