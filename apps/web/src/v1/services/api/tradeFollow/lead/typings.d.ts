declare namespace TradeFollowLead {
  /**
   * api: getTradeFollowLeadPlaza
   * 跟单广场参数
   * */
  type LeadPlazaParams = {
    /**
     * 结束时间
     */
    endDate: string
    /**
     * groupName
     */
    groupName?: string
    /**
     * 开始时间
     */
    startDate: string
    /**
     * 当前交易账户
     */
    tradeAccountId: string | number
    [property: string]: any
  }
  /**
   * api: getTradeFollowLeadPlaza
   * 跟单广场返回值
   */
  type LeadPlazaItem = {
    /**
     * 交易分组名称
     */
    accountGroupName?: string
    /**
     * 收益率
     */
    earningRate?: number
    /**
     * 收益率
     */
    earningRates?: EarningRateVO[]
    /**
     * 跟单人数
     */
    followerNumber?: number
    /**
     * 总跟单人数
     */
    followerTotal?: number
    /**
     * 头像
     */
    imageUrl?: string
    /**
     * 带单人名称
     */
    leadName?: string
    /**
     * 带单盈亏
     */
    leadProfit?: number
    /**
     * 最大跟随人数限制
     */
    maxSupportCount?: number
    /**
     * 累计盈亏
     */
    profitTotal?: number
    /**
     * 是否本人
     */
    selfFlag?: number
    /**
     * 排序收益率
     */
    sortEarningRate?: number
    /**
     * 状态
     */
    status?: number
    /**
     * 标签
     */
    tags?: string
    /**
     * 交易总数
     */
    tradeTotal?: number
    /**
     * 胜率
     */
    winRate?: number
    [property: string]: any
  }

  /**
   * EarningRateVO
   */
  type EarningRateVO = {
    /**
     * 日期
     */
    date?: Date
    /**
     * 收益率
     */
    earningRate?: number
    [property: string]: any
  }

  /**
   * 申请带单
   */
  type LeadSaveParams = {
    /**
     * 交易账户分组Id
     */
    accountGroupId?: number
    /**
     * 客户Id
     */
    clientId?: number
    /**
     * 合约证明
     */
    contractProof?: string
    /**
     * 描述
     */
    desc?: string
    /**
     * 头像
     */
    imageUrl?: string
    /**
     * 项目名称
     */
    projectName?: string
    /**
     * 交易账户Id
     */
    tradeAccountId?: number
    [property: string]: any
  }

  /**
   * LeadSettingsParams
   * 带单设置参数
   */
  type LeadSettingsParams = {
    /**
     * 资产要求
     */
    assetRequirement?: number
    /**
     * 头像
     */
    imageUrl?: string
    leadId?: number
    /**
     * 最大支持人数
     */
    maxSupportCount?: number
    /**
     * 利润分成比例
     */
    profitSharingRatio?: number
    /**
     * 项目名称
     */
    projectName?: string
    /**
     * 标签
     */
    tags?: string
    [property: string]: any
  }

  /**
   * api: getTradeFollowLeadManagements
   * 带单人 - 带单管理
   */
  type LeadManagementsItem = {
    /**
     * 资产管理规模
     */
    assetScaleTotal?: number
    /**
     * 入住天数
     */
    createDayTotal?: number
    /**
     * 跟单人数
     */
    followerNumber?: number
    /**
     * 分组名称
     */
    groupName?: string
    /**
     * 头像
     */
    imageUrl?: string
    /**
     * 分润比例
     */
    profitSharingRatio?: number
    /**
     * 项目名称
     */
    projectName?: string
    /**
     * 带单保证金额余额
     */
    remainingGuaranteedAmount?: number
    /**
     * 今日分润
     */
    shareProfitToday?: number
    /**
     * 分润总和
     */
    shareProfitTotal?: number
    /**
     * 交易账户Id
     */
    tradeAccountId?: number
    [property: string]: any
  }

  /**
   * getTradeFollowLeadDetail
   * 带单人 - 详情
   */
  type LeadDetailItem = {
    remainingGuaranteedAmount?: number
    /**
     * 资产要求
     */
    assetRequirement?: number
    /**
     * 资产要求限制
     */
    assetRequirementLimit?: number
    /**
     * 资产规模
     */
    assetScale?: number
    /**
     * 资产规模限制
     */
    assetScaleLimit?: number
    /**
     * 资产管理规模
     */
    assetScaleTotal?: number
    /**
     * 审核状态：0待审核  1=已审核 2=审核拒绝
     */
    auditStatus?: number
    /**
     * 入住天数
     */
    createDayTotal?: number
    /**
     * 描述
     */
    desc?: string
    /**
     * 跟单人数
     */
    followerNumber?: number
    /**
     * 头像
     */
    imageUrl?: string
    /**
     * 最大支持人数
     */
    maxSupportCount?: number
    /**
     * 最大支持人数限制
     */
    maxSupportCountLimit?: number
    /**
     * 是否开启带单：1=开启 0=关闭
     */
    openFlag?: number
    /**
     * 分润比例
     */
    profitSharingRatio?: number
    /**
     * 利润分成比例限制
     */
    profitSharingRatioLimit?: number
    /**
     * 带单盈亏
     */
    profitTotal?: number
    /**
     * 项目名称
     */
    projectName?: string
    /**
     * 带单保证金额余额/总资产
     */
    remainingGuaranteedAmount?: string
    /**
     * 今日分润
     */
    shareProfitToday?: number
    /**
     * 分润总和
     */
    shareProfitTotal?: number
    /**
     * 昨日分润
     */
    shareProfitYesterday?: number
    /**
     * 交易账户Id
     */
    tradeAccountId?: number

    groupName?: string
    [property: string]: any
  }
  /**
   * api: tradeFollowLeadStatistics
   * // 带单人 - 带单表现
   */
  type TradeFollowLeadStatisticsItem = {
    /**
     * 平均每笔收益率
     */
    averageProfitRate?: number
    /**
     * 总收益率
     */
    earningRateTotal?: number
    /**
     * 跟单盈亏
     */
    followerProfit?: number
    /**
     * 带单盈亏
     */
    leadProfit?: number
    /**
     * 回撤率
     */
    retracementRate?: number
    /**
     * 胜率
     */
    winRate?: number
    [property: string]: any
  }

  /**
   * api: tradeFollowLeadProfitStatistics
   * // 带单人 - 累计盈亏
   */
  type TradeFollowLeadProfitStatisticsItem = {
    earningRates?: EarningRate[]
    profitAmounts?: ProfitAmount[]
    [property: string]: any
  }

  type EarningRate = {
    /**
     * 日期
     */
    date?: string
    /**
     * 收益率
     */
    earningRate?: number
    [property: string]: any
  }

  /**
   * ProfitAmount
   */
  type ProfitAmount = {
    /**
     * 日期
     */
    date?: string
    /**
     * 盈亏额
     */
    profitAmount?: number
    [property: string]: any
  }
  /**
   * api: tradeFollowSymbolStatistics
   * 带单人 - 交易偏好
   */
  export type TradeFollowLeadSymbolStatisticsItem = {
    /**
     * 跟单盈亏
     */
    profit?: number
    /**
     * 比例
     */
    rate?: number
    /**
     * 品种名称
     */
    symbol?: string
    /**
     * 交易次数
     */
    tradeCount?: number
    [property: string]: any
  }

  type TradeFollowLeadListItem = {
    /**
     * 账户组
     */
    groupName?: string
    /**
     * 带单人Id
     */
    leadId?: number
    /**
     * 项目名称
     */
    projectName?: string
    /**
     * 交易账户
     */
    tradeAccountId?: number
    [property: string]: any
  }

  /**
   * tradeFollowLeadProfitSharing
   * 带单人 - 分润
   */
  type TradeFollowLeadProfitSharingItem = {
    /**
     * 日期
     */
    date?: Date
    /**
     * 跟单人数
     */
    followerNumber?: number
    /**
     * 分润总金额
     */
    profitSharingAmountTotal?: number
    [property: string]: any
  }

  /**
   * 分润详情
   */
  type TradeFollowLeadProfitSharingDetailItem = {
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
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 数据源Symbol
     */
    dataSourceSymbol?: string
    /**
     * 跟单人UUID
     */
    followerId?: number
    /**
     * 图标
     */
    imgUrl?: string
    /**
     * 杠杆倍数
     */
    leverageMultiple?: number
    /**
     * 订单模式
     */
    mode?: string
    /**
     * 订单数量
     */
    orderVolume?: number
    /**
     * 分润金额
     */
    profitSharingAmount?: number
    /**
     * 分润时间
     */
    profitSharingTime?: Date
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
     * 交易账户Id
     */
    tradeAccountId?: number
    /**
     * 交易账户名称
     */
    tradeAccountName?: string
    [property: string]: any
  }

  type TradeFollowLeadOrderParams = {
    /**
     * leadId
     */
    leadId?: string
  } & API.PageParam

  type TradeFollowCurrentLeadOrderItem = {
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
     * 跟单人数
     */
    followerNumber?: number
    /**
     * 分组名称
     */
    groupName?: string
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
     * 带单Id
     */
    leadOrderId?: number
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
     * 项目名称
     */
    projectName?: string
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
    /**
     * 交易账户Id
     */
    tradeAccountId?: number
    [property: string]: any
  }

  type TradeFollowHistoryLeadOrderItem = {
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
     * 跟单人数
     */
    followerNumber?: number
    /**
     * 手续费
     */
    handlingFees?: number
    /**
     * 带单Id
     */
    id?: number
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

  type TradeFollowLeadFollowUserItem = {
    /**
     * 跟随天数
     */
    followerDays?: number
    /**
     * 跟单金额
     */
    money?: number
    /**
     * 收益总额
     */
    profitTotal?: number
    /**
     * 交易账户Id
     */
    tradeAccountId?: number
    [property: string]: any
  }
}
