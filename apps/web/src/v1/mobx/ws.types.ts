// worker类型
export type WorkerType =
  /**初始化socket连接 */
  | 'INIT_CONNECT'
  /**连接成功回调 */
  | 'CONNECT_SUCCESS'
  /**关闭连接 */
  | 'CLOSE'
  /**订阅品种行情 */
  | 'SUBSCRIBE_QUOTE'
  /**订阅深度 */
  | 'SUBSCRIBE_DEPTH'
  /**订阅交易信息：持仓单、挂单、账户余额信息 */
  | 'SUBSCRIBE_TRADE'
  /**订阅系统消息推送 */
  | 'SUBSCRIBE_MESSAGE'
  /**订阅需要响应处理的消息 */
  | 'SUBSCRIBE_NOTIFY'
  /**返回品种数据 */
  | 'SYMBOL_RES'
  /**返回深度数据 */
  | 'DEPTH_RES'
  /**返回交易数据 */
  | 'TRADE_RES'
  /**返回消息通知数据 */
  | 'MESSAGE_RES'
  /**定时同步worker线程计算的结果到主线程 */
  | 'SYNC_CALCA_RES'
  // 增量同步数据到worker线程
  /**当前激活品种名称 */
  | 'SYNC_ACTIVE_SYMBOL_NAME'
  /**当前选择的账户信息 */
  | 'SYNC_CURRENT_ACCOUNT_INFO'
  /**持仓单列表 */
  | 'SYNC_POSITION_LIST'
  /**全部品种列表map，校验汇率品种用到 */
  | 'SYNC_ALL_SYMBOL_MAP'
  /**当前账户所有品种列表 */
  | 'SYNC_ALL_SYMBOL_LIST'
  /**同步交易区操作类型 */
  | 'SYNC_TRADE_ACTIONS'
  /** 需要响应的消息 */
  | 'RESOLVE_MSG'

// 消息类型
export enum MessageType {
  /**行情 */
  symbol = 'symbol',
  /**深度报价 */
  depth = 'depth',
  /**行情 */
  trade = 'trade',
  /**消息 */
  notice = 'notice',
  /** 需要响应的消息 */
  msg = 'msg'
}

// 行情价格
export type IQuotePriceItem = {
  /**卖交易量 */
  sellSize: number
  /**买 */
  buy: number
  /**卖 */
  sell: number
  /**这个是时间戳13位 */
  id: number
  /*买交易量 */
  buySize: number
}

// 行情
export type IQuoteItem = {
  /**品种名称（后台创建品种，自定义填写的品种名称，唯一）通过账户组订阅的品种行情才会有symbol */
  symbol: string
  /**账户组id */
  accountGroupId?: string
  /**价格数据 */
  priceData: IQuotePriceItem
  /**数据源code+数据源品种 例如huobi-btcusdt */
  dataSource: string
  /**前端计算的 卖价 上一口报价和下一口报价对比 */
  bidDiff?: number
  /**前端计算的 买价 上一口报价和下一口报价对比 */
  askDiff?: number
  /**k线原始数据 */
  klineList?: Array<Omit<IKlinePriceItem, 'symbol'>>
  /**获取行情数据的key */
  dataSourceKey?: string
}

// k线图原始数据
export type IKlinePriceItem = {
  /**品种名称 */
  symbol: string
  /**价格 买盘卖价（低价） 没有点差的价格 */
  price: number
  /**13位时间戳 */
  id: number
}

// 深度
export type IDepthPriceItem = {
  amount: number
  price: number
}
export type IDepth = {
  /**品种名称（后台创建品种，自定义填写的品种名称，唯一）通过账户组订阅的品种行情才会有symbol */
  symbol: string
  /**数据源code+数据源品种 例如huobi-btcusdt */
  dataSource: string
  asks: IDepthPriceItem[]
  bids: IDepthPriceItem[]
  /**13位时间戳 */
  ts?: number
  /**账户组id */
  accountGroupId?: string
  /**获取行情数据的key */
  dataSourceKey?: string
}

// 消息推送模版
export type MessagePopupInfo = {
  messageLogId: number
  /**消息级别 eg. WARN */
  grade: string
  isAll: string
  /**标题 */
  title: string
  type: any
  /**用户id */
  userId: number
  /**内容 */
  content: string
}

export type ITradeType =
  /** 限价单下单 */
  | 'LIMIT_ORDER'
  /**市价单变更 */
  | 'MARKET_ORDER'
  /**账户变更 */
  | 'ACCOUNT'
  /**成交记录 */
  | 'TRADING'

// 消息体
export type IMessage = {
  header: {
    flowId: number
    /**消息类型 */
    msgId: MessageType
    tenantId: string
    /**用户ID */
    userId: string
  }
  body: any
}

export type MarginReteInfo = {
  /**保证金率 */
  marginRate: any
  /**保证金 */
  margin: any
  /**净值 */
  balance: any
}

// 持仓列表计算结果
export type IPositionListSymbolCalcInfo = {
  /**浮动盈亏 */
  profit: any
  /**保证金率信息 */
  marginRateInfo: MarginReteInfo
  /**收益率 */
  yieldRate: any
}

export type IExpectedMargin = {
  /**手数 */
  orderVolume: number
  /**买卖方向 */
  buySell: API.TradeBuySell
  /**订单类型 */
  orderType: API.OrderType | string
  /**限价单 用户输入的价格 */
  price?: number
}
