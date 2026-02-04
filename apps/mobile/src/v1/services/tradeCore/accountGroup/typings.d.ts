declare namespace AccountGroup {
  type AccountGroupItem = {
    /**
     * 追加预付款比例
     */
    addAdvanceCharge?: number
    /**
     * 强制平仓比例
     */
    compelCloseRatio?: number
    /**
     * 货币小数位
     */
    currencyDecimal?: number
    /**
     * 货币单位
     */
    currencyUnit?: string
    /**
     * 默认入金
     */
    defaultDeposit?: number
    /**
     * 启用链接
     */
    enableConnect?: boolean
    /**
     * 启用逐仓
     */
    enableIsolated?: boolean
    /**
     * 强平后补偿后结余
     */
    enableQphbcfjy?: boolean
    /**
     * 启用交易
     */
    enableTrade?: boolean
    /**
     * 资金划转
     */
    fundTransfer?: API.FundTransfer
    /**
     * 组别
     */
    groupCode?: string
    /**
     * 组名称
     */
    groupName?: string
    /**
     * 主键
     */
    id?: string
    /**
     * 是否模拟
     */
    isSimulate?: boolean
    /**
     * 订单模式
     */
    orderMode?: API.OrderMode
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 可用预付款
     */
    usableAdvanceCharge?: API.UsableAdvanceCharge
    /**
     * 可用历史
     */
    usableHistory?: string
    /** 简介配置 */
    synopsis?: SynopsisConf[]
  }
  type SynopsisConf = {
    /** zh-TW/en-US/vi-VN 语言key */
    language: string
    /** 自定义展示的账户名称 */
    name: string
    /** 简介 */
    remark: string
    /** 标签 */
    tag?: string
    /** 账户属性缩写便签 */
    abbr?: string
    /** 动态描述列表 */
    list?: Array<{ title: string; content: string }>
  }
  // 交易账户组-新增
  type SubmitAccountGroupParams = {
    id?: number
    /**
     * 追加预付款比例
     */
    addAdvanceCharge?: number
    /**
     * 强制平仓比例
     */
    compelCloseRatio?: number
    /**
     * 货币小数位
     */
    currencyDecimal?: number
    /**
     * 货币单位
     */
    currencyUnit?: string
    /**
     * 默认入金
     */
    defaultDeposit?: number
    /**
     * 启用链接
     */
    enableConnect?: boolean
    /**
     * 启用逐仓
     */
    enableIsolated?: boolean
    /**
     * 强平后补偿后结余
     */
    enableQphbcfjy?: boolean
    /**
     * 启用交易
     */
    enableTrade?: boolean
    /**
     * 资金划转
     */
    fundTransfer?: API.FundTransfer
    /**
     * 组别
     */
    groupCode?: string
    /**
     * 组名称
     */
    groupName?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 订单模式
     */
    orderMode?: API.OrderMode
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 可用预付款
     */
    usableAdvanceCharge?: API.UsableAdvanceCharge
    /**
     * 可用历史
     */
    usableHistory?: string
  }
  // 交易账户组关联产品配置 修改
  type UpdateAccountGroupConfig = {
    /**
     * 交易账户组关联产品主键
     */
    accountGroupSymbolsId: number
    /**
     * 货币-基础货币
     */
    baseCurrency?: string
    /**
     * 货币-基础货币小数位
     */
    baseCurrencyDecimal?: number
    /**
     * 交易-计算类型
     */
    calculationType?: Symbol.CalculationType
    /**
     * 交易-合约大小
     */
    contractSize?: number
    /**
     * 常规-市场深度
     */
    depthOfMarket?: string
    /**
     * 启用库存费
     */
    enableHoldingCost?: boolean
    /**
     * 交易-到期
     */
    expire?: API.Expire
    /**
     * 交易-GTC
     */
    gtc?: API.GTC
    /**
     * 库存费配置（JSON）
     */
    holdingCostConf?: string | Symbol.HoldingCostConf
    /**
     * 品种配置主键
     */
    id?: number
    /**
     * 交易-限价和停损级别
     */
    limitStopLevel?: number
    /**
     * 交易量-最大单量
     */
    maxTrade?: number
    /**
     * 交易量-最小单量
     */
    minTrade?: number
    /**
     * 交易量-最大名义价值
     */
    nominalValue?: number
    /**
     * 预付款配置（JSON）
     */
    prepaymentConf?: string
    /**
     * 货币-预付款货币
     */
    prepaymentCurrency?: string
    /**
     * 货币-预付款货币小数位
     */
    prepaymentCurrencyDecimal?: number
    /**
     * 货币-盈利货币
     */
    profitCurrency?: string
    /**
     * 货币-盈利货币小数位
     */
    profitCurrencyDecimal?: number
    /**
     * 报价配置（JSON）
     */
    quotationConf?: string | Symbol.quotationConf
    /**
     * 交易-最高报价延迟
     */
    quotationDelay?: number
    /**
     * 常规-点差配置（JSON）
     */
    spreadConf?: string | Symbol.SpreadConf
    /**
     * 交易-交易方向
     */
    tradeBuySell?: API.TradeBuySell
    /**
     * 交易-交易许可
     */
    tradeLicense?: API.TradeLicense
    /**
     * 交易量-限制
     */
    tradeLimit?: number
    /**
     * 交易量-步长
     */
    tradeStep?: number
    /**
     * 交易时间（JSON）
     */
    tradeTimeConf?: string | Symbol.TradeTimeConf
    /**
     * 手续费配置（JSON）
     */
    transactionFeeConf?: string | Symbol.TransactionFeeConf
  }
  // 交易账户组关联产品-分页-参数
  type AccountGroupSymbolPageListParam = {
    /**
     * 账户组id
     */
    accountGroupId: any
  } & API.PageParam
  // 交易账户组关联产品-分页-列表
  type AccountGroupSymbolPageListItem = {
    /**
     * 关联交易账户组
     */
    accountGroupId?: number
    /**
     * 主键
     */
    id?: number
    /**
     * 是否默认配置
     */
    isDefault?: boolean
    /**
     * 排序
     */
    sort?: number
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 关联交易品种配置
     */
    symbolConfId?: number
    /**
     * 交易品种
     */
    symbols?: string
  }
  // 交易账户组-分页-参数
  type AccountGroupPageListParams = {
    /**
     * 追加预付款比例
     */
    addAdvanceCharge?: number
    /**
     * 强制平仓比例
     */
    compelCloseRatio?: number
    /**
     * 货币小数位
     */
    currencyDecimal?: number
    /**
     * 货币单位
     */
    currencyUnit?: string
    /**
     * 当前页
     */
    current?: number
    /**
     * 默认入金
     */
    defaultDeposit?: number
    /**
     * 启用链接
     */
    enableConnect?: string
    /**
     * 启用逐仓
     */
    enableIsolated?: string
    /**
     * 强平后补偿后结余
     */
    enableQphbcfjy?: string
    /**
     * 启用交易
     */
    enableTrade?: string
    /**
     * 资金划转
     */
    fundTransfer?: string
    /**
     * 组别
     */
    groupCode?: string
    /**
     * 组名称
     */
    groupName?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 订单模式
     */
    orderMode?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 每页的数量
     */
    size?: number
    /**
     * 状态
     */
    status?: string
    /**
     * 可用预付款
     */
    usableAdvanceCharge?: string
    /**
     * 可用历史
     */
    usableHistory?: string
  }
  // 交易账户组-分页-列表
  type AccountGroupPageListItem = {
    /**
     * 追加预付款比例
     */
    addAdvanceCharge?: number
    /**
     * 强制平仓比例
     */
    compelCloseRatio?: number
    /**
     * 货币小数位
     */
    currencyDecimal?: number
    /**
     * 货币单位
     */
    currencyUnit?: string
    /**
     * 默认入金
     */
    defaultDeposit?: number
    /**
     * 启用链接
     */
    enableConnect?: boolean
    /**
     * 启用逐仓
     */
    enableIsolated?: boolean
    /**
     * 强平后补偿后结余
     */
    enableQphbcfjy?: boolean
    /**
     * 启用交易
     */
    enableTrade?: boolean
    /**
     * 资金划转
     */
    fundTransfer?: API.FundTransfer
    /**
     * 组别
     */
    groupCode?: string
    /**
     * 组名称
     */
    groupName?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 订单模式
     */
    orderMode?: API.OrderMode
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 可用预付款
     */
    usableAdvanceCharge?: API.UsableAdvanceCharge
    /**
     * 可用历史
     */
    usableHistory?: string
  }
  // 交易账户组关联产品-新增/修改
  type AddOrUpdateAccountGroupSymbol = {
    /**
     * 关联交易账户组
     */
    accountGroupId?: any
    /**
     * 主键
     */
    id?: number
    /**
     * 是否默认配置
     */
    isDefault?: boolean
    /**
     * 排序
     */
    sort?: number
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 关联交易品种配置
     */
    symbolConfId?: number
    /**
     * 交易品种
     */
    symbols?: string
  }
  //
  type SwitchAccountGroupSymbol = {
    /**
     * 主键id
     */
    id: number
    /**
     * 是否默认配置
     */
    isDefault: boolean
  }
}
