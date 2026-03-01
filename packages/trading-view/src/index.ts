/**
 * @mullet/trading-view 包入口
 * 供 mobile 等宿主导入 Bridge 类型
 */
export {
  BridgeIncoming,
  BridgeOutgoing,
  type ActiveChartMessage,
  type WidgetMessage,
  type SyncQuoteMessage,
  type SetWatermarkMessage,
  type QuoteTick,
  type AppToWebMessage,
  type WebToAppMessage,
  type MessageEnvelope,
} from './bridge/types'
