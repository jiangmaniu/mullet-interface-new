// 接口公共参数

declare namespace API {
  // antd表格分页参数
  type PageParams = {
    current?: number
    pageSize?: number
  }
  // 业务分页参数
  type PageParam = {
    current?: number
    size?: number
  }
  // 根据id查询详情
  type IdParam = {
    id: any
  }
  // 响应结果
  type Response<T = any> = {
    /** 200成功 401：Unauthorized 403：Forbidden */
    code?: number
    /** 后台返回的 */
    msg: string
    /** 自定义 */
    message: string
    success?: boolean
    data?: T
  }
  // 分页
  type PageResult<T = any> = {
    /** 总页数 */
    total: number
    /** 每页的数量 */
    size: number
    /** 总页数 */
    pages: number
    /** 当前页 */
    current: number
    /** 列表记录 */
    records: T[]
  }

  // =============== 公共枚举类型 ===================
  type KEYVALUE = {
    key: string
    value: any
    label?: string
  }

  // 交易-计算类型
  type CalculationType =
    /** 外汇 */
    | 'CFD'
    /** 差价合约 */
    | 'FOREIGN_CURRENCY'
  // 交易许可证
  type TradeLicense =
    /** 已禁用 */
    | 'DISABLED'
    /** 完全访问 */
    | 'ENABLE'
    /** 金买入 */
    | 'ONLY_BUY'
    /** 仅平仓 */
    | 'ONLY_CLOSE'
    /** 仅卖出 */
    | 'ONLY_SELL'
  // 交易-交易方向：只有买卖
  type TradeBuySell = 'BUY' | 'SELL'
  // 启用、禁用状态
  type Status = 'DISABLED' | 'ENABLE'
  // 资金变更记录-类型
  type MoneyType =
    /** 充值 */
    | 'DEPOSIT'
    /** 充值(模拟) */
    | 'DEPOSIT_SIMULATE'
    /** 提现 */
    | 'WITHDRAWAL'
    /** 保证金 */
    | 'MARGIN'
    /** 盈亏 */
    | 'PROFIT'
    /** 手续费 */
    | 'HANDLING_FEES'
    /** 库存费 */
    | 'INTEREST_FEES'
    /** 赠金 */
    | 'GIFT'
    /** 划转 */
    | 'TRANSFER'
    /** 跟单分润 */
    | 'FOLLOW_PROFIT'
    /** 归零 */
    | 'ZERO'
    /** 结余 */
    | 'BALANCE'

  // 可用预付款
  type UsableAdvanceCharge =
    /** 不计算未实现的盈利/亏损 */
    | 'NOT_PROFIT_LOSS'
    /** 计算未实现的盈利/亏损 */
    | 'PROFIT_LOSS'
  // 资金划转
  type FundTransfer =
    /** 允许 */
    | 'ALLOWABLE'
    /** 禁止 */
    | 'PROHIBIT'
  // 保证金类型
  type MarginType =
    /** 全仓 */
    | 'CROSS_MARGIN'
    /** 逐仓 */
    | 'ISOLATED_MARGIN'
  // 订单模式
  type OrderMode =
    /** 净额 */
    | 'LOCKED_POSITION'
    /** 锁仓 */
    | 'NETTING'
  // 订单类型
  type OrderType =
    /** 市价单 */
    | 'MARKET_ORDER'
    /** 限价买入单 */
    | 'LIMIT_BUY_ORDER'
    /** 限价卖出单 */
    | 'LIMIT_SELL_ORDER'
    /** 止损限价买入单 */
    | 'STOP_LOSS_LIMIT_BUY_ORDER'
    /** 止损限价卖出单 */
    | 'STOP_LOSS_LIMIT_SELL_ORDER'
    /** 止损市价买入单 */
    | 'STOP_LOSS_MARKET_BUY_ORDER'
    /** 止损市价卖出单 */
    | 'STOP_LOSS_MARKET_SELL_ORDER'
    /** 止损单 */
    | 'STOP_LOSS_ORDER'
    /** 止盈单 */
    | 'TAKE_PROFIT_ORDER'
  // 订单成交方向
  type OrderInOut = 'IN' | 'IN_OUT' | 'OUT'
  // 订单创建原因
  type OrderCreateReason =
    /** 客户 */
    | 'CLIENT'
    /** 经销商 */
    | 'DEALER'
    /** 经理 */
    | 'MANAGER'
    /** 止损 */
    | 'STOP_LOSS'
    /** 止盈 */
    | 'TAKE_PROFIT'
    /** 强制平仓 */
    | 'STOP_OUT'
  // 订单状态
  type OrderStatus =
    /** 已取消 */
    | 'CANCEL'
    /** 委托中 */
    | 'ENTRUST'
    /** 失败 */
    | 'FAIL'
    /** 已完成 */
    | 'FINISH'
  // 持仓单状态
  type BGAStatus =
    /** 持仓中 */
    | 'BAG'
    /** 已完成 */
    | 'FINISH'
  // 银行卡类型
  type BankCardType =
    /** 信用卡 */
    | 'CREDIT_CARD'
    /** 储蓄卡**/
    | 'DEBIT_CARD'

  // 认证状态 银行卡、身份认证 @TODO 补充说明
  type ApproveStatus =
    /** 取消 */
    | 'CANCEL'
    /** 待审核 */
    | 'TODO'
    /** 驳回 */
    | 'DISALLOW'
    /** 成功 */
    | 'SUCCESS'
  // 证件类型
  type IdentificationType =
    /** 身份证 */
    | 'ID_CARD'
    /** 护照 */
    | 'PASSPORT'

  //  注册方式
  type RegisterWay = 'PHONE' | 'EMAIL'
  // KYC授权类型
  type KycAuthType =
    /** 无认证 */
    | 'NOT'
    /** 上传信息审核 */
    | 'UPLOAD_INFO_AUTH'
    /** 腾讯三要素审核 */
    | 'TENCENT_THREE_AUTH'
    /** 腾讯人脸审核 */
    | 'TENCENT_FACE_AUTH'
  // 产品数据源状态
  type SymbolDataSourceStatus =
    /** 未知 */
    | 'UNKNOWN'
    /** 未上线 */
    | 'NOT_ONLINE'
    /** 预上线 */
    | 'PRE_ONLINE'
    /** 已上线 */
    | 'ONLINE'
    /** 暂停 */
    | 'SUSPEND'
    /** 已下线 */
    | 'OFFLINE'
    /** 转版 */
    | 'TRANSFER_BOARD'
    /** 熔断（风控系统控制） */
    | 'FUSE'
  type GTC =
    /** 直到客户取消	 */
    | 'CLIENT_CANCEL'
    /** 当日有效，包括SL/TP	 */
    | 'DAY_VALID'
    /** 当日有效，不包括SL/TP */
    | 'DAY_VALID_NOT'

  // 交易-到期
  type Expire = 'CLIENT_CANCEL'
  // 保证金类型
  type MarginType =
    /** 全仓 */
    | 'CROSS_MARGIN'
    /** 逐仓 */
    | 'ISOLATED_MARGIN'
}
