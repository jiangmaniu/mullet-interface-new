declare namespace TradeFollowFollower {
  /**
   * api: getTradeFollowFolloerManagementInProgress / getTradeFollowFolloerManagementEnd
   * 跟单管理 - 进行中 / 已结束
   */
  type ManagementParams = {
    /**
     * accountGroupId
     */
    accountGroupId?: number
    /**
     * clientId
     */
    clientId?: number
    /**
     * followerTradeAccountId
     */
    followerTradeAccountId?: string | number
    // [property: string]: any;
  }
  /**
   * api: getTradeFollowFolloerManagementInProgress
   * 跟单管理 - 进行中
   */
  type ManagementInProgressItem = {
    /**
     * 跟单金额
     */
    followAmount?: number
    /**
     * 跟单Id
     */
    followerId?: string
    leadId?: string
    /**
     * 头像
     */
    imageUrl?: string
    /**
     * 净利润
     */
    netProfitAndLoss?: number
    /**
     * 已实现盈亏
     */
    profitLoss?: number
    /**
     * 分润金额
     */
    profitSharingAmount?: number
    /**
     * 项目名称
     */
    projectName?: string
    /**
     * 账户保证金
     */
    tradeAmountTotal?: number
    [property: string]: any
  }

  /**
   * api: getTradeFollowFolloerManagementEnd
   * 跟单管理-已结束
   */
  type ManagementEndItem = {
    /**
     * 跟单金额
     */
    followAmount?: number
    /**
     * 跟随天数
     */
    followerDays?: number
    /**
     * 跟随结束时间
     */
    followerEndTime?: Date
    /**
     * 跟单人Id
     */
    followerId?: string
    leadId?: string
    /**
     * 跟随开始时间
     */
    followerStartTime?: Date
    /**
     * 头像
     */
    imageUrl?: string
    /**
     * 净利润
     */
    netProfitAndLoss?: number
    /**
     * 已实现盈亏
     */
    profitLoss?: number
    /**
     * 分润金额
     */
    profitSharingAmount?: number
    /**
     * 项目名称
     */
    projectName?: string
    [property: string]: any
  }

  /**
   * api: getTradeFollowFolloerManagementHistory
   * 跟单管理 - 历史仓位
   */
  type ManagementHistoryItem = {
    /**
     * 别名
     */
    alias?: string
    /**
     * 订单方向
     */
    buySell?: string
    /**
     * 分类
     */
    classify?: string
    /**
     * 平仓价格
     */
    closePrice?: number
    /**
     * 配置
     */
    conf?: string
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
    marginType?: string
    /**
     * 订单模式
     */
    mode?: string
    /**
     * 订单基础保证金
     */
    orderBaseMargin?: number
    /**
     * 订单保证金
     */
    orderMargin?: number
    /**
     * 订单数量
     */
    orderVolume?: number
    /**
     * 盈亏
     */
    profit?: number
    /**
     * 开仓均价
     */
    startPrice?: number
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 品种组配置ID
     */
    symbolConfId?: number
    /**
     * 品种小数位
     */
    symbolDecimal?: number
    /**
     * 品种组ID
     */
    symbolGroupId?: number
    /**
     * 止盈
     */
    takeProfit?: number
    [property: string]: any
  }
  /**
   * api: postTradeFollowFolloerSave
   * 跟单人 - 申请跟单 （跟单设置）
   */
  type SaveParams = {
    /**
     * 交易账户分组Id
     */
    accountGroupId?: string
    /**
     * 交易账户Id
     */
    accountId?: string
    /**
     * 客户Id
     */
    clientId?: string
    /**
     * 保证金额
     */
    guaranteedAmount?: number
    /**
     * 保证金额比例
     */
    guaranteedAmountRatio?: number
    /**
     * 带单人Id
     */
    leadId?: string
    /**
     * 止盈比例
     */
    profitRatio?: number
    /**
     * 止损比例
     */
    stopLossRatio?: number
    /**
     * 类型：10 表示固定金额，20 表示固定比例
     */
    type?: string
    [property: string]: any
  }

  /**
   * api: getTradeFollowFolloerHistoryFollowerOrder
   * 跟单人 - 历史跟单
   */
  type HistoryFollowerOrderItem = {
    /**
     * 别名
     */
    alias?: string
    /**
     * 订单方向
     */
    buySell?: string
    /**
     * 分类
     */
    classify?: string
    /**
     * 平仓价格
     */
    closePrice?: number
    /**
     * 配置
     */
    conf?: string
    /**
     * 创建时间
     */
    createTime?: Date
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
     * 图标
     */
    imgUrl?: string
    /**
     * 库存费
     */
    interestFees?: number
    /**
     * 带单人Id
     */
    leadId?: number
    /**
     * 杠杆倍数
     */
    leverageMultiple?: number
    /**
     * 保证金类型
     */
    marginType?: string
    /**
     * 订单模式
     */
    mode?: string
    /**
     * 订单基础保证金
     */
    orderBaseMargin?: number
    /**
     * 订单保证金
     */
    orderMargin?: number
    /**
     * 订单数量
     */
    orderVolume?: number
    /**
     * 盈亏
     */
    profit?: number
    /**
     * 分润金额
     */
    profitSharingAmount?: number
    /**
     * 分润时间
     */
    profitSharingTime?: Date
    /**
     * 开仓均价
     */
    startPrice?: number
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 品种组配置ID
     */
    symbolConfId?: number
    /**
     * 品种小数位
     */
    symbolDecimal?: number
    /**
     * 品种组ID
     */
    symbolGroupId?: number
    /**
     * 止盈
     */
    takeProfit?: number
    [property: string]: any
  }

  type CurrentFollowerOrderItem = {
    /**
     * 别名
     */
    alias?: string
    /**
     * 订单方向
     */
    buySell?: string
    /**
     * 分类
     */
    classify?: string
    /**
     * 平仓价格
     */
    closePrice?: number
    /**
     * 配置
     */
    conf?: string
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
    marginType?: string
    /**
     * 订单模式
     */
    mode?: string
    /**
     * 订单基础保证金
     */
    orderBaseMargin?: number
    /**
     * 订单保证金
     */
    orderMargin?: number
    /**
     * 订单数量
     */
    orderVolume?: number
    /**
     * 盈亏
     */
    profit?: number
    /**
     * 开仓均价
     */
    startPrice?: number
    /**
     * 止损
     */
    stopLoss?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 品种组配置ID
     */
    symbolConfId?: number
    /**
     * 品种小数位
     */
    symbolDecimal?: number
    /**
     * 品种组ID
     */
    symbolGroupId?: number
    /**
     * 止盈
     */
    takeProfit?: number
    [property: string]: any
  }

  type FollowDetailItem = {
    /**
     * 账户金额
     */
    accountAmount?: number
    /**
     * 交易分组Id
     */
    accountGroupId?: number
    /**
     * 客户端id
     */
    clientId?: number
    /**
     * 创建时间
     */
    createTime?: Date
    /**
     * 结束跟单时间
     */
    endTime?: Date
    /**
     * 跟单人Id
     */
    followerId?: number
    /**
     * 保证金额
     */
    guaranteedAmount?: number
    /**
     * 保证金比例
     */
    guaranteedAmountRatio?: number
    /**
     * 带单人Id
     */
    leadId?: number
    /**
     * 止盈比例
     */
    profitRatio?: number
    /**
     * 开始跟单时间
     */
    startTime?: Date
    /**
     * 状态：10=进行中  20=已结束
     */
    status?: string
    /**
     * 止损比例
     */
    stopLossRatio?: number
    /**
     * 跟单人账户Id
     */
    tradeAccountId?: number
    /**
     * 类型：10 表示固定金额，20 表示固定比例
     */
    type?: string
    /**
     * 更新时间
     */
    updateTime?: Date
    [property: string]: any
  }
}
