declare namespace MarketSymbol {
  // 产品K线数据-分页
  type SymbolKlineListItem = {
    /**
     * 以基础币种计量的交易量
     */
    amount?: number
    /**
     * 本阶段收盘价
     */
    close?: number
    /**
     * 交易次数
     */
    count?: number
    /**
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 本阶段最高价
     */
    high?: number
    /**
     * 主键
     */
    id?: number
    /**
     * K线时间
     */
    klineTime?: number
    /**
     * K线类型
     */
    klineType?: string
    /**
     * 本阶段最低价
     */
    low?: number
    /**
     * 本阶段开盘价
     */
    open?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 以报价币种计量的交易量
     */
    vol?: number
  }
  // 产品实时报价-分页 成交报价
  type SymbolPriceListItem = {
    /**
     * 买一价
     */
    buy?: number
    /**
     * 买一量
     */
    buySize?: number
    /**
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 卖一价
     */
    sell?: number
    /**
     * 卖一量
     */
    sellSize?: number
    /**
     * 交易品种
     */
    symbol?: string
  }
  // 获取当前交易品种最新Ticker 高开低收信息
  type SymbolNewTicker = {
    /**
     * 最新价
     */
    close?: number
    /**
     * 最高价
     */
    high?: number
    /**
     * 最低价
     */
    low?: number
    /**
     * 开盘价
     */
    open?: number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 响应生成时间点
     */
    time?: number
  }
}
