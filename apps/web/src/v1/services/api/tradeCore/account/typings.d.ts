declare namespace Account {
  // 账号交易品种及配置-集合-参数
  type TradeSymbolListParams = {
    /**
     * 交易账户ID
     */
    accountId?: string | number
    /**
     * 交易品种
     */
    symbol?: string
    /**
     * 交易品种路径 例如 /test2/1/*
     */
    symbolPath?: string
    /**品种分类参数 */
    classify?: string
  }
  // 账号交易品种及配置-集合-列表
  type TradeSymbolListItem = {
    /*
     * 该字段渲染列表用
     */
    visible?: boolean
    /**
     * 别名
     */
    alias?: string
    /**
     * 数据源code
     */
    dataSourceCode?: string
    /**
     * 数据源Symbol
     */
    dataSourceSymbol?: string
    /**
     * 主键
     */
    id: number
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
    symbol: string
    symbolConf?: Symbol.SymbolConf
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
     * 自定义添加的是否选中
     */
    checked?: boolean
    /**品种高开低收 */
    symbolNewTicker?: SymbolNewTicker
    /**第一口报价信息 */
    symbolNewPrice?: SymbolNewPrice
    /**账户组ID */
    accountGroupId?: string
    /**分类 */
    classify?: string
    /**自定义字段 是否在假期内 */
    isInHoliday?: boolean
  }
  type SymbolNewPrice = {
    /**卖交易量 */
    sellSize: string
    /**卖价 */
    sell: number
    /**买价 */
    buy: number
    /**时间戳 */
    id: number
    /**买交易量 */
    buySize: string
  }
  // 高开低收，初始值
  type SymbolNewTicker = {
    dataSourceCode: string
    symbol: string
    /**开盘价 */
    open: string
    /**收盘价 */
    close: string
    /**最低 */
    low: string
    /**最高 */
    high: string
  }
  // 资金变更记录-分页-参数
  type MoneyRecordsPageListParams = API.PageParam & {
    /**账户id 必需 */
    accountId: string
    /**开始时间 */
    startTime?: string
    /**结束时间 */
    endTime?: string
    /**资金类型 */
    type?: API.MoneyType
  }
  // 资金变更记录-分页-列表
  type MoneyRecordsPageListItem = {
    /**
     * 账户ID
     */
    accountId?: number
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 金额
     */
    money?: number
    /**
     * 旧余额
     */
    oldBalance?: number
    /**
     * 类型
     */
    type?: API.MoneyType
    remark?: {
      /**从 */
      fromAccountId: string
      /**到 */
      toAccountId: string
      money: string
    }
    /**
     * 交易签名
     */
    signature?: string
  }
  // 交易账户-分页-参数
  type AccountPageListParams = {
    /**
     * 组名称
     */
    name?: string
    /**客户ID */
    clientId?: string
  } & API.PageParam
  // 交易账户-分页-列表
  type AccountPageListItem = {
    /**
     * 账户组ID
     */
    accountGroupId?: number
    /**
     * 客户ID
     */
    clientId?: number
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 货币单位
     */
    currencyUnit?: string
    /**
     * 启用逐仓
     */
    enableIsolated?: boolean
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
     * 逐仓保证金
     */
    isolatedMargin?: number
    /**
     * 是否模拟
     */
    isSimulate?: boolean
    /**
     * 最近访问
     */
    lastVisitedTime?: string
    /**
     * 保证金
     */
    margin?: number
    /**
     * 余额
     */
    money?: number
    /**
     * 名称
     */
    name?: string
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
    status?: API.Status | boolean
    /**
     * 用户账号 654321@163.com
     */
    userAccount: string
    /**用户名 */
    userName: string
    /**手机号 */
    userPhone: string
    /**邮箱 */
    userEmail: string
  }
  // 交易账户-充值参数
  type RechargeParams = {
    /**
     * 交易账户ID
     */
    accountId: string
    /**
     * 金额
     */
    money: number
    /**
     * 备注
     */
    remark: string
    /**
     * 类型
     */
    type: API.MoneyType
  }
  // 交易账户-新增/修改
  type SubmitAccount = {
    /**
     * 账户组ID
     */
    accountGroupId?: string
    /**
     * 主键
     */
    id?: number
    /**
     * 账户组ID
     */
    accountGroupId: number
    /**
     * 客户ID
     */
    clientId?: string
    /**
     * 启用交易
     */
    isTrade?: boolean
    /**
     * 名称
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
  }
  // 资金划转
  type TransferAccountParams = {
    /**
     * 转出交易账户ID
     */
    fromAccountId: string
    /**
     * 金额
     */
    money: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 转入交易账户ID
     */
    toAccountId: string
  }
  // 模拟入金
  type RechargeSimulateParams = {
    /**
     * 交易账户ID
     */
    accountId: string
    /**
     * 金额
     */
    money?: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 类型
     */
    type: API.MoneyType
  }
  // 交易账户-出金
  type WithdrawByAddressParams = {
    /**
     * 交易账户ID
     */
    accountId: string
    /**
     * 金额
     */
    money: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 出金地址
     */
    withdrawAddress: string
    /**
     * 目标链 (用于跨链桥接)
     */
    targetChain?: string
    /**
     * 交易签名 (链上交易哈希)
     */
    signature?: string
  }
}
