export type Unsubscribe = () => void

/** WS 消息格式 */
export type IMessage = {
  header: {
    flowId: number
    msgId: string
    tenantId: string
    userId: string
  }
  body: any
}

/** 行情价格数据 */
export type IQuotePriceItem = {
  /** 卖交易量 */
  sellSize: number
  /** 买 */
  buy: number
  /** 卖 */
  sell: number
  /** 13位时间戳 */
  id: number
  /** 买交易量 */
  buySize: number
}

/** 行情数据项 */
export type IQuoteItem = {
  /** 品种名称（唯一） */
  symbol: string
  /** 账户组id */
  accountGroupId?: string
  /** 价格数据 */
  priceData: IQuotePriceItem
  /** 数据源code+数据源品种 例如 huobi-btcusdt */
  dataSource: string
  /** 前端计算的卖价涨跌 */
  bidDiff?: number
  /** 前端计算的买价涨跌 */
  askDiff?: number
  /** 获取行情数据的 key */
  dataSourceKey: string
  /** k线原始数据 */
  klineList?: Omit<IKlinePriceItem, 'symbol'>[]
}

/** k线图原始数据 */
export type IKlinePriceItem = {
  symbol: string
  price: number
  id: number
}

/** 深度价格项 */
export type IDepthPriceItem = {
  amount: number
  price: number
}

/** 深度数据 */
export type IDepth = {
  symbol: string
  dataSource: string
  asks: IDepthPriceItem[]
  bids: IDepthPriceItem[]
  ts?: number
  accountGroupId?: string
  dataSourceKey: string
}

/** 消息推送模版 */
export type MessagePopupInfo = {
  messageLogId: number
  /** 消息级别 eg. WARN */
  grade: string
  isAll: string
  /** 标题 */
  title: string
  type: string
  /** 用户id */
  userId: number
  /** 内容 */
  content: string
}
