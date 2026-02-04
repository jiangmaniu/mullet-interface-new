declare namespace Order {
  // 下单
  type CreateOrder = {
    /**
     * 携带持仓订单号则为平仓单，只需要传递持仓单号、交易账户ID、订单数量、订单类型和反向订单方向，其他参数无效
     */
    executeOrderId?: any
    /**
     * 订单方向
     */
    buySell?: API.TradeBuySell
    /**
     * 杠杆倍数
     */
    leverageMultiple?: number
    /**
     * 限价价格
     */
    limitPrice?: number | string
    /**
     * 保证金类型
     */
    marginType?: API.MarginType
    /**
     * 订单数量
     */
    orderVolume: any
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 交易品种
     */
    symbol: string
    /**
     * 止盈
     */
    takeProfit?: number
    /**
     * 交易账户ID
     */
    tradeAccountId: number
    /**
     * 订单类型
     */
    type: API.OrderType
  }
  // 下单成功响应内容
  type CreateOrderResponse = {
    bagOrderIds: string
    buySell: API.TradeBuySell
    conf: Symbol.SymbolConf
    createReason: API.OrderCreateReason
    createTime: string
    executeOrderId: string
    expirationTime: string
    finishTime: string
    /** 手续费 */
    handlingFees: string
    id: string
    inOut: API.OrderInOut
    /** 杠杆倍数 */
    leverageMultiple: number
    /** 限价停损单单价格 */
    limitPrice: number
    marginType: API.MarginType
    mode: API.OrderMode
    operatorId: string
    /** 保证金 */
    orderMargin: string
    orderVolume: string
    profit: string
    remark: string
    status: string
    stopLoss: string
    symbol: string
    takeProfit: string
    tradeAccountId: string
    tradePrice: string
    tradingVolume: string
    type: API.OrderType
    updateTime: string
  }
  // 订单修改
  type UpdateOrder = {
    /**
     * 过期时间
     */
    expirationTime?: string
    /**
     * 订单号
     */
    id?: number
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 止盈
     */
    takeProfit?: number
  }

  // 修改委托单(挂单)
  type UpdatePendingOrderParams = {
    /**
     * 委托订单号
     */
    orderId: number
    /**
     * 止损
     */
    stopLoss: number
    /**
     * 止盈
     */
    takeProfit: number
    /**
     * 限价价格
     */
    limitPrice: number
    /**
     * 手数
     */
    orderVolume: number
  }

  // 修改止盈止损参数
  type ModifyStopProfitLossParams = {
    /** 持仓订单号 */
    bagOrderId: any
    /** 止损 */
    stopLoss: any
    /** 止盈 */
    takeProfit: any
  }

  // 订单分页-参数
  type OrderPageListParams = {
    /** 当前账户ID */
    accountId: number | string
    /**
     * 订单方向
     */
    buySell?: API.TradeBuySell
    /**
     * 客户ID
     */
    clientId?: number
    /**
     * 当前页
     */
    current?: number
    /**
     * 保证金类型
     */
    marginType?: API.MarginType
    /**
     * 订单模式
     */
    mode?: API.OrderMode
    /**
     * 每页的数量
     */
    size?: number
    /**
     * 状态
     */
    status?: API.OrderStatus | string
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 订单类型
     */
    type?: API.OrderType | string
    /**
     * 开始时间
     */
    startTime?: string
    /**
     * 结束时间
     */
    endTime?: string
  }
  // 订单分页-列表
  type OrderPageListItem = {
    /**
     * 持仓ID 深度成交有多个 逗号分隔
     */
    bagOrderIds?: string
    executeOrderId?: string
    /**
     * 订单方向
     */
    buySell?: API.TradeBuySell
    /**
     * 配置
     */
    conf?: Symbol.SymbolConf
    /**
     * 创建原因
     */
    createReason?: API.OrderCreateReason
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 过期时间
     */
    expirationTime?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 成交方向
     */
    inOut?: API.OrderInOut
    /**
     * 杠杆倍数
     */
    leverageMultiple?: number
    /**
     * 保证金类型
     */
    marginType?: API.MarginType
    /**
     * 订单模式
     */
    mode?: API.OrderMode
    /**
     * 操作员ID
     */
    operatorId?: number
    /**
     * 订单保证金
     */
    orderMargin?: number
    /**
     * 订单交易量
     */
    orderVolume?: any
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.OrderStatus
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 交易品种别名
     */
    alias?: string
    /**
     * 止盈
     */
    takeProfit?: number
    /**
     * 交易账户ID
     */
    tradeAccountId?: number
    /**
     * 成交价格
     */
    tradePrice?: string
    /**
     * 限价
     */
    limitPrice?: any
    /**
     * 成交量
     */
    tradingVolume?: any
    /**
     * 订单类型
     */
    type?: API.OrderType
    /**
     * 更新时间
     */
    updateTime?: string
    /**
     * 账户id
     */
    accountId: string
    /**
     * 交易账户001
     */
    accountName: string
    /**
     * 用户登录账号 654321@163.com
     */
    userAccount: string
    /** 用户名称 */
    userName: string
    /** 数据源 huobi */
    dataSourceCode: string
    /** 数据源品种 */
    dataSourceSymbol: string
    /** 小数位 */
    symbolDecimal?: number
    /** 追加预付款比例 */
    addAdvanceCharge?: number
    /** 强平比例 */
    compelCloseRatio?: number
    imgUrl?: string
    handlingFees?: number
    finishTime?: string
  }
  type OrderAccountDetail = {
    id: string
    clientId: string
    accountGroupId: string
    name: string
    money: string
    currencyUnit: string
    margin: string
    isolatedMargin: string
    status: string
    remark: string
    lastVisitedTime: string
    createTime: string
    /** 组别 例如real/test2 */
    groupCode: string
    /** 组名 */
    groupName: string
    fundTransfer: API.FundTransfer
    orderMode: API.OrderMode
    enableIsolated: false
    /** 是否是模拟账户 */
    isSimulate: false
  }
  // 订单详情：持仓单、委托单、成交单
  type OrderDetailListItem = BgaOrderPageListItem & {
    /** 账户详情信息 */
    accountDetail?: OrderAccountDetail
    /**
     * 订单集合
     */
    ordersInfo?: Array<
      OrderPageListItem & {
        /**
         * 成交记录集合
         */
        tradeRecordsInfo?: TradeRecordsPageListItem[]
      }
    >
  }

  // 持仓单分页-参数
  type BgaOrderPageListParams = {
    /** 当前账户id */
    accountId: string | number
    /**
     * 订单方向
     */
    buySell?: API.TradeBuySell
    /**
     * 客户ID
     */
    clientId?: number
    /**
     * 当前页
     */
    current?: number
    /**
     * 保证金类型
     */
    marginType?: API.MarginType
    /**
     * 订单模式
     */
    mode?: API.OrderMode
    /**
     * 每页的数量
     */
    size?: number
    /**
     * 状态
     */
    status: API.BGAStatus
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 开始时间
     */
    startTime?: string
    /**
     * 结束时间
     */
    endTime?: string
  }
  // 持仓单分页-列表
  type BgaOrderPageListItem = {
    /**
     * 订单方向
     */
    buySell?: API.TradeBuySell
    /**
     * 平仓价格
     */
    closePrice?: number
    /**
     * 配置
     */
    conf: Symbol.SymbolConf
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 数据源Symbol
     */
    dataSourceSymbol?: string
    /**
     * 手续费
     */
    handlingFees?: number
    /**
     * 主键
     */
    id: string
    /**
     * 图标
     */
    imgUrl?: string
    /**
     * 库存费
     */
    interestFees?: number
    /**
     * 杠杆倍数
     */
    leverageMultiple?: number
    /**
     * 保证金类型
     */
    marginType?: API.MarginType
    /**
     * 订单模式
     */
    mode?: API.OrderMode
    /**
     * 订单保证金
     */
    orderMargin?: number
    /**
     * 订单保证金汇率
     */
    marginExchangeRate?: string
    /**
     * 订单基础保证金
     */
    orderBaseMargin?: number
    /**
     * 订单数量
     */
    orderVolume?: number
    /**
     * 盈亏
     */
    profit?: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 开仓价格
     */
    startPrice?: number
    /**
     * 状态
     */
    status?: API.BGAStatus
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 交易品种别名
     */
    alias?: string
    /**
     * 品种小数位
     */
    symbolDecimal: number
    /**
     * 止盈
     */
    takeProfit?: number
    /**
     * 交易账户ID
     */
    tradeAccountId?: any
    /**
     * 更新时间
     */
    updateTime?: string
    /** 品种配置 */
    conf?: Symbol.SpreadConf
    /**
     * 账户id
     */
    accountId: string
    /**
     * 交易账户001
     */
    accountName: string
    /**
     * 用户登录账号 654321@163.com
     */
    userAccount: string
    /** 用户名称 */
    userName: string
    /** 追加预付款比例 */
    addAdvanceCharge: number
    /** 强制平仓比例 */
    compelCloseRatio: number
    /** 订单类型 */
    type?: API.OrderType
    /** 限价价格 */
    limitPrice?: number
    /** 账户组ID */
    accountGroupId?: string
  }
  // 成交记录-分页-参数
  type TradeRecordsPageListParams = {
    /** 当前账户ID */
    accountId?: any
    /**
     * 客户ID
     */
    clientId?: number
    /**
     * 当前页
     */
    current?: number
    /**
     * 成交方向
     */
    inOut?: API.OrderInOut
    /**
     * 每页的数量
     */
    size?: number
    /**
     * 交易品种
     */
    symbol?: string

    orderId?: string
    /**
     * 开始时间
     */
    startTime?: string
    /**
     * 结束时间
     */
    endTime?: string
  }
  // 成交记录-分页-列表
  type TradeRecordsPageListItem = {
    /**
     * 交易账户ID
     */
    accountId?: number
    /**
     * 交易账户名
     */
    accountName?: string
    /**
     * 持仓订单ID
     */
    bagOrderId?: number
    /**
     * 订单方向
     */
    buySell?: API.TradeBuySell
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 数据源Symbol
     */
    dataSourceSymbol?: string
    /**
     * 手续费
     */
    handlingFees?: number
    /**
     * 主键
     */
    id?: number
    /**
     * 图标
     */
    imgUrl?: string
    /**
     * 成交方向
     */
    inOut?: API.OrderInOut
    /**
     * 库存费
     */
    interestFees?: number
    /**
     * 订单ID
     */
    orderId?: number
    /**
     * 价格id
     */
    priceValueId?: string
    /**
     * 盈亏
     */
    profit?: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 开仓价格
     */
    startPrice?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 品种小数位
     */
    symbolDecimal?: number
    /**
     * 交易账户ID
     */
    tradeAccountId?: number
    /**
     * 成交价格
     */
    tradePrice?: number
    /**
     * 成交量
     */
    tradingVolume?: number
    /**
     * 用户登录账户
     */
    userAccount?: string
    /**
     * 用户名称
     */
    userName?: string
    /**
     * 配置
     */
    conf?: Symbol.SymbolConf
  }
  // 追加保证金
  type AddMarginParams = {
    /** 追加保证金 */
    addMargin: number
    /** 持仓订单号 */
    bagOrderId: string | number
  }
  type ExtractMarginParams = {
    /**	持仓订单号 */
    bagOrderId: string | number
    /** 提取保证金 */
    extractMargin: number
  }
}
