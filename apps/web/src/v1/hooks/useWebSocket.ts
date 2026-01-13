/**
 * WebSocket 客户端 Hook
 * 连接 Mullet Backend WebSocket 服务
 * 
 * 使用方式:
 * ```tsx
 * const { connected, subscribe, unsubscribe, send, lastMessage } = useWebSocket()
 * 
 * // 订阅价格更新
 * useEffect(() => {
 *   subscribe('prices')
 *   return () => unsubscribe('prices')
 * }, [])
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// WebSocket 消息类型
export interface WSMessage {
  type: string
  channel?: string
  data?: any
  timestamp?: number
  message?: string
}

// WebSocket 状态
export type WSReadyState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

// WebSocket 配置
export interface WebSocketConfig {
  url?: string
  autoConnect?: boolean
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  onMessage?: (message: WSMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

// 默认配置
const DEFAULT_CONFIG: Required<Omit<WebSocketConfig, 'onMessage' | 'onConnect' | 'onDisconnect' | 'onError'>> = {
  url: 'wss://api.mulletfinance.xyz/ws/connect',
  autoConnect: true,
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
}

/**
 * WebSocket Hook
 */
export function useWebSocket(config: WebSocketConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [readyState, setReadyState] = useState<WSReadyState>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [subscribedChannels, setSubscribedChannels] = useState<Set<string>>(new Set())
  
  // 发送消息
  const send = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    console.warn('[WebSocket] Cannot send message, connection not open')
    return false
  }, [])
  
  // 订阅频道
  const subscribe = useCallback((channel: string) => {
    if (send({ type: 'subscribe', channel })) {
      setSubscribedChannels(prev => new Set(prev).add(channel))
    }
  }, [send])
  
  // 取消订阅
  const unsubscribe = useCallback((channel: string) => {
    if (send({ type: 'unsubscribe', channel })) {
      setSubscribedChannels(prev => {
        const next = new Set(prev)
        next.delete(channel)
        return next
      })
    }
  }, [send])
  
  // 开始心跳
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
    }
    heartbeatTimerRef.current = setInterval(() => {
      send({ type: 'ping' })
    }, mergedConfig.heartbeatInterval)
  }, [send, mergedConfig.heartbeatInterval])
  
  // 停止心跳
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
  }, [])
  
  // 连接 WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected')
      return
    }
    
    try {
      setReadyState('connecting')
      wsRef.current = new WebSocket(mergedConfig.url)
      
      wsRef.current.onopen = () => {
        console.log('[WebSocket] Connected')
        setReadyState('connected')
        reconnectCountRef.current = 0
        startHeartbeat()
        
        // 重新订阅之前的频道
        subscribedChannels.forEach(channel => {
          wsRef.current?.send(JSON.stringify({ type: 'subscribe', channel }))
        })
        
        mergedConfig.onConnect?.()
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage
          setLastMessage(message)
          mergedConfig.onMessage?.(message)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('[WebSocket] Disconnected')
        setReadyState('disconnected')
        stopHeartbeat()
        mergedConfig.onDisconnect?.()
        
        // 自动重连
        if (mergedConfig.reconnect && reconnectCountRef.current < mergedConfig.maxReconnectAttempts) {
          setReadyState('reconnecting')
          reconnectTimerRef.current = setTimeout(() => {
            reconnectCountRef.current++
            console.log(`[WebSocket] Reconnecting... (${reconnectCountRef.current}/${mergedConfig.maxReconnectAttempts})`)
            connect()
          }, mergedConfig.reconnectInterval)
        }
      }
      
      wsRef.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        mergedConfig.onError?.(error)
      }
    } catch (error) {
      console.error('[WebSocket] Failed to connect:', error)
      setReadyState('disconnected')
    }
  }, [mergedConfig, startHeartbeat, stopHeartbeat, subscribedChannels])
  
  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    stopHeartbeat()
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setReadyState('disconnected')
    reconnectCountRef.current = mergedConfig.maxReconnectAttempts // 阻止重连
  }, [stopHeartbeat, mergedConfig.maxReconnectAttempts])
  
  // 自动连接
  useEffect(() => {
    if (mergedConfig.autoConnect) {
      connect()
    }
    
    return () => {
      disconnect()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    // 状态
    readyState,
    connected: readyState === 'connected',
    lastMessage,
    subscribedChannels: Array.from(subscribedChannels),
    
    // 方法
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
  }
}

/**
 * 价格订阅 Hook
 */
export function usePriceSubscription(tokenMint?: string) {
  const [price, setPrice] = useState<number | null>(null)
  const { connected, subscribe, unsubscribe, lastMessage } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === 'price' && msg.data?.mint === tokenMint) {
        setPrice(msg.data.price)
      }
    }
  })
  
  useEffect(() => {
    if (connected && tokenMint) {
      subscribe(`prices:${tokenMint}`)
      return () => unsubscribe(`prices:${tokenMint}`)
    }
  }, [connected, tokenMint, subscribe, unsubscribe])
  
  return { price, connected }
}

/**
 * 订单状态订阅 Hook
 */
export function useOrderSubscription(orderId?: string) {
  const [orderStatus, setOrderStatus] = useState<any>(null)
  const { connected, subscribe, unsubscribe } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === 'order' && msg.data?.orderId === orderId) {
        setOrderStatus(msg.data)
      }
    }
  })
  
  useEffect(() => {
    if (connected && orderId) {
      subscribe(`orders:${orderId}`)
      return () => unsubscribe(`orders:${orderId}`)
    }
  }, [connected, orderId, subscribe, unsubscribe])
  
  return { orderStatus, connected }
}

/**
 * DeBridge 跨链状态订阅 Hook
 */
export function useDebridgeSubscription(txHash?: string) {
  const [bridgeStatus, setBridgeStatus] = useState<any>(null)
  const { connected, subscribe, unsubscribe } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === 'debridge' && msg.data?.txHash === txHash) {
        setBridgeStatus(msg.data)
      }
    }
  })
  
  useEffect(() => {
    if (connected && txHash) {
      subscribe(`debridge:${txHash}`)
      return () => unsubscribe(`debridge:${txHash}`)
    }
  }, [connected, txHash, subscribe, unsubscribe])
  
  return { bridgeStatus, connected }
}

export default useWebSocket
