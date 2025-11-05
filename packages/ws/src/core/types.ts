/**
 * WebSocket 订阅类型
 */
export enum SubscriptionType {
  /** 行情数据 */
  MARKET_DATA = 'symbol',
  /** 行情深度 */
  MARKET_DEPTH = 'depth',
  /** 公告信息 */
  ANNOUNCEMENT = 'announcement',
  /** 交易类型（包含仓位、挂单、账户等） */
  TRADE = 'trade',
}

/**
 * 交易消息子类型
 */
export enum TradeSubType {
  /** 仓位信息 */
  POSITION = 'position',
  /** 挂单信息 */
  ORDER = 'order',
  /** 账户信息 */
  ACCOUNT = 'account',
}

export type SubscriptionParams = {
  topic: string
  key: string
  header?: Partial<WSSendMessageHeader>
}

export type UnsubscribeParams = {
  topic: string
  key: string
  header?: Partial<WSSendMessageHeader>
}

/**
 * 订阅回调函数类型
 */
export type SubscriptionCallback<T = any> = (data: T) => void

/**
 * 行情数据
 */
export interface MarketData {
  symbol: string
  price: string
  volume: string
  high: string
  low: string
  change: string
  changePercent: string
  timestamp: number
}

/**
 * 仓位信息
 */
export interface PositionData {
  symbol: string
  side: 'long' | 'short'
  size: string
  entryPrice: string
  markPrice: string
  liquidationPrice: string
  unrealizedPnl: string
  leverage: number
  timestamp: number
}

/**
 * 行情深度数据
 */
export interface MarketDepthData {
  symbol: string
  bids: Array<[string, string]> // [price, quantity]
  asks: Array<[string, string]> // [price, quantity]
  timestamp: number
}

/**
 * 公告信息
 */
export interface AnnouncementData {
  id: string
  title: string
  content: string
  type: string
  timestamp: number
}

/**
 * 挂单信息
 */
export interface OrderData {
  symbol: string
  orderId: string
  side: 'buy' | 'sell'
  type: string
  price: string
  quantity: string
  filled: string
  status: string
  timestamp: number
}

/**
 * 账户信息
 */
export interface AccountData {
  symbol: string
  balance: string
  available: string
  frozen: string
  equity: string
  margin: string
  timestamp: number
}

/**
 * 交易消息（统一的交易类型消息）
 */
export interface TradeMessage {
  subType: TradeSubType
  symbol: string
  data: PositionData | OrderData | AccountData
  timestamp: number
}

/**
 * 交易订阅回调配置
 */
export interface TradeSubscriptionCallbacks {
  /** 仓位更新回调 */
  onPosition?: (data: PositionData) => void
  /** 挂单更新回调 */
  onOrder?: (data: OrderData) => void
  /** 账户更新回调 */
  onAccount?: (data: AccountData) => void
}

/**
 * 消息头
 */
export type WSSendMessageHeader = {
  tenantId?: string
  userId?: string
  msgId: string
  flowId: number
}

/**
 * 消息体
 */
export type WSSendMessageBody = {
  cancel: boolean
  topic: string
}

/**
 * WebSocket 服务器发送的消息格式
 */
export interface WSSendMessage {
  header: WSSendMessageHeader
  body: WSSendMessageBody
}

/**
 * 消息头
 */
export type WSReceivedMessageHeader = {
  msgId?: SubscriptionType
}

/**
 * 消息体
 */
export type WSReceivedMessageBody = string
/**
 * WebSocket 服务器接收的消息格式
 */
export interface WSReceivedMessage {
  header: WSReceivedMessageHeader
  body: WSReceivedMessageBody
}

/**
 * 内部消息格式（用于客户端内部通信）
 */
export interface InternalWSMessage {
  type: SubscriptionType
  action: 'subscribe' | 'unsubscribe' | 'data'
  params: SubscriptionParams
}

/**
 * 订阅配置
 */
export interface SubscriptionConfig {
  symbol: string
  type: SubscriptionType
}

/**
 * WebSocket 客户端配置
 */
export interface WSClientConfig {
  url: string
  protocol?: string | string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  debug?: boolean
}
