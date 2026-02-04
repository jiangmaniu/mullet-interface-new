declare namespace Symbol {
  // 新增、修改交易品种
  type SubmitSymbolParams = {
    /** 主键id */
    id?: number
    /**
     * 别名
     */
    alias?: string
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
    calculationType?: API.CalculationType
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
    holdingCostConf?: HoldingCostConf
    /**
     * 图标
     */
    imgUrl?: string
    /**
     * 交易-限价和停损级别
     */
    limitStopLevel?: number
    /**
     * 数据源code 例如 huobi
     */
    dataSourceCode?: string
    /**
     * 数据源选择对应的symbol 例如 BTCUSDT
     */
    dataSourceSymbol?: string
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
    prepaymentConf?: PrepaymentConf
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
    quotationConf?: QuotationConf
    /**
     * 交易-最高报价延迟
     */
    quotationDelay?: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 常规-点差配置（JSON）
     */
    spreadConf?: SpreadConf
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 品种名称
     */
    symbol: string
    /**
     * 品种小数位
     */
    symbolDecimal?: number
    /**
     * 品种组ID
     */
    symbolGroupId: number
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
    tradeTimeConf?: TradeTimeConf
    /**
     * 手续费配置（JSON）
     */
    transactionFeeConf?: TransactionFeeConf
  }

  // 点差配置
  type SpreadConf = {
    /** 点差模式 */
    type: 'fixed' | 'float'
    /** 固定点差 */
    fixed?: {
      buy: number
      sell: number
    }
    /** 浮动点差 */
    float?: {
      buy: number
      sell: number
    }
  }

  // 交易时间配置（JSON）
  type TradeTimeConf = {
    [key: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY']: {
      /** 启用单独交易时段 */
      isAlone: number
      /** 报价时间 start end是分钟 */
      price: Array<{ start: string; end: string }>
      /** 交易时间 start end是分钟 */
      trade: Array<{ start: string; end: string }>
    }
  }

  // 报价配置
  type QuotationConf = {
    /** 普通过滤级别 */
    ordinary: number
    /** 过滤次数 */
    filterNum: number
    /** 丢弃过滤级别 */
    discard: number
    /** 最小点差 */
    minSpread: number
    /** 最大点差 */
    maxSpread: number
  }

  // 库存费配置（JSON）
  type HoldingCostConf = {
    /** 启用库存费 */
    isEnable: boolean
    /** 考虑假期 */
    isHoliday: boolean
    /** 类型:点模式、以百分比形式，使用现价、以百分比形式，使用开仓价	 */
    type: 'pointMode' | 'percentageCurrentPrice' | 'percentageOpenPrice'
    /** 买入持仓 */
    buyBag: number
    /** 卖出持仓 */
    sellBag: number
    /** 一年中的天数 */
    days: number
    /** 乘数：周一-周日 */
    multiplier: {
      MONDAY: string
      TUESDAY: string
      WEDNESDAY: string
      THURSDAY: string
      FRIDAY: string
      SATURDAY: string
      SUNDAY: string
    }
  }

  // 手续费配置（JSON）
  type TransactionFeeConf = {
    /** 范围类型 */
    type: 'trade_vol' | 'trade_hand'
    /** 交易量 */
    trade_vol?: TransactionFeeConfItem[]
    /** 手数 */
    trade_hand?: TransactionFeeConfItem[]
  }
  type TransactionFeeConfItem = {
    /** 起始值 */
    from: number
    /** 结束值 */
    to: number
    /** 计算模式 货币、百分比 */
    compute_mode: 'currency' | 'percentage'
    /** 市价手续费 */
    market_fee: number
    /** 限价手续费 */
    limit_fee: number
    /** 最小值 */
    min_value: number
    /** 最大值 */
    max_value: number
  }

  // 预付款配置
  type PrepaymentConf = {
    /** 杠杆模式 */
    mode: 'fixed_margin' | 'fixed_leverage' | 'float_leverage'
    /** 固定预付款 */
    fixed_margin?: {
      /** 初始预付款 */
      initial_margin: number
      /** 锁仓预付款 */
      locked_position_margin: number
      /** 是否只收取单边交易手数大的 */
      is_unilateral: boolean
    }
    /** 固定杠杆 */
    fixed_leverage?: {
      /** 杠杆倍数 */
      leverage_multiple: number
      /** 是否只收取单边交易手数大的 */
      is_unilateral: boolean
    }
    /** 自定义杠杆 */
    float_leverage?: {
      /** 按持仓手数、按持仓名义 */
      type: 'volume' | 'nominal'
      /** 最大杠杆 */
      max_lever: string
      /** 最小杠杆 */
      min_lever: string
      lever_grade: Array<{
        /** 杠杆倍数-起始值 */
        lever_start_value: number
        /** 杠杆倍数-结束值 */
        lever_end_value: number
        /** 持仓名义价值 */
        bag_nominal_value: number
      }>
    }
  }

  // 交易品种分页
  type SymbolListItem = {
    /**
     * 别名
     */
    alias?: string
    /**
     * 数据源code 例如 huobi
     */
    dataSourceCode?: string
    /**
     * 数据源选择对应的symbol 例如 BTCUSDT
     */
    dataSourceSymbol?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 图标
     */
    imgUrl?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 品种名称
     */
    symbol?: string
    symbolConf?: SymbolConf
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
  }
  /**
   * 交易品种配置
   */
  type SymbolConf = {
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
    calculationType?: API.CalculationType
    /**
     * 交易-合约大小
     */
    contractSize?: number
    /**
     * 常规-市场深度
     */
    depthOfMarket?: number
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
    holdingCostConf?: HoldingCostConf
    /**
     * 主键
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
    prepaymentConf?: PrepaymentConf
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
    quotationConf?: QuotationConf
    /**
     * 交易-最高报价延迟
     */
    quotationDelay?: number
    /**
     * 常规-点差配置（JSON）
     */
    spreadConf?: SpreadConf
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
    tradeTimeConf?: Symbol.TradeTimeConf
    /**
     * 手续费配置（JSON）
     */
    transactionFeeConf?: Symbol.TransactionFeeConf
    /** 报价大小 */
    quotationSize?: string
  }
  // 全部品种Item列表
  type AllSymbolItem = {
    id: string
    symbol: string
    dataSourceCode: string
    dataSourceSymbol: string
  }
}
