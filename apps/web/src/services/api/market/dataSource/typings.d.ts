declare namespace DataSource {
  // 行情数据源
  type QuoteDataSourceItem = {
    /**
     * 数据源代码
     */
    code?: string
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 图标
     */
    imgUrl?: string
    /**
     * 数据源名称
     */
    name?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: API.Status
    /**
     * 同步K线数据URL
     */
    syncKlineUrl?: string
    /**
     * 同步品种数据URL
     */
    syncSymbolUrl?: string
  }
  // 数据源产品-分页
  type SymbolListItem = {
    /**
     * 基础货币
     */
    baseCurrency?: string
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 品种名称
     */
    name?: string
    /**
     * 价格精度
     */
    pricePrecision?: number
    /**
     * 报价货币
     */
    quoteCurrency?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 状态
     */
    status?: 'NOT_ONLINE' | 'NOT_ONLINE' | 'OFFLINE' | 'ONLINE' | 'PRE_ONLINE' | 'SUSPEND' | 'TRANSFER_BOARD' | 'UNKNOWN'
    /**
     * 品种代码
     */
    symbol?: string
    /**
     * 更新时间
     */
    updateTime?: string
  }
  // 行情数据源-启用/禁用
  type SwitchDataSourceStatusParams = {
    /**
     * 主键id
     */
    id: number
    /**
     * 状态
     */
    status: string
  }
}
