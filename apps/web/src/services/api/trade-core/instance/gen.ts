/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AccountCountVO */
export interface AccountCountVO {
  /** 账户净值 */
  availableBalance?: number;
  /**
   * 交易账户id
   * @format int64
   */
  id?: number;
  /** 总入金 */
  totalDeposit?: number;
  /** 总盈亏 */
  totalProfitLoss?: number;
  /** 总成交量 */
  totalTradeVolume?: number;
  /** 总出金 */
  totalWithdrawal?: number;
}

/** AccountCreateVO */
export interface AccountCreateVO {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId: number;
  /**
   * 客户ID
   * @format int64
   */
  clientId: number;
  /** 名称 */
  name?: string;
  /** 备注 */
  remark?: string;
}

/** AccountGroupCloneVO */
export interface AccountGroupCloneVO {
  /** 组别 */
  groupCode?: string;
  /** 组名称 */
  groupName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 是否模拟 */
  isSimulate?: boolean;
  /** 备注 */
  remark?: string;
}

/** AccountGroupSaveVO */
export interface AccountGroupSaveVO {
  /**
   * 追加预付款比例
   * @format int32
   */
  addAdvanceCharge?: number;
  /**
   * 强制平仓比例
   * @format int32
   */
  compelCloseRatio?: number;
  /**
   * 货币小数位
   * @format int32
   */
  currencyDecimal?: number;
  /** 货币单位 */
  currencyUnit?: string;
  /** 默认入金 */
  defaultDeposit?: number;
  /** 启用链接 */
  enableConnect?: boolean;
  /** 启用逐仓 */
  enableIsolated?: boolean;
  /** 强平后补偿后结余 */
  enableQphbcfjy?: boolean;
  /** 启用交易 */
  enableTrade?: boolean;
  /** 资金划转 */
  fundTransfer?: AccountGroupSaveVoFundTransferEnum;
  /** 组别 */
  groupCode?: string;
  /** 组名称 */
  groupName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 是否模拟 */
  isSimulate?: boolean;
  /** Mint代币地址 */
  mintAddress?: string;
  /** Solana网络 */
  network?: string;
  /** Solana网络别名 */
  networkAlias?: string;
  /** 订单模式 */
  orderMode?: AccountGroupSaveVoOrderModeEnum;
  /** 智能合约ID */
  programId?: string;
  /** 备注 */
  remark?: string;
  /** 简介 */
  synopsis?: string;
  /** 可用预付款 */
  usableAdvanceCharge?: AccountGroupSaveVoUsableAdvanceChargeEnum;
  /**
   * 可用历史
   * @format int32
   */
  usableHistory?: number;
}

/** AccountHighVO */
export interface AccountHighVO {
  /** 账户组别 */
  accountGroup?: string;
  /**
   * 交易账户ID
   * @format int64
   */
  accountId?: number;
  /** 客户 */
  client?: string;
  /** 客户id */
  clientId?: string;
  /** 保证金比例 */
  marginRatio?: number;
  /** 余额 */
  money?: number;
}

/** AccountMoneyTransferVO */
export interface AccountMoneyTransferVO {
  /**
   * 转出交易账户ID
   * @format int64
   */
  fromAccountId: number;
  /** 金额 */
  money?: number;
  /** 备注 */
  remark?: string;
  /**
   * 转入交易账户ID
   * @format int64
   */
  toAccountId: number;
}

/** AccountUpdateVO */
export interface AccountUpdateVO {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 启用交易 */
  isTrade?: boolean;
  /** 名称 */
  name?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountUpdateVoStatusEnum;
}

/** FollowManageCreateVO */
export interface FollowManageCreateVO {
  /** 跟单池名称 */
  followPoolName?: string;
  /** 初始金额 */
  initialMoney?: number;
  /**
   * 跟单主账户ID
   * @format int64
   */
  mainAccountId?: number;
  /** 赎回是否平仓订单 */
  redeemCloseOrder?: boolean;
  /** 备注 */
  remark?: string;
}

/** FollowPurchaseSharesVO */
export interface FollowPurchaseSharesVO {
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /** 申购金额 */
  purchaseMoney?: number;
  /** 备注 */
  remark?: string;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
}

/** FollowRedeemSharesVO */
export interface FollowRedeemSharesVO {
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /** 备注 */
  remark?: string;
  /** 赎回份额 */
  sharesAmount?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
}

/** FollowVaultDivvyVO */
export interface FollowVaultDivvyVO {
  /** 分红金额 */
  divvyMoney?: number;
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /** 备注 */
  remark?: string;
}

/** HandRechargeVO */
export interface HandRechargeVO {
  /**
   * 交易账户ID
   * @format int64
   */
  accountId: number;
  /** 金额 */
  money?: number;
  /** 备注 */
  remark?: string;
  /** 类型 */
  type: HandRechargeVoTypeEnum;
}

/** HandWithdrawVO */
export interface HandWithdrawVO {
  /**
   * 交易账户ID
   * @format int64
   */
  accountId: number;
  /** 金额 */
  money?: number;
  /** 备注 */
  remark?: string;
  /**
   * 出金地址
   * @minLength 43
   * @maxLength 44
   */
  withdrawAddress: string;
}

/** JSONObject */
export type JSONObject = Record<string, object>;

/** LbPoolAddVO */
export interface LbPoolAddVO {
  /** 基础金额 */
  baseMoney?: number;
  /** LB code */
  lbCode?: string;
  /** LB名称 */
  lbName?: string;
  /** LP金库地址 */
  lpAddress?: string;
  /** LP金库分成比例 */
  lpSharingRatio?: number;
  /** Mint代币地址 */
  mintAddress?: string;
  /** Solana网络RPC */
  networkRpc?: string;
  /** Solana网络WS */
  networkWs?: string;
  /** 智能合约ID */
  programId?: string;
  /** 协议金库地址 */
  protocolAddress?: string;
  /** 协议金库分成比例 */
  protocolSharingRatio?: number;
  /** 备注 */
  remark?: string;
}

/** LbPoolUpdateVO */
export interface LbPoolUpdateVO {
  /** 基础金额 */
  baseMoney?: number;
  /** 关联交易品种 */
  correlationSymbols?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** LB code */
  lbCode?: string;
  /** LB名称 */
  lbName?: string;
  /** LP金库分成比例 */
  lpSharingRatio?: number;
  /** Mint代币地址 */
  mintAddress?: string;
  /** Solana网络RPC */
  networkRpc?: string;
  /** Solana网络WS */
  networkWs?: string;
  /** 智能合约ID */
  programId?: string;
  /** 协议金库分成比例 */
  protocolSharingRatio?: number;
  /** 备注 */
  remark?: string;
}

/** OrderHighVO */
export interface OrderHighVO {
  /** 账户组别 */
  accountGroup?: string;
  /**
   * 交易账户ID
   * @format int64
   */
  accountId?: number;
  /** 持仓单id */
  bagOrderId?: string;
  /** 客户 */
  client?: string;
  /** 客户id */
  clientId?: string;
  /** 保证金比例 */
  marginRatio?: number;
  /** 余额 */
  money?: number;
}

/**
 * R
 * 返回信息
 */
export interface R {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: object;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/** TwrRecordVO */
export interface TwrRecordVO {
  /** 净值回报率 */
  navReturnRate?: number;
  /** 盈亏 */
  profit?: number;
  /** TWR */
  twr?: number;
  /**
   * TWR时间
   * @format int64
   */
  twrTime?: number;
}

/** Type */
export interface Type {
  typeName?: string;
}

/**
 * AccountGroupSymbols对象
 * 交易账户组关联产品
 */
export interface AccountGroupSymbols {
  /**
   * 关联交易账户组
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 是否默认配置 */
  isDefault?: boolean;
  /**
   * 排序
   * @format int32
   */
  sort?: number;
  /** 状态 */
  status?: AccountGroupSymbolsStatusEnum;
  /**
   * 关联交易品种配置
   * @format int64
   */
  symbolConfId?: number;
  /** 交易品种 */
  symbols?: string;
}

/**
 * AccountGroupSymbols对象_1
 * 交易账户组关联产品
 */
export interface AccountGroupSymbols1 {
  /**
   * 关联交易账户组
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 是否默认配置 */
  isDefault?: boolean;
  /**
   * 排序
   * @format int32
   */
  sort?: number;
  /** 状态 */
  status?: AccountGroupSymbols1StatusEnum;
  /** 主键 */
  symbolConf?: SymbolConf;
  /**
   * 关联交易品种配置
   * @format int64
   */
  symbolConfId?: number;
  /** 交易品种 */
  symbols?: string;
}

/**
 * AccountGroup对象
 * 交易账户组
 */
export interface AccountGroup {
  /**
   * 追加预付款比例
   * @format int32
   */
  addAdvanceCharge?: number;
  /**
   * 强制平仓比例
   * @format int32
   */
  compelCloseRatio?: number;
  /**
   * 货币小数位
   * @format int32
   */
  currencyDecimal?: number;
  /** 货币单位 */
  currencyUnit?: string;
  /** 默认入金 */
  defaultDeposit?: number;
  /** 启用链接 */
  enableConnect?: boolean;
  /** 启用逐仓 */
  enableIsolated?: boolean;
  /** 强平后补偿后结余 */
  enableQphbcfjy?: boolean;
  /** 启用交易 */
  enableTrade?: boolean;
  /** 资金划转 */
  fundTransfer?: AccountGroupFundTransferEnum;
  /** 组别 */
  groupCode?: string;
  /** 组名称 */
  groupName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 是否模拟 */
  isSimulate?: boolean;
  /** Mint代币地址 */
  mintAddress?: string;
  /**
   * Mint代币小数位
   * @format int32
   */
  mintDecimals?: number;
  /** Solana网络别名 */
  networkAlias?: string;
  /** Solana网络RPC */
  networkRpc?: string;
  /** Solana网络WS */
  networkWs?: string;
  /** 订单模式 */
  orderMode?: AccountGroupOrderModeEnum;
  /** 智能合约ID */
  programId?: string;
  /** 协议金库地址 */
  protocolVaultAddress?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountGroupStatusEnum;
  /** 简介 */
  synopsis?: string;
  /** 可用预付款 */
  usableAdvanceCharge?: AccountGroupUsableAdvanceChargeEnum;
  /**
   * 可用历史
   * @format int32
   */
  usableHistory?: number;
}

/**
 * AccountManage对象
 * 跟单账户
 */
export interface AccountManage {
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 跟单账户ID
   * @format int64
   */
  followAccountId?: number;
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /** 跟单盈亏 */
  followProfit?: number;
  /** 跟单份额 */
  followShares?: number;
  /** 跟单总金额 */
  followTotalMoney?: number;
  /** 跟单总份额 */
  followTotalShares?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** PDA地址 */
  pdaAddress?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountManageStatusEnum;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
}

/**
 * AccountManage对象_1
 * 跟单账户
 */
export interface AccountManage1 {
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 跟单账户ID
   * @format int64
   */
  followAccountId?: number;
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /** 跟单盈亏 */
  followProfit?: number;
  /** 跟单份额 */
  followShares?: number;
  /** 跟单总金额 */
  followTotalMoney?: number;
  /** 跟单总份额 */
  followTotalShares?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** PDA地址 */
  pdaAddress?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountManage1StatusEnum;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
}

/**
 * AccountManage对象_2
 * 跟单账户
 */
export interface AccountManage2 {
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 跟单账户ID
   * @format int64
   */
  followAccountId?: number;
  /** 跟单管理信息 */
  followManage?: PoolManage1;
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /** 跟单盈亏 */
  followProfit?: number;
  /** 跟单份额 */
  followShares?: number;
  /** 跟单总金额 */
  followTotalMoney?: number;
  /** 跟单总份额 */
  followTotalShares?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /**
   * 追后申购时间
   * @format date-time
   */
  lastPurchaseTime?: string;
  /** PDA地址 */
  pdaAddress?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountManage2StatusEnum;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
}

/**
 * AccountPage对象
 * 交易账户
 */
export interface AccountPage {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 追加预付款比例
   * @format int32
   */
  addAdvanceCharge?: number;
  /**
   * 客户ID
   * @format int64
   */
  clientId?: number;
  /**
   * 强制平仓比例
   * @format int32
   */
  compelCloseRatio?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 货币单位 */
  currencyUnit?: string;
  /** 启用链接 */
  enableConnect?: boolean;
  /** 启用逐仓 */
  enableIsolated?: boolean;
  /** 强平后补偿后结余 */
  enableQphbcfjy?: boolean;
  /** 启用交易 */
  enableTrade?: boolean;
  /** 资金划转 */
  fundTransfer?: AccountPageFundTransferEnum;
  /** 组别 */
  groupCode?: string;
  /** 组名称 */
  groupName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 是否模拟 */
  isSimulate?: boolean;
  /** 启用交易 */
  isTrade?: boolean;
  /** 逐仓保证金 */
  isolatedMargin?: number;
  /**
   * 最近访问
   * @format date-time
   */
  lastVisitedTime?: string;
  /** 保证金 */
  margin?: number;
  /** Mint代币地址 */
  mintAddress?: string;
  /**
   * Mint代币小数位
   * @format int32
   */
  mintDecimals?: number;
  /** 余额 */
  money?: number;
  /** 名称 */
  name?: string;
  /** Solana网络别名 */
  networkAlias?: string;
  /** Solana网络RPC */
  networkRpc?: string;
  /** Solana网络WS */
  networkWs?: string;
  /** 订单模式 */
  orderMode?: AccountPageOrderModeEnum;
  /** PDA代币账户 */
  pdaTokenAddress?: string;
  /** 智能合约ID */
  programId?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountPageStatusEnum;
  /** 总盈亏 */
  totalProfit?: number;
  /** 账户类型 */
  type?: AccountPageTypeEnum;
  /** 用户登录账户 */
  userAccount?: string;
  /** 用户邮箱 */
  userEmail?: string;
  /** 用户名称 */
  userName?: string;
  /** 用户手机号 */
  userPhone?: string;
  /** 用户手机国际区号 */
  userPhoneAreaCode?: string;
}

/**
 * Account对象
 * 交易账户
 */
export interface Account {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 客户ID
   * @format int64
   */
  clientId?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 货币单位 */
  currencyUnit?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 启用交易 */
  isTrade?: boolean;
  /** 逐仓保证金 */
  isolatedMargin?: number;
  /**
   * 最近访问
   * @format date-time
   */
  lastVisitedTime?: string;
  /** 保证金 */
  margin?: number;
  /** 余额 */
  money?: number;
  /** 名称 */
  name?: string;
  /** PDA代币账户 */
  pdaTokenAddress?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: AccountStatusEnum;
  /** 账户类型 */
  type?: AccountTypeEnum;
}

/**
 * BagOrder对象
 * 持仓订单
 */
export interface BagOrder {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  accountId?: number;
  /** 交易账户名 */
  accountName?: string;
  /**
   * 追加预付款比例
   * @format int32
   */
  addAdvanceCharge?: number;
  /** 別名 */
  alias?: string;
  /** 订单方向 */
  buySell?: BagOrderBuySellEnum;
  /** 平仓价格 */
  closePrice?: number;
  /**
   * 强制平仓比例
   * @format int32
   */
  compelCloseRatio?: number;
  /** 配置 */
  conf?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 汇率 */
  exchangeRate?: string;
  /**
   * 完成时间
   * @format date-time
   */
  finishTime?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 图标 */
  imgUrl?: string;
  /** 库存费 */
  interestFees?: number;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 保证金类型 */
  marginType?: BagOrderMarginTypeEnum;
  /** 订单模式 */
  mode?: BagOrderModeEnum;
  /** 订单基础保证金 */
  orderBaseMargin?: number;
  /** 订单保证金 */
  orderMargin?: number;
  /** 订单数量 */
  orderVolume?: number;
  /** 持仓PDA地址 */
  pdaAddress?: string;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** 开仓价格 */
  startPrice?: number;
  /** 状态 */
  status?: BagOrderStatusEnum;
  /** 止损 */
  stopLoss?: number;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 交易品种 */
  symbol?: string;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /** 止盈 */
  takeProfit?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /** 用户登录账户 */
  userAccount?: string;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
  /** 用户名称 */
  userName?: string;
}

/**
 * BagOrder对象_1
 * 持仓订单
 */
export interface BagOrder1 {
  /** 用户信息 */
  accountDetail?: AccountPage;
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /** 订单方向 */
  buySell?: BagOrder1BuySellEnum;
  /** 平仓价格 */
  closePrice?: number;
  /** 配置 */
  conf?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 汇率 */
  exchangeRate?: string;
  /**
   * 完成时间
   * @format date-time
   */
  finishTime?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 库存费 */
  interestFees?: number;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 保证金类型 */
  marginType?: BagOrder1MarginTypeEnum;
  /** 订单模式 */
  mode?: BagOrder1ModeEnum;
  /** 订单基础保证金 */
  orderBaseMargin?: number;
  /** 订单保证金 */
  orderMargin?: number;
  /** 订单数量 */
  orderVolume?: number;
  /** 订单集合 */
  ordersInfo?: Orders2[];
  /** 持仓PDA地址 */
  pdaAddress?: string;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** 开仓价格 */
  startPrice?: number;
  /** 状态 */
  status?: BagOrder1StatusEnum;
  /** 止损 */
  stopLoss?: number;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 交易品种 */
  symbol?: string;
  /** 止盈 */
  takeProfit?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/**
 * DelayUser对象
 * 交易延迟用户记录
 */
export interface DelayUser {
  /** 账号 */
  account?: string;
  /**
   * 加入时间
   * @format date-time
   */
  addTime?: string;
  /** 邮箱 */
  email?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 手机 */
  phone?: string;
}

/**
 * Holiday对象
 * 假期日历
 */
export interface Holiday {
  /** 描述 */
  describeInfo?: string;
  /**
   * 结束时间
   * @format date-time
   */
  endTime: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 每年重复 */
  repeatYear: boolean;
  /**
   * 开始时间
   * @format date-time
   */
  startTime: string;
  /** 状态 */
  status: HolidayStatusEnum;
  /** 交易品种 */
  symbols: string;
}

/**
 * Holiday对象_1
 * 假期日历
 */
export interface Holiday1 {
  /** 描述 */
  describeInfo?: string;
  /**
   * 结束时间
   * @format date-time
   */
  endTime: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 每年重复 */
  repeatYear: boolean;
  /**
   * 开始时间
   * @format date-time
   */
  startTime: string;
  /** 状态 */
  status: Holiday1StatusEnum;
  /** 交易品种 */
  symbols: string;
}

/** IPage«AccountGroupSymbols对象» */
export interface IPageAccountGroupSymbols {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: AccountGroupSymbols1[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«AccountGroup对象» */
export interface IPageAccountGroup {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: AccountGroup[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«AccountManage对象» */
export interface IPageAccountManage {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: AccountManage1[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«AccountPage对象» */
export interface IPageAccountPage {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: AccountPage[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«BagOrder对象» */
export interface IPageBagOrder {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: BagOrder[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«DelayUser对象» */
export interface IPageDelayUser {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: DelayUser[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«Holiday对象» */
export interface IPageHoliday {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: Holiday1[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«LbPool对象» */
export interface IPageLbPool {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: LbPool[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«MoneyRecords对象» */
export interface IPageMoneyRecords {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: MoneyRecords[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«Orders对象» */
export interface IPageOrders {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: Orders[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«PoolManage对象» */
export interface IPagePoolManage {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: PoolManage[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«SharesRecord对象» */
export interface IPageSharesRecord {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: SharesRecord[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«Symbols对象» */
export interface IPageSymbols {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: Symbols[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«TradeRecords对象» */
export interface IPageTradeRecords {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: TradeRecords[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/**
 * LbPool对象
 * LB池
 */
export interface LbPool {
  /** 基础金额 */
  baseMoney?: number;
  /** 关联交易品种 */
  correlationSymbol?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** LB code */
  lbCode?: string;
  /** LB金额 */
  lbMoney?: number;
  /** LB名称 */
  lbName?: string;
  /** LB金库PDA地址 */
  lbPdaAddress?: string;
  /** LP金库地址 */
  lpAddress?: string;
  /** LP金库分成比例 */
  lpSharingRatio?: number;
  /** Mint代币地址 */
  mintAddress?: string;
  /** Solana网络RPC */
  networkRpc?: string;
  /** Solana网络WS */
  networkWs?: string;
  /** 智能合约ID */
  programId?: string;
  /** 协议金库地址 */
  protocolAddress?: string;
  /** 协议金库分成比例 */
  protocolSharingRatio?: number;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: LbPoolStatusEnum;
  /** 转移金额 */
  transferMoney?: number;
}

/** Map«string,boolean» */
export type MapStringBoolean = Record<string, boolean>;

/**
 * MoneyRecords对象
 * 资金变更记录
 */
export interface MoneyRecords {
  /**
   * 账户ID
   * @format int64
   */
  accountId?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** @format int64 */
  createTimeLong?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 金额 */
  money?: number;
  /** 新余额 */
  newBalance?: number;
  /** 旧余额 */
  oldBalance?: number;
  /** 操作人 */
  operationUser?: string;
  /** 订单号 */
  orderNo?: string;
  /** 备注 */
  remark?: string;
  /** TX签名 */
  signature?: string;
  /** 类型 */
  type?: MoneyRecordsTypeEnum;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/**
 * MoneyRecords对象_1
 * 资金变更记录
 */
export interface MoneyRecords1 {
  /**
   * 账户ID
   * @format int64
   */
  accountId?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** @format int64 */
  createTimeLong?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 金额 */
  money?: number;
  /** 新余额 */
  newBalance?: number;
  /** 旧余额 */
  oldBalance?: number;
  /** 操作人 */
  operationUser?: string;
  /** 订单号 */
  orderNo?: string;
  /** 备注 */
  remark?: string;
  /** TX签名 */
  signature?: string;
  /** 类型 */
  type?: MoneyRecords1TypeEnum;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/**
 * Orders对象
 * 订单
 */
export interface Orders {
  /**
   * 交易账户ID
   * @format int64
   */
  accountId?: number;
  /** 交易账户名 */
  accountName?: string;
  /** 別名 */
  alias?: string;
  /** 持仓ID */
  bagOrderIds?: string;
  /** 订单方向 */
  buySell?: OrdersBuySellEnum;
  /** 配置 */
  conf?: string;
  /** 创建原因 */
  createReason?: OrdersCreateReasonEnum;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 执行订单ID
   * @format int64
   */
  executeOrderId?: number;
  /**
   * 过期时间
   * @format date-time
   */
  expirationTime?: string;
  /**
   * 完成时间
   * @format date-time
   */
  finishTime?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 图标 */
  imgUrl?: string;
  /** 成交方向 */
  inOut?: OrdersInOutEnum;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 限价价格 */
  limitPrice?: number;
  /** 保证金类型 */
  marginType?: OrdersMarginTypeEnum;
  /** 订单模式 */
  mode?: OrdersModeEnum;
  /**
   * 操作员ID
   * @format int64
   */
  operatorId?: number;
  /** 订单保证金 */
  orderMargin?: number;
  /** 订单数量 */
  orderVolume?: number;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: OrdersStatusEnum;
  /** 止损 */
  stopLoss?: number;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 交易品种 */
  symbol?: string;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /** 止盈 */
  takeProfit?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /** 成交价格 */
  tradePrice?: number;
  /** 成交量 */
  tradingVolume?: number;
  /** 订单类型 */
  type?: OrdersTypeEnum;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /** 用户登录账户 */
  userAccount?: string;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
  /** 用户名称 */
  userName?: string;
}

/**
 * Orders对象_1
 * 订单
 */
export interface Orders1 {
  /** 持仓ID */
  bagOrderIds?: string;
  /** 订单方向 */
  buySell?: Orders1BuySellEnum;
  /** 配置 */
  conf?: string;
  /** 创建原因 */
  createReason?: Orders1CreateReasonEnum;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 执行订单ID
   * @format int64
   */
  executeOrderId?: number;
  /**
   * 过期时间
   * @format date-time
   */
  expirationTime?: string;
  /**
   * 完成时间
   * @format date-time
   */
  finishTime?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 成交方向 */
  inOut?: Orders1InOutEnum;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 限价价格 */
  limitPrice?: number;
  /** 保证金类型 */
  marginType?: Orders1MarginTypeEnum;
  /** 订单模式 */
  mode?: Orders1ModeEnum;
  /**
   * 操作员ID
   * @format int64
   */
  operatorId?: number;
  /** 订单保证金 */
  orderMargin?: number;
  /** 订单数量 */
  orderVolume?: number;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: Orders1StatusEnum;
  /** 止损 */
  stopLoss?: number;
  /** 交易品种 */
  symbol?: string;
  /** 止盈 */
  takeProfit?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /** 成交价格 */
  tradePrice?: number;
  /** 成交量 */
  tradingVolume?: number;
  /** 订单类型 */
  type?: Orders1TypeEnum;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/**
 * Orders对象_2
 * 订单
 */
export interface Orders2 {
  /** 用户信息 */
  accountDetail?: AccountPage;
  /** 持仓ID */
  bagOrderIds?: string;
  /** 订单方向 */
  buySell?: Orders2BuySellEnum;
  /** 配置 */
  conf?: string;
  /** 创建原因 */
  createReason?: Orders2CreateReasonEnum;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 执行订单ID
   * @format int64
   */
  executeOrderId?: number;
  /**
   * 过期时间
   * @format date-time
   */
  expirationTime?: string;
  /**
   * 完成时间
   * @format date-time
   */
  finishTime?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 成交方向 */
  inOut?: Orders2InOutEnum;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 限价价格 */
  limitPrice?: number;
  /** 保证金类型 */
  marginType?: Orders2MarginTypeEnum;
  /** 订单模式 */
  mode?: Orders2ModeEnum;
  /**
   * 操作员ID
   * @format int64
   */
  operatorId?: number;
  /** 订单保证金 */
  orderMargin?: number;
  /** 订单数量 */
  orderVolume?: number;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: Orders2StatusEnum;
  /** 止损 */
  stopLoss?: number;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 交易品种 */
  symbol?: string;
  /** 止盈 */
  takeProfit?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /** 成交价格 */
  tradePrice?: number;
  /** 成交记录集合 */
  tradeRecordsInfo?: TradeRecords1[];
  /** 成交量 */
  tradingVolume?: number;
  /** 订单类型 */
  type?: Orders2TypeEnum;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/**
 * PoolManage对象
 * 跟单池管理
 */
export interface PoolManage {
  /** 账户份额 */
  accountFollowShares?: AccountManage;
  /** APR */
  apr?: number;
  /** 管理员最小占比(%) */
  authorityMinProportion?: number;
  /** 管理员分润(%) */
  authorityProfitSharing?: number;
  /** 管理员份额 */
  authorityShares?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 跟单账户 */
  followAccount?: Account;
  /**
   * 跟单账户ID
   * @format int64
   */
  followAccountId?: number;
  /** 跟单池名称 */
  followPoolName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /**
   * 跟单账户ID
   * @format int64
   */
  mainAccountId?: number;
  /** 最大回撤 */
  maxDrawdown?: number;
  /** PDA地址 */
  pdaAddress?: string;
  /** 赎回是否平仓订单 */
  redeemCloseOrder?: boolean;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: PoolManageStatusEnum;
  /** 总交易额 */
  totalAmount?: number;
  /** 总盈亏 */
  totalProfit?: number;
  /** 总申购金额 */
  totalPurchaseMoney?: number;
  /** 总份额 */
  totalShares?: number;
}

/**
 * PoolManage对象_1
 * 跟单池管理
 */
export interface PoolManage1 {
  /** APR */
  apr?: number;
  /** 管理员最小占比(%) */
  authorityMinProportion?: number;
  /** 管理员分润(%) */
  authorityProfitSharing?: number;
  /** 管理员份额 */
  authorityShares?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 跟单账户ID
   * @format int64
   */
  followAccountId?: number;
  /** 跟单池名称 */
  followPoolName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /**
   * 跟单账户ID
   * @format int64
   */
  mainAccountId?: number;
  /** 最大回撤 */
  maxDrawdown?: number;
  /** PDA地址 */
  pdaAddress?: string;
  /** 赎回是否平仓订单 */
  redeemCloseOrder?: boolean;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: PoolManage1StatusEnum;
  /** 总交易额 */
  totalAmount?: number;
  /** 总盈亏 */
  totalProfit?: number;
  /** 总申购金额 */
  totalPurchaseMoney?: number;
  /** 总份额 */
  totalShares?: number;
}

/**
 * R«AccountGroup对象»
 * 返回信息
 */
export interface RAccountGroup {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: AccountGroup;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«AccountManage对象»
 * 返回信息
 */
export interface RAccountManage {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: AccountManage2;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«AccountPage对象»
 * 返回信息
 */
export interface RAccountPage {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: AccountPage;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«BagOrder对象»
 * 返回信息
 */
export interface RBagOrder {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: BagOrder1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Holiday对象»
 * 返回信息
 */
export interface RHoliday {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Holiday1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«AccountGroupSymbols对象»»
 * 返回信息
 */
export interface RIPageAccountGroupSymbols {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageAccountGroupSymbols;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«AccountGroup对象»»
 * 返回信息
 */
export interface RIPageAccountGroup {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageAccountGroup;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«AccountManage对象»»
 * 返回信息
 */
export interface RIPageAccountManage {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageAccountManage;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«AccountPage对象»»
 * 返回信息
 */
export interface RIPageAccountPage {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageAccountPage;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«BagOrder对象»»
 * 返回信息
 */
export interface RIPageBagOrder {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageBagOrder;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«DelayUser对象»»
 * 返回信息
 */
export interface RIPageDelayUser {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageDelayUser;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«Holiday对象»»
 * 返回信息
 */
export interface RIPageHoliday {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageHoliday;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«LbPool对象»»
 * 返回信息
 */
export interface RIPageLbPool {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageLbPool;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«MoneyRecords对象»»
 * 返回信息
 */
export interface RIPageMoneyRecords {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageMoneyRecords;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«Orders对象»»
 * 返回信息
 */
export interface RIPageOrders {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageOrders;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«PoolManage对象»»
 * 返回信息
 */
export interface RIPagePoolManage {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPagePoolManage;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«SharesRecord对象»»
 * 返回信息
 */
export interface RIPageSharesRecord {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageSharesRecord;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«Symbols对象»»
 * 返回信息
 */
export interface RIPageSymbols {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageSymbols;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«TradeRecords对象»»
 * 返回信息
 */
export interface RIPageTradeRecords {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageTradeRecords;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«JSONArray»
 * 返回信息
 */
export interface RJSONArray {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: object[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«JSONObject»
 * 返回信息
 */
export interface RJSONObject {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Record<string, object>;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«LbPool对象»
 * 返回信息
 */
export interface RLbPool {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: LbPool;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«AccountCountVO»»
 * 返回信息
 */
export interface RListAccountCountVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: AccountCountVO[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«AccountHighVO»»
 * 返回信息
 */
export interface RListAccountHighVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: AccountHighVO[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«OrderHighVO»»
 * 返回信息
 */
export interface RListOrderHighVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: OrderHighVO[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«SymbolGroup对象»»
 * 返回信息
 */
export interface RListSymbolGroup {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: SymbolGroup1[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«Symbols对象»»
 * 返回信息
 */
export interface RListSymbols {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Symbols[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«Symbols对象»»_1
 * 返回信息
 */
export interface RListSymbols1 {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Symbols1[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«TwrRecordVO»»
 * 返回信息
 */
export interface RListTwrRecordVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: TwrRecordVO[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Map«string,boolean»»
 * 返回信息
 */
export interface RMapStringBoolean {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Record<string, boolean>;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«MoneyRecords对象»
 * 返回信息
 */
export interface RMoneyRecords {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: MoneyRecords1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Orders对象»
 * 返回信息
 */
export interface ROrders {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Orders1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Orders对象»_1
 * 返回信息
 */
export interface ROrders1 {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Orders2;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«PoolManage对象»
 * 返回信息
 */
export interface RPoolManage {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: PoolManage;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Set«object»»
 * 返回信息
 */
export interface RSetObject {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: object[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«SymbolConf对象»
 * 返回信息
 */
export interface RSymbolConf {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: SymbolConf1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Symbols对象»
 * 返回信息
 */
export interface RSymbols {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Symbols1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Symbols对象»_1
 * 返回信息
 */
export interface RSymbols1 {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Symbols;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«bigdecimal»
 * 返回信息
 */
export interface RBigdecimal {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: number;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«boolean»
 * 返回信息
 */
export interface RBoolean {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: boolean;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«string»
 * 返回信息
 */
export interface RString {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: string;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«系统设置»
 * 返回信息
 */
export interface R_ {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: _6;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * SharesRecord对象
 * 跟单份额记录
 */
export interface SharesRecord {
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 当前份额单价 */
  currentSharePrice?: number;
  /**
   * 跟单账户ID
   * @format int64
   */
  followAccountId?: number;
  /**
   * 跟单管理ID
   * @format int64
   */
  followManageId?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 金额 */
  moneyAmount?: number;
  /** 新份额 */
  newShares?: number;
  /** 旧份额 */
  oldShares?: number;
  /** 盈亏 */
  profit?: number;
  /** 分润金额 */
  profitSharing?: number;
  /** 用户申购份额单价 */
  purchaseSharePrice?: number;
  /** 备注 */
  remark?: string;
  /** 份额 */
  sharesAmount?: number;
  /** 交易签名 */
  signature?: string;
  /** 状态 */
  status?: SharesRecordStatusEnum;
  /** 总份额 */
  totalShares?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 记录类型 */
  type?: SharesRecordTypeEnum;
}

/**
 * SymbolConf对象
 * 交易品种配置
 */
export interface SymbolConf {
  /** 货币-基础货币 */
  baseCurrency?: string;
  /**
   * 货币-基础货币小数位
   * @format int32
   */
  baseCurrencyDecimal?: number;
  /** 交易-计算类型 */
  calculationType?: SymbolConfCalculationTypeEnum;
  /**
   * 交易-合约大小
   * @format int32
   */
  contractSize?: number;
  /**
   * 常规-市场深度
   * @format int32
   */
  depthOfMarket?: number;
  /** 启用库存费 */
  enableHoldingCost?: boolean;
  /** 交易-GTC */
  gtc?: SymbolConfGtcEnum;
  /** 库存费配置（JSON）{"isEnable":true,"isHoliday":true,"type":"percentage","buyBag":100,"sellBag":100,"days":10,"multiplier":{"MONDAY":1,"TUESDAY":1,"WEDNESDAY":1,"THURSDAY":1,"FRIDAY":1,"SATURDAY":1,"SUNDAY":1}} */
  holdingCostConf?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /**
   * 交易-限价和停损级别
   * @format int32
   */
  limitStopLevel?: number;
  /** 交易量-最大单量 */
  maxTrade?: number;
  /** 交易量-最小单量 */
  minTrade?: number;
  /** 交易量-最大名义价值 */
  nominalValue?: number;
  /** 交易-订单类型 */
  orderType?: string;
  /** 预付款配置（JSON）{"mode":"fixed_margin","fixed_margin":{"initial_margin":1000,"locked_position_margin":2000,"is_unilateral":true},"fixed_leverage":{"leverage_multiple":100,"is_unilateral":true},"float_leverage":{"type":"volume/nominal","min_lever":1,"max_lever":100,"is_unilateral":true,"lever_grade":[{"lever_start_value":1,"lever_end_value":50,"bag_nominal_value":10000},{"lever_start_value":51,"lever_end_value":80,"bag_nominal_value":20000},{"lever_start_value":81,"lever_end_value":100,"bag_nominal_value":30000}]}} */
  prepaymentConf?: string;
  /** 货币-预付款货币 */
  prepaymentCurrency?: string;
  /**
   * 货币-预付款货币小数位
   * @format int32
   */
  prepaymentCurrencyDecimal?: number;
  /** 货币-盈利货币 */
  profitCurrency?: string;
  /**
   * 货币-盈利货币小数位
   * @format int32
   */
  profitCurrencyDecimal?: number;
  /** 报价配置（JSON）{"ordinary":0,"filterNum":1,"discard":0,"minSpread":0,"maxSpread":0} */
  quotationConf?: string;
  /**
   * 交易-最高报价延迟
   * @format int32
   */
  quotationDelay?: number;
  /** 交易-报价大小 */
  quotationSize?: number;
  /** 常规-点差配置（JSON）{"type":"fixed"，"fixed":{"buy":10,"sell":10},"float":{"buy":11,"sell":12}} */
  spreadConf?: string;
  /** 交易-交易许可 */
  tradeLicense?: SymbolConfTradeLicenseEnum;
  /** 交易量-限制 */
  tradeLimit?: number;
  /** 交易量-步长 */
  tradeStep?: number;
  /** 交易时间（JSON）{"MONDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"TUESDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"WEDNESDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"THURSDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"FRIDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"SATURDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"SUNDAY":{"isAlone":true,"price":[{"start":"07:00","end":"23:59"}],"trade":[{"start":"07:00","end":"23:59"}]},} */
  tradeTimeConf?: string;
  /** 手续费配置（JSON）{"type":"trade_vol""trade_vol":[{"from":0,"to":10,"compute_mode":"currency","market_fee":10,"limit_fee":10,"min_value":0,"max_value":10}],"trade_hand":[{"from":0,"to":10,"compute_mode":"percentage","market_fee":10,"limit_fee":10,"min_value":0,"max_value":10}]} */
  transactionFeeConf?: string;
}

/**
 * SymbolConf对象_1
 * 交易品种配置
 */
export interface SymbolConf1 {
  /** 货币-基础货币 */
  baseCurrency?: string;
  /**
   * 货币-基础货币小数位
   * @format int32
   */
  baseCurrencyDecimal?: number;
  /** 交易-计算类型 */
  calculationType?: SymbolConf1CalculationTypeEnum;
  /**
   * 交易-合约大小
   * @format int32
   */
  contractSize?: number;
  /**
   * 常规-市场深度
   * @format int32
   */
  depthOfMarket?: number;
  /** 启用库存费 */
  enableHoldingCost?: boolean;
  /** 交易-GTC */
  gtc?: SymbolConf1GtcEnum;
  /** 库存费配置（JSON）{"isEnable":true,"isHoliday":true,"type":"percentage","buyBag":100,"sellBag":100,"days":10,"multiplier":{"MONDAY":1,"TUESDAY":1,"WEDNESDAY":1,"THURSDAY":1,"FRIDAY":1,"SATURDAY":1,"SUNDAY":1}} */
  holdingCostConf?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /**
   * 交易-限价和停损级别
   * @format int32
   */
  limitStopLevel?: number;
  /** 交易量-最大单量 */
  maxTrade?: number;
  /** 交易量-最小单量 */
  minTrade?: number;
  /** 交易量-最大名义价值 */
  nominalValue?: number;
  /** 交易-订单类型 */
  orderType?: string;
  /** 预付款配置（JSON）{"mode":"fixed_margin","fixed_margin":{"initial_margin":1000,"locked_position_margin":2000,"is_unilateral":true},"fixed_leverage":{"leverage_multiple":100,"is_unilateral":true},"float_leverage":{"type":"volume/nominal","min_lever":1,"max_lever":100,"is_unilateral":true,"lever_grade":[{"lever_start_value":1,"lever_end_value":50,"bag_nominal_value":10000},{"lever_start_value":51,"lever_end_value":80,"bag_nominal_value":20000},{"lever_start_value":81,"lever_end_value":100,"bag_nominal_value":30000}]}} */
  prepaymentConf?: string;
  /** 货币-预付款货币 */
  prepaymentCurrency?: string;
  /**
   * 货币-预付款货币小数位
   * @format int32
   */
  prepaymentCurrencyDecimal?: number;
  /** 货币-盈利货币 */
  profitCurrency?: string;
  /**
   * 货币-盈利货币小数位
   * @format int32
   */
  profitCurrencyDecimal?: number;
  /** 报价配置（JSON）{"ordinary":0,"filterNum":1,"discard":0,"minSpread":0,"maxSpread":0} */
  quotationConf?: string;
  /**
   * 交易-最高报价延迟
   * @format int32
   */
  quotationDelay?: number;
  /** 交易-报价大小 */
  quotationSize?: number;
  /** 常规-点差配置（JSON）{"type":"fixed"，"fixed":{"buy":10,"sell":10},"float":{"buy":11,"sell":12}} */
  spreadConf?: string;
  /** 交易-交易许可 */
  tradeLicense?: SymbolConf1TradeLicenseEnum;
  /** 交易量-限制 */
  tradeLimit?: number;
  /** 交易量-步长 */
  tradeStep?: number;
  /** 交易时间（JSON）{"MONDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"TUESDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"WEDNESDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"THURSDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"FRIDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"SATURDAY":{"isAlone":true,"price":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}],"trade":[{"start":"00:00","end":"04:55"},{"start":"06:00","end":"23:59"}]},"SUNDAY":{"isAlone":true,"price":[{"start":"07:00","end":"23:59"}],"trade":[{"start":"07:00","end":"23:59"}]},} */
  tradeTimeConf?: string;
  /** 手续费配置（JSON）{"type":"trade_vol""trade_vol":[{"from":0,"to":10,"compute_mode":"currency","market_fee":10,"limit_fee":10,"min_value":0,"max_value":10}],"trade_hand":[{"from":0,"to":10,"compute_mode":"percentage","market_fee":10,"limit_fee":10,"min_value":0,"max_value":10}]} */
  transactionFeeConf?: string;
}

/**
 * SymbolGroup对象
 * 交易品种组
 */
export interface SymbolGroup {
  /**
   * 组名称
   * @minLength 0
   * @maxLength 100
   */
  groupName: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /**
   * 父级ID
   * @format int64
   */
  parentId?: number;
  /** 备注 */
  remark?: string;
}

/**
 * SymbolGroup对象_1
 * 交易品种组
 */
export interface SymbolGroup1 {
  children?: SymbolGroup1[];
  /**
   * 组名称
   * @minLength 0
   * @maxLength 100
   */
  groupName: string;
  hasChildren?: boolean;
  /** @format int64 */
  id?: number;
  /** @format int64 */
  parentId?: number;
  parentName?: string;
  /** 备注 */
  remark?: string;
}

/**
 * Symbols对象
 * 交易品种
 */
export interface Symbols {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /** 别名 */
  alias?: string;
  /** 分类 */
  classify?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 图标 */
  imgUrl?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: SymbolsStatusEnum;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 品种名称 */
  symbol?: string;
  /** 品种配置 */
  symbolConf?: SymbolConf;
  /**
   * 品种组配置ID
   * @format int64
   */
  symbolConfId?: number;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /**
   * 品种组ID
   * @format int64
   */
  symbolGroupId?: number;
  /** 最新行情 */
  symbolNewPrice?: Record<string, object>;
  /** 最新Ticker */
  symbolNewTicker?: Ticker;
}

/**
 * Symbols对象_1
 * 交易品种
 */
export interface Symbols1 {
  /** 别名 */
  alias?: string;
  /** 分类 */
  classify?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 图标 */
  imgUrl?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: Symbols1StatusEnum;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 品种名称 */
  symbol?: string;
  /**
   * 品种组配置ID
   * @format int64
   */
  symbolConfId?: number;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /**
   * 品种组ID
   * @format int64
   */
  symbolGroupId?: number;
}

/**
 * TradeRecords对象
 * 成交记录
 */
export interface TradeRecords {
  /**
   * 交易账户ID
   * @format int64
   */
  accountId?: number;
  /** 交易账户名 */
  accountName?: string;
  /** 別名 */
  alias?: string;
  /**
   * 持仓订单ID
   * @format int64
   */
  bagOrderId?: number;
  /** 订单方向 */
  buySell?: TradeRecordsBuySellEnum;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 汇率 */
  exchangeRate?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 图标 */
  imgUrl?: string;
  /** 成交方向 */
  inOut?: TradeRecordsInOutEnum;
  /** 库存费 */
  interestFees?: number;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 保证金类型 */
  marginType?: TradeRecordsMarginTypeEnum;
  /** 订单模式 */
  mode?: TradeRecordsModeEnum;
  /**
   * 订单ID
   * @format int64
   */
  orderId?: number;
  /** 价格id */
  priceValueId?: string;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** TX签名 */
  signature?: string;
  /** 开仓价格 */
  startPrice?: number;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 交易品种 */
  symbol?: string;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /** 成交价格 */
  tradePrice?: number;
  /** 成交量 */
  tradingVolume?: number;
  /** 用户登录账户 */
  userAccount?: string;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
  /** 用户名称 */
  userName?: string;
}

/**
 * TradeRecords对象_1
 * 成交记录
 */
export interface TradeRecords1 {
  /**
   * 持仓订单ID
   * @format int64
   */
  bagOrderId?: number;
  /** 订单方向 */
  buySell?: TradeRecords1BuySellEnum;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /** 汇率 */
  exchangeRate?: string;
  /** 手续费 */
  handlingFees?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 成交方向 */
  inOut?: TradeRecords1InOutEnum;
  /** 库存费 */
  interestFees?: number;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 订单模式 */
  mode?: TradeRecords1ModeEnum;
  /**
   * 订单ID
   * @format int64
   */
  orderId?: number;
  /** 价格id */
  priceValueId?: string;
  /** 盈亏 */
  profit?: number;
  /** 备注 */
  remark?: string;
  /** TX签名 */
  signature?: string;
  /** 开仓价格 */
  startPrice?: number;
  /** 交易品种 */
  symbol?: string;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId?: number;
  /** 交易额 */
  tradeAmount?: number;
  /** 成交价格 */
  tradePrice?: number;
  /** 成交量 */
  tradingVolume?: number;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/**
 * 产品最新Ticker数据
 * 产品最新Ticker数据
 */
export interface Ticker {
  /** 最新价 */
  close?: number;
  /** 最高价 */
  high?: number;
  /** 最低价 */
  low?: number;
  /** 开盘价 */
  open?: number;
  /** 交易品种 */
  symbol?: string;
  /**
   * 响应生成时间点
   * @format int64
   */
  time?: number;
}

/**
 * 修改品种
 * 修改品种
 */
export interface _ {
  /** 别名 */
  alias?: string;
  /** 货币-基础货币 */
  baseCurrency?: string;
  /**
   * 货币-基础货币小数位
   * @format int32
   */
  baseCurrencyDecimal?: number;
  /** 交易-计算类型 */
  calculationType?: CalculationTypeEnum;
  /** 分类 */
  classify?: string;
  /**
   * 交易-合约大小
   * @format int32
   */
  contractSize?: number;
  /**
   * 常规-市场深度
   * @format int32
   */
  depthOfMarket?: number;
  /** 启用库存费 */
  enableHoldingCost?: boolean;
  /** 交易-GTC */
  gtc?: GtcEnum;
  /** 库存费配置（JSON） */
  holdingCostConf?: string;
  /**
   * 品种主键
   * @format int64
   */
  id?: number;
  /** 图标 */
  imgUrl?: string;
  /**
   * 交易-限价和停损级别
   * @format int32
   */
  limitStopLevel?: number;
  /** 交易量-最大单量 */
  maxTrade?: number;
  /** 交易量-最小单量 */
  minTrade?: number;
  /** 交易量-最大名义价值 */
  nominalValue?: number;
  /** 交易-订单类型 */
  orderType?: string;
  /** 预付款配置（JSON） */
  prepaymentConf?: string;
  /** 货币-预付款货币 */
  prepaymentCurrency?: string;
  /**
   * 货币-预付款货币小数位
   * @format int32
   */
  prepaymentCurrencyDecimal?: number;
  /** 货币-盈利货币 */
  profitCurrency?: string;
  /**
   * 货币-盈利货币小数位
   * @format int32
   */
  profitCurrencyDecimal?: number;
  /** 报价配置（JSON） */
  quotationConf?: string;
  /**
   * 交易-最高报价延迟
   * @format int32
   */
  quotationDelay?: number;
  /** 交易-报价大小 */
  quotationSize?: number;
  /** 备注 */
  remark?: string;
  /** 常规-点差配置（JSON） */
  spreadConf?: string;
  /** 状态 */
  status?: StatusEnum;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 品种名称 */
  symbol: string;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /**
   * 品种组ID
   * @format int64
   */
  symbolGroupId?: number;
  /** 交易-交易方向 */
  tradeBuySell?: TradeBuySellEnum;
  /** 交易-交易许可 */
  tradeLicense?: TradeLicenseEnum;
  /** 交易量-限制 */
  tradeLimit?: number;
  /** 交易量-步长 */
  tradeStep?: number;
  /** 交易时间（JSON） */
  tradeTimeConf?: string;
  /** 手续费配置（JSON） */
  transactionFeeConf?: string;
}

/**
 * 修改委托订单
 * 修改委托订单
 */
export interface _2 {
  /** 限价价格 */
  limitPrice?: number;
  /**
   * 委托订单号
   * @format int64
   */
  orderId?: number;
  /** 订单数量 */
  orderVolume?: number;
  /** 止损 */
  stopLoss?: number;
  /** 止盈 */
  takeProfit?: number;
}

/**
 * 修改持仓单止盈止损
 * 修改持仓单止盈止损
 */
export interface _3 {
  /**
   * 持仓订单号
   * @format int64
   */
  bagOrderId?: number;
  /** 止损 */
  stopLoss?: number;
  /** 止盈 */
  takeProfit?: number;
}

/**
 * 创建品种
 * 创建品种
 */
export interface _4 {
  /** 别名 */
  alias?: string;
  /** 货币-基础货币 */
  baseCurrency?: string;
  /**
   * 货币-基础货币小数位
   * @format int32
   */
  baseCurrencyDecimal?: number;
  /** 交易-计算类型 */
  calculationType?: Type4CalculationTypeEnum;
  /** 分类 */
  classify?: string;
  /**
   * 交易-合约大小
   * @format int32
   */
  contractSize?: number;
  /**
   * 常规-市场深度
   * @format int32
   */
  depthOfMarket?: number;
  /** 启用库存费 */
  enableHoldingCost?: boolean;
  /** 交易-GTC */
  gtc?: Type4GtcEnum;
  /** 库存费配置（JSON） */
  holdingCostConf?: string;
  /** 图标 */
  imgUrl?: string;
  /**
   * 交易-限价和停损级别
   * @format int32
   */
  limitStopLevel?: number;
  /** 交易量-最大单量 */
  maxTrade?: number;
  /** 交易量-最小单量 */
  minTrade?: number;
  /** 交易量-最大名义价值 */
  nominalValue?: number;
  /** 交易-订单类型 */
  orderType?: string;
  /** 预付款配置（JSON） */
  prepaymentConf?: string;
  /** 货币-预付款货币 */
  prepaymentCurrency?: string;
  /**
   * 货币-预付款货币小数位
   * @format int32
   */
  prepaymentCurrencyDecimal?: number;
  /** 货币-盈利货币 */
  profitCurrency?: string;
  /**
   * 货币-盈利货币小数位
   * @format int32
   */
  profitCurrencyDecimal?: number;
  /** 报价配置（JSON） */
  quotationConf?: string;
  /**
   * 交易-最高报价延迟
   * @format int32
   */
  quotationDelay?: number;
  /** 交易-报价大小 */
  quotationSize?: number;
  /** 备注 */
  remark?: string;
  /** 常规-点差配置（JSON） */
  spreadConf?: string;
  /** 状态 */
  status?: Type4StatusEnum;
  /** 订阅Symbol */
  subSymbol?: string;
  /** 品种名称 */
  symbol: string;
  /**
   * 品种小数位
   * @format int32
   */
  symbolDecimal?: number;
  /**
   * 品种组ID
   * @format int64
   */
  symbolGroupId: number;
  /** 交易-交易方向 */
  tradeBuySell?: Type4TradeBuySellEnum;
  /** 交易-交易许可 */
  tradeLicense?: Type4TradeLicenseEnum;
  /** 交易量-限制 */
  tradeLimit?: number;
  /** 交易量-步长 */
  tradeStep?: number;
  /** 交易时间（JSON） */
  tradeTimeConf?: string;
  /** 手续费配置（JSON） */
  transactionFeeConf?: string;
}

/**
 * 创建订单
 * 创建订单
 */
export interface _5 {
  /** 订单方向 */
  buySell: Type5BuySellEnum;
  /** 创建原因 */
  createReason?: Type5CreateReasonEnum;
  /**
   * 携带持仓订单号则为平仓单，只需要传递持仓单号、交易账户ID、订单数量、订单类型和反向订单方向，其他参数无效
   * @format int64
   */
  executeOrderId?: number;
  /**
   * 杠杆倍数
   * @format int32
   */
  leverageMultiple?: number;
  /** 限价价格 */
  limitPrice?: number;
  /** 保证金类型 */
  marginType: Type5MarginTypeEnum;
  /** 订单数量 */
  orderVolume: number;
  /** 止损 */
  stopLoss?: number;
  /** 交易品种 */
  symbol: string;
  /** 止盈 */
  takeProfit?: number;
  /**
   * 交易账户ID
   * @format int64
   */
  tradeAccountId: number;
  /** 订单类型 */
  type: Type5TypeEnum;
}

/**
 * 系统设置
 * 系统设置
 */
export interface _6 {
  /** 日结 */
  daily: string;
  /** 启用夏令时 */
  daylightTime: string;
  /** 交易系统时区 */
  timeZone: string;
}

/**
 * 订单提取保证金
 * 订单提取保证金
 */
export interface _7 {
  /**
   * 持仓订单号
   * @format int64
   */
  bagOrderId: number;
  /** 提取保证金 */
  extractMargin: number;
}

/**
 * 订单追加保证金
 * 订单追加保证金
 */
export interface _8 {
  /** 追加保证金 */
  addMargin: number;
  /**
   * 持仓订单号
   * @format int64
   */
  bagOrderId: number;
}

/**
 * 账户组品种配置
 * 账户组品种配置
 */
export interface _9 {
  /**
   * 交易账户组关联产品主键
   * @format int64
   */
  accountGroupSymbolsId: number;
  /** 货币-基础货币 */
  baseCurrency?: string;
  /**
   * 货币-基础货币小数位
   * @format int32
   */
  baseCurrencyDecimal?: number;
  /** 交易-计算类型 */
  calculationType?: Type9CalculationTypeEnum;
  /**
   * 交易-合约大小
   * @format int32
   */
  contractSize?: number;
  /**
   * 常规-市场深度
   * @format int32
   */
  depthOfMarket?: number;
  /** 启用库存费 */
  enableHoldingCost?: boolean;
  /** 交易-GTC */
  gtc?: Type9GtcEnum;
  /** 库存费配置（JSON） */
  holdingCostConf?: string;
  /**
   * 品种配置主键
   * @format int64
   */
  id?: number;
  /**
   * 交易-限价和停损级别
   * @format int32
   */
  limitStopLevel?: number;
  /** 交易量-最大单量 */
  maxTrade?: number;
  /** 交易量-最小单量 */
  minTrade?: number;
  /** 交易量-最大名义价值 */
  nominalValue?: number;
  /** 预付款配置（JSON） */
  prepaymentConf?: string;
  /** 货币-预付款货币 */
  prepaymentCurrency?: string;
  /**
   * 货币-预付款货币小数位
   * @format int32
   */
  prepaymentCurrencyDecimal?: number;
  /** 货币-盈利货币 */
  profitCurrency?: string;
  /**
   * 货币-盈利货币小数位
   * @format int32
   */
  profitCurrencyDecimal?: number;
  /** 报价配置（JSON） */
  quotationConf?: string;
  /**
   * 交易-最高报价延迟
   * @format int32
   */
  quotationDelay?: number;
  /** 常规-点差配置（JSON） */
  spreadConf?: string;
  /** 交易-交易方向 */
  tradeBuySell?: Type9TradeBuySellEnum;
  /** 交易-交易许可 */
  tradeLicense?: Type9TradeLicenseEnum;
  /** 交易量-限制 */
  tradeLimit?: number;
  /** 交易量-步长 */
  tradeStep?: number;
  /** 交易时间（JSON） */
  tradeTimeConf?: string;
  /** 手续费配置（JSON） */
  transactionFeeConf?: string;
}

/** 资金划转 */
export type AccountGroupSaveVoFundTransferEnum = "ALLOWABLE" | "PROHIBIT";

/** 订单模式 */
export type AccountGroupSaveVoOrderModeEnum = "NETTING" | "LOCKED_POSITION";

/** 可用预付款 */
export type AccountGroupSaveVoUsableAdvanceChargeEnum =
  | "NOT_PROFIT_LOSS"
  | "PROFIT_LOSS";

/** 状态 */
export type AccountUpdateVoStatusEnum = "DISABLED" | "ENABLE";

/** 类型 */
export type HandRechargeVoTypeEnum =
  | "DEPOSIT"
  | "ACTIVITY"
  | "DEPOSIT_SIMULATE"
  | "WITHDRAWAL"
  | "MARGIN"
  | "PROFIT"
  | "HANDLING_FEES"
  | "INTEREST_FEES"
  | "GIFT"
  | "TRANSFER"
  | "FOLLOW_INITIAL"
  | "FOLLOW_PURCHASE"
  | "FOLLOW_REDEEM"
  | "FOLLOW_PROFIT_SHARING"
  | "FOLLOW_VAULT_DIVVY"
  | "FOLLOW_CLOSE"
  | "BACK"
  | "ZERO"
  | "BALANCE";

/** 状态 */
export type AccountGroupSymbolsStatusEnum = "ENABLE" | "DISABLED";

/** 状态 */
export type AccountGroupSymbols1StatusEnum = "ENABLE" | "DISABLED";

/** 资金划转 */
export type AccountGroupFundTransferEnum = "ALLOWABLE" | "PROHIBIT";

/** 订单模式 */
export type AccountGroupOrderModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type AccountGroupStatusEnum = "ENABLE" | "DISABLED";

/** 可用预付款 */
export type AccountGroupUsableAdvanceChargeEnum =
  | "NOT_PROFIT_LOSS"
  | "PROFIT_LOSS";

/** 状态 */
export type AccountManageStatusEnum = "NORMAL" | "CANCEL";

/** 状态 */
export type AccountManage1StatusEnum = "NORMAL" | "CANCEL";

/** 状态 */
export type AccountManage2StatusEnum = "NORMAL" | "CANCEL";

/** 资金划转 */
export type AccountPageFundTransferEnum = "ALLOWABLE" | "PROHIBIT";

/** 订单模式 */
export type AccountPageOrderModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type AccountPageStatusEnum = "DISABLED" | "ENABLE";

/** 账户类型 */
export type AccountPageTypeEnum = "MAIN" | "SIMULATE" | "FOLLOW";

/** 状态 */
export type AccountStatusEnum = "DISABLED" | "ENABLE";

/** 账户类型 */
export type AccountTypeEnum = "MAIN" | "SIMULATE" | "FOLLOW";

/** 订单方向 */
export type BagOrderBuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 保证金类型 */
export type BagOrderMarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单模式 */
export type BagOrderModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type BagOrderStatusEnum = "BAG" | "FINISH";

/** 订单方向 */
export type BagOrder1BuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 保证金类型 */
export type BagOrder1MarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单模式 */
export type BagOrder1ModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type BagOrder1StatusEnum = "BAG" | "FINISH";

/** 状态 */
export type HolidayStatusEnum = "ENABLE" | "DISABLED";

/** 状态 */
export type Holiday1StatusEnum = "ENABLE" | "DISABLED";

/** 状态 */
export type LbPoolStatusEnum = "INIT" | "NORMAL" | "PAUSE" | "CLOSE";

/** 类型 */
export type MoneyRecordsTypeEnum =
  | "DEPOSIT"
  | "ACTIVITY"
  | "DEPOSIT_SIMULATE"
  | "WITHDRAWAL"
  | "MARGIN"
  | "PROFIT"
  | "HANDLING_FEES"
  | "INTEREST_FEES"
  | "GIFT"
  | "TRANSFER"
  | "FOLLOW_INITIAL"
  | "FOLLOW_PURCHASE"
  | "FOLLOW_REDEEM"
  | "FOLLOW_PROFIT_SHARING"
  | "FOLLOW_VAULT_DIVVY"
  | "FOLLOW_CLOSE"
  | "BACK"
  | "ZERO"
  | "BALANCE";

/** 类型 */
export type MoneyRecords1TypeEnum =
  | "DEPOSIT"
  | "ACTIVITY"
  | "DEPOSIT_SIMULATE"
  | "WITHDRAWAL"
  | "MARGIN"
  | "PROFIT"
  | "HANDLING_FEES"
  | "INTEREST_FEES"
  | "GIFT"
  | "TRANSFER"
  | "FOLLOW_INITIAL"
  | "FOLLOW_PURCHASE"
  | "FOLLOW_REDEEM"
  | "FOLLOW_PROFIT_SHARING"
  | "FOLLOW_VAULT_DIVVY"
  | "FOLLOW_CLOSE"
  | "BACK"
  | "ZERO"
  | "BALANCE";

/** 订单方向 */
export type OrdersBuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 创建原因 */
export type OrdersCreateReasonEnum =
  | "CLIENT"
  | "MANAGER"
  | "DEALER"
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "STOP_OUT"
  | "FOLLOW_REDEEM"
  | "SYSTEM";

/** 成交方向 */
export type OrdersInOutEnum = "IN" | "OUT" | "IN_OUT";

/** 保证金类型 */
export type OrdersMarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单模式 */
export type OrdersModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type OrdersStatusEnum = "FINISH" | "ENTRUST" | "CANCEL" | "FAIL";

/** 订单类型 */
export type OrdersTypeEnum =
  | "MARKET_ORDER"
  | "STOP_LOSS_ORDER"
  | "TAKE_PROFIT_ORDER"
  | "LIMIT_BUY_ORDER"
  | "LIMIT_SELL_ORDER"
  | "STOP_LOSS_LIMIT_BUY_ORDER"
  | "STOP_LOSS_LIMIT_SELL_ORDER"
  | "STOP_LOSS_MARKET_BUY_ORDER"
  | "STOP_LOSS_MARKET_SELL_ORDER";

/** 订单方向 */
export type Orders1BuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 创建原因 */
export type Orders1CreateReasonEnum =
  | "CLIENT"
  | "MANAGER"
  | "DEALER"
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "STOP_OUT"
  | "FOLLOW_REDEEM"
  | "SYSTEM";

/** 成交方向 */
export type Orders1InOutEnum = "IN" | "OUT" | "IN_OUT";

/** 保证金类型 */
export type Orders1MarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单模式 */
export type Orders1ModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type Orders1StatusEnum = "FINISH" | "ENTRUST" | "CANCEL" | "FAIL";

/** 订单类型 */
export type Orders1TypeEnum =
  | "MARKET_ORDER"
  | "STOP_LOSS_ORDER"
  | "TAKE_PROFIT_ORDER"
  | "LIMIT_BUY_ORDER"
  | "LIMIT_SELL_ORDER"
  | "STOP_LOSS_LIMIT_BUY_ORDER"
  | "STOP_LOSS_LIMIT_SELL_ORDER"
  | "STOP_LOSS_MARKET_BUY_ORDER"
  | "STOP_LOSS_MARKET_SELL_ORDER";

/** 订单方向 */
export type Orders2BuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 创建原因 */
export type Orders2CreateReasonEnum =
  | "CLIENT"
  | "MANAGER"
  | "DEALER"
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "STOP_OUT"
  | "FOLLOW_REDEEM"
  | "SYSTEM";

/** 成交方向 */
export type Orders2InOutEnum = "IN" | "OUT" | "IN_OUT";

/** 保证金类型 */
export type Orders2MarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单模式 */
export type Orders2ModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type Orders2StatusEnum = "FINISH" | "ENTRUST" | "CANCEL" | "FAIL";

/** 订单类型 */
export type Orders2TypeEnum =
  | "MARKET_ORDER"
  | "STOP_LOSS_ORDER"
  | "TAKE_PROFIT_ORDER"
  | "LIMIT_BUY_ORDER"
  | "LIMIT_SELL_ORDER"
  | "STOP_LOSS_LIMIT_BUY_ORDER"
  | "STOP_LOSS_LIMIT_SELL_ORDER"
  | "STOP_LOSS_MARKET_BUY_ORDER"
  | "STOP_LOSS_MARKET_SELL_ORDER";

/** 状态 */
export type PoolManageStatusEnum = "INIT" | "NORMAL" | "PAUSE" | "CLOSE";

/** 状态 */
export type PoolManage1StatusEnum = "INIT" | "NORMAL" | "PAUSE" | "CLOSE";

/** 状态 */
export type SharesRecordStatusEnum =
  | "INITIALIZE"
  | "FIRST_CLOSE_ORDER"
  | "AGAIN_CLOSE_ORDER"
  | "SUCCESS"
  | "FAIL";

/** 记录类型 */
export type SharesRecordTypeEnum =
  | "INITIALIZE"
  | "PURCHASE_SHARES"
  | "REDEEM_SHARES"
  | "DIVVY"
  | "CLOSE";

/** 交易-计算类型 */
export type SymbolConfCalculationTypeEnum = "FOREIGN_CURRENCY" | "CFD";

/** 交易-GTC */
export type SymbolConfGtcEnum = "DAY_VALID" | "DAY_VALID_NOT" | "CLIENT_CANCEL";

/** 交易-交易许可 */
export type SymbolConfTradeLicenseEnum =
  | "ENABLE"
  | "DISABLED"
  | "ONLY_BUY"
  | "ONLY_SELL"
  | "ONLY_CLOSE";

/** 交易-计算类型 */
export type SymbolConf1CalculationTypeEnum = "FOREIGN_CURRENCY" | "CFD";

/** 交易-GTC */
export type SymbolConf1GtcEnum =
  | "DAY_VALID"
  | "DAY_VALID_NOT"
  | "CLIENT_CANCEL";

/** 交易-交易许可 */
export type SymbolConf1TradeLicenseEnum =
  | "ENABLE"
  | "DISABLED"
  | "ONLY_BUY"
  | "ONLY_SELL"
  | "ONLY_CLOSE";

/** 状态 */
export type SymbolsStatusEnum = "ENABLE" | "DISABLED";

/** 状态 */
export type Symbols1StatusEnum = "ENABLE" | "DISABLED";

/** 订单方向 */
export type TradeRecordsBuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 成交方向 */
export type TradeRecordsInOutEnum = "IN" | "OUT" | "IN_OUT";

/** 保证金类型 */
export type TradeRecordsMarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单模式 */
export type TradeRecordsModeEnum = "NETTING" | "LOCKED_POSITION";

/** 订单方向 */
export type TradeRecords1BuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 成交方向 */
export type TradeRecords1InOutEnum = "IN" | "OUT" | "IN_OUT";

/** 订单模式 */
export type TradeRecords1ModeEnum = "NETTING" | "LOCKED_POSITION";

/** 交易-计算类型 */
export type CalculationTypeEnum = "FOREIGN_CURRENCY" | "CFD";

/** 交易-GTC */
export type GtcEnum = "DAY_VALID" | "DAY_VALID_NOT" | "CLIENT_CANCEL";

/** 状态 */
export type StatusEnum = "ENABLE" | "DISABLED";

/** 交易-交易方向 */
export type TradeBuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 交易-交易许可 */
export type TradeLicenseEnum =
  | "ENABLE"
  | "DISABLED"
  | "ONLY_BUY"
  | "ONLY_SELL"
  | "ONLY_CLOSE";

/** 交易-计算类型 */
export type Type4CalculationTypeEnum = "FOREIGN_CURRENCY" | "CFD";

/** 交易-GTC */
export type Type4GtcEnum = "DAY_VALID" | "DAY_VALID_NOT" | "CLIENT_CANCEL";

/** 状态 */
export type Type4StatusEnum = "ENABLE" | "DISABLED";

/** 交易-交易方向 */
export type Type4TradeBuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 交易-交易许可 */
export type Type4TradeLicenseEnum =
  | "ENABLE"
  | "DISABLED"
  | "ONLY_BUY"
  | "ONLY_SELL"
  | "ONLY_CLOSE";

/** 订单方向 */
export type Type5BuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 创建原因 */
export type Type5CreateReasonEnum =
  | "CLIENT"
  | "MANAGER"
  | "DEALER"
  | "STOP_LOSS"
  | "TAKE_PROFIT"
  | "STOP_OUT"
  | "FOLLOW_REDEEM"
  | "SYSTEM";

/** 保证金类型 */
export type Type5MarginTypeEnum = "CROSS_MARGIN" | "ISOLATED_MARGIN";

/** 订单类型 */
export type Type5TypeEnum =
  | "MARKET_ORDER"
  | "STOP_LOSS_ORDER"
  | "TAKE_PROFIT_ORDER"
  | "LIMIT_BUY_ORDER"
  | "LIMIT_SELL_ORDER"
  | "STOP_LOSS_LIMIT_BUY_ORDER"
  | "STOP_LOSS_LIMIT_SELL_ORDER"
  | "STOP_LOSS_MARKET_BUY_ORDER"
  | "STOP_LOSS_MARKET_SELL_ORDER";

/** 交易-计算类型 */
export type Type9CalculationTypeEnum = "FOREIGN_CURRENCY" | "CFD";

/** 交易-GTC */
export type Type9GtcEnum = "DAY_VALID" | "DAY_VALID_NOT" | "CLIENT_CANCEL";

/** 交易-交易方向 */
export type Type9TradeBuySellEnum = "BUY" | "SELL" | "BUY_OR_SELL";

/** 交易-交易许可 */
export type Type9TradeLicenseEnum =
  | "ENABLE"
  | "DISABLED"
  | "ONLY_BUY"
  | "ONLY_SELL"
  | "ONLY_CLOSE";

/** 订单模式 */
export type GetAccountListParamsOrderModeEnum = "NETTING" | "LOCKED_POSITION";

/** 类型 */
export type GetAccountMoneyrecordsParamsTypeEnum =
  | "DEPOSIT"
  | "ACTIVITY"
  | "DEPOSIT_SIMULATE"
  | "WITHDRAWAL"
  | "MARGIN"
  | "PROFIT"
  | "HANDLING_FEES"
  | "INTEREST_FEES"
  | "GIFT"
  | "TRANSFER"
  | "FOLLOW_INITIAL"
  | "FOLLOW_PURCHASE"
  | "FOLLOW_REDEEM"
  | "FOLLOW_PROFIT_SHARING"
  | "FOLLOW_VAULT_DIVVY"
  | "FOLLOW_CLOSE"
  | "BACK"
  | "ZERO"
  | "BALANCE";

/** 类型 */
export type GetFollowmanageSharesrecordlistParamsFollowSharesRecordTypeEnum =
  | "INITIALIZE"
  | "PURCHASE_SHARES"
  | "REDEEM_SHARES"
  | "DIVVY"
  | "CLOSE";

/** 时间范围 */
export type GetFollowmanageTwrrecordlistParamsFollowTwrQueryScopeEnum =
  | "HOUR24"
  | "DAY30"
  | "ALL_TIME";

/** 订单方向 */
export type GetOrdersBgaorderpageListParamsBuySellEnum =
  | "BUY"
  | "SELL"
  | "BUY_OR_SELL";

/** 保证金类型 */
export type GetOrdersBgaorderpageListParamsMarginTypeEnum =
  | "CROSS_MARGIN"
  | "ISOLATED_MARGIN";

/** 订单模式 */
export type GetOrdersBgaorderpageListParamsModeEnum =
  | "NETTING"
  | "LOCKED_POSITION";

/** 排序 */
export type GetOrdersBgaorderpageListParamsOrderByEnum = "ASC" | "DESC";

/** 状态 */
export type GetOrdersBgaorderpageListParamsStatusEnum = "BAG" | "FINISH";

/** 订单方向 */
export type GetOrdersOrderpageListParamsBuySellEnum =
  | "BUY"
  | "SELL"
  | "BUY_OR_SELL";

/** 保证金类型 */
export type GetOrdersOrderpageListParamsMarginTypeEnum =
  | "CROSS_MARGIN"
  | "ISOLATED_MARGIN";

/** 订单模式 */
export type GetOrdersOrderpageListParamsModeEnum =
  | "NETTING"
  | "LOCKED_POSITION";

/** 排序 */
export type GetOrdersOrderpageListParamsOrderByEnum = "ASC" | "DESC";

/** 成交方向 */
export type GetOrdersTraderecordspageListParamsInOutEnum =
  | "IN"
  | "OUT"
  | "IN_OUT";

/** 排序 */
export type GetOrdersTraderecordspageListParamsOrderByEnum = "ASC" | "DESC";

/** 交易-计算类型 */
export type GetSymbolsPageListParamsCalculationTypeEnum =
  | "FOREIGN_CURRENCY"
  | "CFD";

/** 状态 */
export type GetSymbolsPageListParamsStatusEnum = "ENABLE" | "DISABLED";

export namespace Account {
  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name GetAccountCount
   * @summary 交易账户-统计
   * @request GET:/coreApi/account/count
   * @secure
   */
  export namespace GetAccountCount {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      accountId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListAccountCountVO;
  }

  /**
   * No description
   * @tags 交易账户接口
   * @name GetAccountCountAccountprofit
   * @summary 交易账户-盈亏
   * @request GET:/coreApi/account/count/accountProfit
   * @secure
   */
  export namespace GetAccountCountAccountprofit {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 账户ID
       * @format int64
       */
      accountId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBigdecimal;
  }

  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name GetAccountDetail
   * @summary 交易账户-详情
   * @request GET:/coreApi/account/detail
   * @secure
   */
  export namespace GetAccountDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RAccountPage;
  }

  /**
   * @description 传入account
   * @tags 交易账户接口
   * @name GetAccountList
   * @summary 交易账户-分页
   * @request GET:/coreApi/account/list
   * @secure
   */
  export namespace GetAccountList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 交易账号组ID
       * @format int64
       */
      accountGroupId?: number;
      /**
       * 交易账号ID
       * @format int64
       */
      accountId?: number;
      /** 客户登录账号 */
      clientAccount?: string;
      /**
       * 客户ID
       * @format int64
       */
      clientId?: number;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /** 是否模拟 */
      isSimulate?: boolean;
      /** 交易账号名称 */
      name?: string;
      /** 订单模式 */
      orderMode?: GetAccountListParamsOrderModeEnum;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageAccountPage;
  }

  /**
   * @description 传入moneyRecords
   * @tags 交易账户接口
   * @name GetAccountMoneyrecords
   * @summary 资金变更记录-分页
   * @request GET:/coreApi/account/moneyRecords
   * @secure
   */
  export namespace GetAccountMoneyrecords {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 交易账号ID
       * @format int64
       */
      accountId: number;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 结束时间
       * @format date-time
       */
      endTime?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 开始时间
       * @format date-time
       */
      startTime?: string;
      /** 类型 */
      type?: GetAccountMoneyrecordsParamsTypeEnum;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageMoneyRecords;
  }

  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name PostAccountRecharge
   * @summary 交易账户-充值
   * @request POST:/coreApi/account/recharge
   * @secure
   */
  export namespace PostAccountRecharge {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HandRechargeVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name PostAccountRechargeSimulate
   * @summary 交易账户-模拟入金
   * @request POST:/coreApi/account/rechargeSimulate
   * @secure
   */
  export namespace PostAccountRechargeSimulate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HandRechargeVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name PostAccountRemove
   * @summary 交易账户-删除
   * @request POST:/coreApi/account/remove
   * @secure
   */
  export namespace PostAccountRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 主键ID */
      id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入account
   * @tags 交易账户接口
   * @name PostAccountSave
   * @summary 交易账户-新增
   * @request POST:/coreApi/account/save
   * @secure
   */
  export namespace PostAccountSave {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountCreateVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 交易账户接口
   * @name GetAccountTradesymbollist
   * @summary 交易账户-品种及配置List
   * @request GET:/coreApi/account/tradeSymbolList
   * @secure
   */
  export namespace GetAccountTradesymbollist {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 交易账户ID
       * @format int64
       */
      accountId?: number;
      /** 交易品种分类 */
      classify?: string;
      /** 交易品种 */
      symbol?: string;
      /** 交易品种路径 */
      symbolPath?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListSymbols;
  }

  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name PostAccountTransfer
   * @summary 交易账户-资金划转
   * @request POST:/coreApi/account/transfer
   * @secure
   */
  export namespace PostAccountTransfer {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountMoneyTransferVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入account
   * @tags 交易账户接口
   * @name PostAccountUpdate
   * @summary 交易账户-修改
   * @request POST:/coreApi/account/update
   * @secure
   */
  export namespace PostAccountUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountUpdateVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户接口
   * @name PostAccountWithdraw
   * @summary 交易账户-出金
   * @request POST:/coreApi/account/withdraw
   * @secure
   */
  export namespace PostAccountWithdraw {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = HandWithdrawVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace AccountGroup {
  /**
   * @description 传入accountGroup
   * @tags 交易账户组接口
   * @name PostAccountGroupAdd
   * @summary 交易账户组-新增
   * @request POST:/coreApi/accountGroup/add
   * @secure
   */
  export namespace PostAccountGroupAdd {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountGroupSaveVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户组接口
   * @name PostAccountGroupClone
   * @summary 交易账户组-克隆
   * @request POST:/coreApi/accountGroup/clone
   * @secure
   */
  export namespace PostAccountGroupClone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountGroupCloneVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户组接口
   * @name GetAccountgroupConfDetail
   * @summary 交易账户组关联产品配置-详情
   * @request GET:/coreApi/accountGroup/conf/detail
   * @secure
   */
  export namespace GetAccountgroupConfDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RSymbolConf;
  }

  /**
   * @description 传入symbolConf
   * @tags 交易账户组接口
   * @name PostAccountGroupConfEdit
   * @summary 交易账户组关联产品配置-修改
   * @request POST:/coreApi/accountGroup/conf/edit
   * @secure
   */
  export namespace PostAccountGroupConfEdit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _9;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户组接口
   * @name GetAccountgroupDetail
   * @summary 交易账户组-详情
   * @request GET:/coreApi/accountGroup/detail
   * @secure
   */
  export namespace GetAccountgroupDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RAccountGroup;
  }

  /**
   * @description 传入accountGroup
   * @tags 交易账户组接口
   * @name GetAccountgroupList
   * @summary 交易账户组-分页
   * @request GET:/coreApi/accountGroup/list
   * @secure
   */
  export namespace GetAccountgroupList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageAccountGroup;
  }

  /**
   * @description 传入id
   * @tags 交易账户组接口
   * @name PostAccountGroupRemove
   * @summary 交易账户组-删除
   * @request POST:/coreApi/accountGroup/remove
   * @secure
   */
  export namespace PostAccountGroupRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易账户组接口
   * @name GetAccountgroupSymbolDelete
   * @summary 交易账户组关联产品-删除
   * @request GET:/coreApi/accountGroup/symbol/delete
   * @secure
   */
  export namespace GetAccountgroupSymbolDelete {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入accountGroupSymbols
   * @tags 交易账户组接口
   * @name GetAccountgroupSymbolList
   * @summary 交易账户组关联产品-分页
   * @request GET:/coreApi/accountGroup/symbol/list
   * @secure
   */
  export namespace GetAccountgroupSymbolList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 账户组id
       * @format int64
       */
      accountGroupId: number;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageAccountGroupSymbols;
  }

  /**
   * @description 传入accountGroupSymbols
   * @tags 交易账户组接口
   * @name PostAccountGroupSymbolSave
   * @summary 交易账户组关联产品-新增/修改
   * @request POST:/coreApi/accountGroup/symbol/save
   * @secure
   */
  export namespace PostAccountGroupSymbolSave {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountGroupSymbols;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id和isDefault
   * @tags 交易账户组接口
   * @name GetAccountgroupSymbolSwitch
   * @summary 交易账户组关联产品-默认/自定义开关
   * @request GET:/coreApi/accountGroup/symbol/switch
   * @secure
   */
  export namespace GetAccountgroupSymbolSwitch {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
      /** 是否默认配置 */
      isDefault: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入accountGroup
   * @tags 交易账户组接口
   * @name PostAccountGroupUpdate
   * @summary 交易账户组-修改
   * @request POST:/coreApi/accountGroup/update
   * @secure
   */
  export namespace PostAccountGroupUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AccountGroupSaveVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace DelayUser {
  /**
   * @description 传入delayUser
   * @tags 交易延迟用户记录接口
   * @name PostDelayUserAdd
   * @summary 新增
   * @request POST:/coreApi/delayUser/add
   * @secure
   */
  export namespace PostDelayUserAdd {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 用户名/手机/邮箱 */
      accountEmailPhone: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入delayUser
   * @tags 交易延迟用户记录接口
   * @name GetDelayuserPageList
   * @summary 分页
   * @request GET:/coreApi/delayUser/page
   * @secure
   */
  export namespace GetDelayuserPageList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /** accountEmailPhone */
      accountEmailPhone?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageDelayUser;
  }

  /**
   * @description 传入ids
   * @tags 交易延迟用户记录接口
   * @name PostDelayUserRemove
   * @summary 删除
   * @request POST:/coreApi/delayUser/remove
   * @secure
   */
  export namespace PostDelayUserRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 主键集合 */
      ids: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace FollowManage {
  /**
   * @description 传入followManageId
   * @tags 跟单池接口
   * @name GetFollowmanageAccountshares
   * @summary 跟单金库存款账户列表
   * @request GET:/coreApi/followManage/accountShares
   * @secure
   */
  export namespace GetFollowmanageAccountshares {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 主键id
       * @format int64
       */
      followManageId: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageAccountManage;
  }

  /**
   * @description 传入followManageCreate
   * @tags 跟单池接口
   * @name PostFollowManageCreatePool
   * @summary 创建跟单池
   * @request POST:/coreApi/followManage/createPool
   * @secure
   */
  export namespace PostFollowManageCreatePool {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FollowManageCreateVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入跟单金库ID
   * @tags 跟单池接口
   * @name GetFollowmanagePooldetail
   * @summary 跟单池详情
   * @request GET:/coreApi/followManage/poolDetail
   * @secure
   */
  export namespace GetFollowmanagePooldetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 跟单管理id
       * @format int64
       */
      followManageId: number;
      /**
       * 交易账户id
       * @format int64
       */
      tradeAccountId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RPoolManage;
  }

  /**
   * @description 传入poolManage
   * @tags 跟单池接口
   * @name GetFollowmanagePoollist
   * @summary 跟单金库列表
   * @request GET:/coreApi/followManage/poolList
   * @secure
   */
  export namespace GetFollowmanagePoollist {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /** 查询参数 */
      searchParam?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPagePoolManage;
  }

  /**
   * @description 传入followManageId
   * @tags 跟单池接口
   * @name GetFollowmanageSharesrecordlist
   * @summary 存款和提款列表
   * @request GET:/coreApi/followManage/sharesRecordList
   * @secure
   */
  export namespace GetFollowmanageSharesrecordlist {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 跟单管理ID
       * @format int64
       */
      followManageId: number;
      /** 类型 */
      followSharesRecordType?: GetFollowmanageSharesrecordlistParamsFollowSharesRecordTypeEnum;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 交易账户ID
       * @format int64
       */
      tradeAccountId?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageSharesRecord;
  }

  /**
   * @description 传入twrRecord
   * @tags 跟单池接口
   * @name GetFollowmanageTwrrecordlist
   * @summary 跟单TWR列表
   * @request GET:/coreApi/followManage/twrRecordList
   * @secure
   */
  export namespace GetFollowmanageTwrrecordlist {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      followManageId: number;
      /** 时间范围 */
      followTwrQueryScope: GetFollowmanageTwrrecordlistParamsFollowTwrQueryScopeEnum;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListTwrRecordVO;
  }

  /**
   * @description 传入followManageId
   * @tags 跟单池接口
   * @name PostFollowManageVaultClose
   * @summary 金库关闭
   * @request POST:/coreApi/followManage/vaultClose
   * @secure
   */
  export namespace PostFollowManageVaultClose {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      followManageId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入poolManage
   * @tags 跟单池接口
   * @name PostFollowManageVaultDivvy
   * @summary 金库分发
   * @request POST:/coreApi/followManage/vaultDivvy
   * @secure
   */
  export namespace PostFollowManageVaultDivvy {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FollowVaultDivvyVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace FollowShares {
  /**
   * @description 传入tradeAccountId
   * @tags 跟单账户接口
   * @name GetFollowsharesFollowlist
   * @summary 账户跟单列表
   * @request GET:/coreApi/followShares/followList
   * @secure
   */
  export namespace GetFollowsharesFollowlist {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 主键id
       * @format int64
       */
      tradeAccountId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageAccountManage;
  }

  /**
   * @description 传入followPurchaseShares
   * @tags 跟单账户接口
   * @name PostFollowSharesPurchaseShares
   * @summary 存款申购
   * @request POST:/coreApi/followShares/purchaseShares
   * @secure
   */
  export namespace PostFollowSharesPurchaseShares {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FollowPurchaseSharesVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入followRedeemShares
   * @tags 跟单账户接口
   * @name PostFollowSharesRedeemShares
   * @summary 取款赎回
   * @request POST:/coreApi/followShares/redeemShares
   * @secure
   */
  export namespace PostFollowSharesRedeemShares {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FollowRedeemSharesVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 账户跟单份额详情
   * @tags 跟单账户接口
   * @name GetFollowsharesSharesdetail
   * @summary 账户跟单详情
   * @request GET:/coreApi/followShares/sharesDetail
   * @secure
   */
  export namespace GetFollowsharesSharesdetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      followSharesId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RAccountManage;
  }
}

export namespace Holiday {
  /**
   * @description 传入holiday
   * @tags 假期日历接口
   * @name GetHolidayDetail
   * @summary 假期日历-详情
   * @request GET:/coreApi/holiday/detail
   * @secure
   */
  export namespace GetHolidayDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RHoliday;
  }

  /**
   * @description 传入holiday
   * @tags 假期日历接口
   * @name GetHolidayList
   * @summary 假期日历-分页
   * @request GET:/coreApi/holiday/list
   * @secure
   */
  export namespace GetHolidayList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageHoliday;
  }

  /**
   * @description 传入ids
   * @tags 假期日历接口
   * @name PostHolidayRemove
   * @summary 假期日历-删除
   * @request POST:/coreApi/holiday/remove
   * @secure
   */
  export namespace PostHolidayRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 主键集合 */
      ids: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入holiday
   * @tags 假期日历接口
   * @name PostHolidaySubmit
   * @summary 假期日历-新增或修改
   * @request POST:/coreApi/holiday/submit
   * @secure
   */
  export namespace PostHolidaySubmit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = Holiday;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入symbols
   * @tags 假期日历接口
   * @name GetHolidaySymbolisholiday
   * @summary 假期日历-判断品种当前是否在假期
   * @request GET:/coreApi/holiday/symbolIsHoliday
   * @secure
   */
  export namespace GetHolidaySymbolisholiday {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 品种集合 */
      symbols: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RMapStringBoolean;
  }
}

export namespace LbPool {
  /**
   * @description 传入lbPool
   * @tags LB池接口
   * @name PostLbPoolAdd
   * @summary 新增
   * @request POST:/coreApi/lbPool/add
   * @secure
   */
  export namespace PostLbPoolAdd {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LbPoolAddVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入lbPool
   * @tags LB池接口
   * @name GetLbpoolDetail
   * @summary 详情
   * @request GET:/coreApi/lbPool/detail
   * @secure
   */
  export namespace GetLbpoolDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RLbPool;
  }

  /**
   * @description 传入lbPool
   * @tags LB池接口
   * @name PostLbPoolInit
   * @summary 初始化链上账户
   * @request POST:/coreApi/lbPool/init
   * @secure
   */
  export namespace PostLbPoolInit {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入lbPool
   * @tags LB池接口
   * @name GetLbpoolList
   * @summary 分页
   * @request GET:/coreApi/lbPool/list
   * @secure
   */
  export namespace GetLbpoolList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageLbPool;
  }

  /**
   * @description 传入ids
   * @tags LB池接口
   * @name PostLbPoolRemove
   * @summary 删除
   * @request POST:/coreApi/lbPool/remove
   * @secure
   */
  export namespace PostLbPoolRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入ids
   * @tags LB池接口
   * @name PostLbPoolSymbolGroup
   * @summary 交易品种-账户组配置
   * @request POST:/coreApi/lbPool/symbol-group
   * @secure
   */
  export namespace PostLbPoolSymbolGroup {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RSetObject;
  }

  /**
   * @description 传入lbPool
   * @tags LB池接口
   * @name PostLbPoolUpdate
   * @summary 修改
   * @request POST:/coreApi/lbPool/update
   * @secure
   */
  export namespace PostLbPoolUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = LbPoolUpdateVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace Orders {
  /**
   * @description 传入orders
   * @tags 订单接口
   * @name PostOrdersAddMargin
   * @summary 持仓订单-追加逐仓保证金
   * @request POST:/coreApi/orders/addMargin
   * @secure
   */
  export namespace PostOrdersAddMargin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _8;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入持仓单ID
   * @tags 订单接口
   * @name GetOrdersAlldetail
   * @summary 持仓订单-全部详情
   * @request GET:/coreApi/orders/allDetail
   * @secure
   */
  export namespace GetOrdersAlldetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBagOrder;
  }

  /**
   * @description 传入bagOrder
   * @tags 订单接口
   * @name GetOrdersBgaorderpageList
   * @summary 持仓订单-分页
   * @request GET:/coreApi/orders/bgaOrderPage
   * @secure
   */
  export namespace GetOrdersBgaorderpageList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 交易账户ID
       * @pattern ^(?:\d+)?$
       */
      accountId?: string;
      /**
       * 持仓订单号ID
       * @pattern ^(?:\d+)?$
       */
      bagOrderId?: string;
      /**
       * 持仓时间（秒）
       * @format int32
       */
      bagOrderTime?: number;
      /** 订单方向 */
      buySell?: GetOrdersBgaorderpageListParamsBuySellEnum;
      /**
       * 客户ID
       * @pattern ^(?:\d+)?$
       */
      clientId?: string;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /** 邮箱或者手机号 */
      emailOrPhone?: string;
      /**
       * 结束时间
       * @format date-time
       */
      endTime?: string;
      /** 是否模拟，false真实，true模拟 */
      isSimulate?: boolean;
      /** 保证金类型 */
      marginType?: GetOrdersBgaorderpageListParamsMarginTypeEnum;
      /** 订单模式 */
      mode?: GetOrdersBgaorderpageListParamsModeEnum;
      /** 排序 */
      orderBy?: GetOrdersBgaorderpageListParamsOrderByEnum;
      /** 排序字段 */
      orderByField?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 开始时间
       * @format date-time
       */
      startTime?: string;
      /** 状态 */
      status?: GetOrdersBgaorderpageListParamsStatusEnum;
      /** 交易品种 */
      symbol?: string;
      /** 客户UID */
      userAccount?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageBagOrder;
  }

  /**
   * @description 传入bagOrder
   * @tags 订单接口
   * @name GetOrdersBgaorderpriceprofit
   * @summary 持仓订单-报价&盈亏
   * @request GET:/coreApi/orders/bgaOrderPriceProfit
   * @secure
   */
  export namespace GetOrdersBgaorderpriceprofit {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 交易账户ID-交易品种-账户组ID-持仓单ID（多个用','隔开） */
      asgoArrayStr: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RJSONObject;
  }

  /**
   * @description 传入orders
   * @tags 订单接口
   * @name PostOrdersCreateOrder
   * @summary 委托订单-下单
   * @request POST:/coreApi/orders/createOrder
   * @secure
   */
  export namespace PostOrdersCreateOrder {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _5;
    export type RequestHeaders = {};
    export type ResponseBody = ROrders;
  }

  /**
   * @description 传入
   * @tags 订单接口
   * @name GetOrdersCrosshigh
   * @summary 【全仓】追加预付款账户【敏感账户】
   * @request GET:/coreApi/orders/crossHigh
   * @secure
   */
  export namespace GetOrdersCrosshigh {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListAccountHighVO;
  }

  /**
   * @description 传入orders
   * @tags 订单接口
   * @name PostOrdersExtractMargin
   * @summary 持仓订单-提取逐仓保证金
   * @request POST:/coreApi/orders/extractMargin
   * @secure
   */
  export namespace PostOrdersExtractMargin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _7;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 订单接口
   * @name GetOrdersIsolatedhigh
   * @summary 【逐仓】追加预付款订单【敏感订单】
   * @request GET:/coreApi/orders/isolatedHigh
   * @secure
   */
  export namespace GetOrdersIsolatedhigh {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListOrderHighVO;
  }

  /**
   * @description 传入
   * @tags 订单接口
   * @name PostOrdersNewOrderMargin
   * @summary 委托订单-计算新订单保证金
   * @request POST:/coreApi/orders/newOrderMargin
   * @secure
   */
  export namespace PostOrdersNewOrderMargin {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _5;
    export type RequestHeaders = {};
    export type ResponseBody = RString;
  }

  /**
   * @description 传入orders
   * @tags 订单接口
   * @name PostOrdersOrderCancel
   * @summary 委托订单-取消
   * @request POST:/coreApi/orders/orderCancel
   * @secure
   */
  export namespace PostOrdersOrderCancel {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 订单id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入订单ID
   * @tags 订单接口
   * @name GetOrdersOrderdetail
   * @summary 委托订单-详情
   * @request GET:/coreApi/orders/orderDetail
   * @secure
   */
  export namespace GetOrdersOrderdetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ROrders1;
  }

  /**
   * @description 传入orders
   * @tags 订单接口
   * @name PostOrdersOrderEdit
   * @summary 委托订单-修改
   * @request POST:/coreApi/orders/orderEdit
   * @secure
   */
  export namespace PostOrdersOrderEdit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _2;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入orders
   * @tags 订单接口
   * @name GetOrdersOrderpageList
   * @summary 委托订单-分页
   * @request GET:/coreApi/orders/orderPage
   * @secure
   */
  export namespace GetOrdersOrderpageList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 交易账户ID
       * @pattern ^(?:\d+)?$
       */
      accountId?: string;
      /** 订单方向 */
      buySell?: GetOrdersOrderpageListParamsBuySellEnum;
      /**
       * 客户ID
       * @pattern ^(?:\d+)?$
       */
      clientId?: string;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /** 邮箱或者手机号 */
      emailOrPhone?: string;
      /**
       * 结束时间
       * @format date-time
       */
      endTime?: string;
      /** 是否模拟，false真实，true模拟 */
      isSimulate?: boolean;
      /** 保证金类型 */
      marginType?: GetOrdersOrderpageListParamsMarginTypeEnum;
      /** 订单模式 */
      mode?: GetOrdersOrderpageListParamsModeEnum;
      /** 排序 */
      orderBy?: GetOrdersOrderpageListParamsOrderByEnum;
      /** 排序字段 */
      orderByField?: string;
      /**
       * 订单号ID
       * @pattern ^(?:\d+)?$
       */
      orderId?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 开始时间
       * @format date-time
       */
      startTime?: string;
      /** 状态 */
      status?: string;
      /** 交易品种 */
      symbol?: string;
      /** 订单类型 */
      type?: string;
      /** 客户UID */
      userAccount?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageOrders;
  }

  /**
   * @description 传入orders
   * @tags 订单接口
   * @name PostOrdersStopProfitLoss
   * @summary 持仓订单-修改止盈止损
   * @request POST:/coreApi/orders/stopProfitLoss
   * @secure
   */
  export namespace PostOrdersStopProfitLoss {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _3;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入tradeRecords
   * @tags 订单接口
   * @name GetOrdersTraderecordspageList
   * @summary 成交记录-分页
   * @request GET:/coreApi/orders/tradeRecordsPage
   * @secure
   */
  export namespace GetOrdersTraderecordspageList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 交易账户ID
       * @pattern ^(?:\d+)?$
       */
      accountId?: string;
      /**
       * 持仓订单ID
       * @pattern ^(?:\d+)?$
       */
      bagOrderId?: string;
      /**
       * 客户ID
       * @pattern ^(?:\d+)?$
       */
      clientId?: string;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /** 邮箱或者手机号 */
      emailOrPhone?: string;
      /**
       * 结束时间
       * @format date-time
       */
      endTime?: string;
      /** 成交方向 */
      inOut?: GetOrdersTraderecordspageListParamsInOutEnum;
      /** 是否模拟，false真实，true模拟 */
      isSimulate?: boolean;
      /** 排序 */
      orderBy?: GetOrdersTraderecordspageListParamsOrderByEnum;
      /** 排序字段 */
      orderByField?: string;
      /**
       * 订单ID
       * @pattern ^(?:\d+)?$
       */
      orderId?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 开始时间
       * @format date-time
       */
      startTime?: string;
      /** 交易品种 */
      symbol?: string;
      /**
       * 成交单号ID
       * @pattern ^(?:\d+)?$
       */
      tradeRecordsId?: string;
      /** 客户UID */
      userAccount?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageTradeRecords;
  }
}

export namespace Public {
  /**
   * @description 传入
   * @tags 公开接口接口
   * @name GetPublicLpRedeemapply
   * @summary Lp池MXLP代币赎回申请
   * @request GET:/coreApi/public/lp/redeemApply
   * @secure
   */
  export namespace GetPublicLpRedeemapply {
    export type RequestParams = {};
    export type RequestQuery = {
      /** address */
      address: string;
      /** applySignature */
      applySignature?: string;
      /** mxlpPrice */
      mxlpPrice: number;
      /** redeemMxlp */
      redeemMxlp: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入
   * @tags 公开接口接口
   * @name GetPublicSymbolHoliday
   * @summary 判断品种是否是假期
   * @request GET:/coreApi/public/symbol/holiday
   * @secure
   */
  export namespace GetPublicSymbolHoliday {
    export type RequestParams = {};
    export type RequestQuery = {
      /** symbol */
      symbol: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入null
   * @tags 公开接口接口
   * @name GetPublicTestGetip
   * @summary 测试获取IP
   * @request GET:/coreApi/public/test/getIp
   * @secure
   */
  export namespace GetPublicTestGetip {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RString;
  }

  /**
   * @description 传入null
   * @tags 公开接口接口
   * @name GetPublicTestI18N
   * @summary 测试国际化
   * @request GET:/coreApi/public/test/i18n
   * @secure
   */
  export namespace GetPublicTestI18N {
    export type RequestParams = {};
    export type RequestQuery = {
      /** key */
      key: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RString;
  }

  /**
   * @description 传入null
   * @tags 公开接口接口
   * @name GetPublicTestOrderby
   * @summary 测试排序
   * @request GET:/coreApi/public/test/orderBy
   * @secure
   */
  export namespace GetPublicTestOrderby {
    export type RequestParams = {};
    export type RequestQuery = {
      /** field */
      field: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RString;
  }

  /**
   * @description 传入null
   * @tags 公开接口接口
   * @name GetPublicTestTimeconvert
   * @summary 测试时间转换
   * @request GET:/coreApi/public/test/timeConvert
   * @secure
   */
  export namespace GetPublicTestTimeconvert {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * moneyRecordsId
       * @format int64
       */
      moneyRecordsId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RMoneyRecords;
  }
}

export namespace SymbolGroup {
  /**
   * @description 传入id
   * @tags 交易品种组接口
   * @name PostSymbolGroupRemove
   * @summary 交易品种组-删除
   * @request POST:/coreApi/symbolGroup/remove
   * @secure
   */
  export namespace PostSymbolGroupRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入symbolGroup
   * @tags 交易品种组接口
   * @name PostSymbolGroupSubmit
   * @summary 交易品种组-新增或修改
   * @request POST:/coreApi/symbolGroup/submit
   * @secure
   */
  export namespace PostSymbolGroupSubmit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SymbolGroup;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 树形结构
   * @tags 交易品种组接口
   * @name GetSymbolgroupTree
   * @summary 交易品种组-树形结构
   * @request GET:/coreApi/symbolGroup/tree
   * @secure
   */
  export namespace GetSymbolgroupTree {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListSymbolGroup;
  }
}

export namespace Symbols {
  /**
   * @description 传入symbols
   * @tags 交易品种接口
   * @name PostSymbolsAdd
   * @summary 交易品种-新增
   * @request POST:/coreApi/symbols/add
   * @secure
   */
  export namespace PostSymbolsAdd {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _4;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入id
   * @tags 交易品种接口
   * @name GetSymbolsDetail
   * @summary 交易品种-详情
   * @request GET:/coreApi/symbols/detail
   * @secure
   */
  export namespace GetSymbolsDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RSymbols1;
  }

  /**
   * @description 传入symbols
   * @tags 交易品种接口
   * @name GetSymbolsList
   * @summary 交易品种-分页
   * @request GET:/coreApi/symbols/list
   * @secure
   */
  export namespace GetSymbolsList {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListSymbols1;
  }

  /**
   * @description 传入symbols
   * @tags 交易品种接口
   * @name GetSymbolsPageList
   * @summary 交易品种-自定义分页
   * @request GET:/coreApi/symbols/page
   * @secure
   */
  export namespace GetSymbolsPageList {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 交易-计算类型 */
      calculationType?: GetSymbolsPageListParamsCalculationTypeEnum;
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /** 备注 */
      remark?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /** 状态 */
      status?: GetSymbolsPageListParamsStatusEnum;
      /** 品种名称 */
      symbol?: string;
      /**
       * 品种组ID
       * @format int64
       */
      symbolGroupId?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageSymbols;
  }

  /**
   * @description 传入id
   * @tags 交易品种接口
   * @name PostSymbolsRemove
   * @summary 交易品种-删除
   * @request POST:/coreApi/symbols/remove
   * @secure
   */
  export namespace PostSymbolsRemove {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 主键id
       * @format int64
       */
      id: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入symbol
   * @tags 交易品种接口
   * @name GetSymbolsSymbolDetail
   * @summary 交易品种-详情
   * @request GET:/coreApi/symbols/symbol/detail
   * @secure
   */
  export namespace GetSymbolsSymbolDetail {
    export type RequestParams = {};
    export type RequestQuery = {
      /** symbol */
      symbol: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RSymbols;
  }

  /**
   * @description 树形结构
   * @tags 交易品种接口
   * @name GetSymbolsTree
   * @summary 交易品种-树形结构
   * @request GET:/coreApi/symbols/tree
   * @secure
   */
  export namespace GetSymbolsTree {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RJSONArray;
  }

  /**
   * @description 传入symbols
   * @tags 交易品种接口
   * @name PostSymbolsUpdate
   * @summary 交易品种-修改
   * @request POST:/coreApi/symbols/update
   * @secure
   */
  export namespace PostSymbolsUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace SystemSet {
  /**
   * @description 传入manager
   * @tags 系统参数设置接口
   * @name GetSystemsetDetail
   * @summary 系统参数-详情
   * @request GET:/coreApi/systemSet/detail
   * @secure
   */
  export namespace GetSystemsetDetail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R_;
  }

  /**
   * @description 传入manager
   * @tags 系统参数设置接口
   * @name GetSystemsetLanguage
   * @summary 多语言国际化查询
   * @request GET:/coreApi/systemSet/language
   * @secure
   */
  export namespace GetSystemsetLanguage {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 多语言key */
      key: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = string;
  }

  /**
   * @description 传入manager
   * @tags 系统参数设置接口
   * @name PostSystemSetUpdate
   * @summary 系统参数-修改
   * @request POST:/coreApi/systemSet/update
   * @secure
   */
  export namespace PostSystemSetUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _6;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "//172.31.27.8/trade-core";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title BladeX 接口文档系统
 * @version 3.3.1.RELEASE
 * @license Powered By BladeX (https://bladex.cn)
 * @termsOfService https://bladex.cn
 * @baseUrl //172.31.27.8/trade-core
 * @contact 翼宿 <bladejava@qq.com> (https://gitee.com/smallc)
 *
 * BladeX 接口文档系统
 */
export class TradeCoreApi<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  account = {
    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name GetAccountCount
     * @summary 交易账户-统计
     * @request GET:/coreApi/account/count
     * @secure
     */
    getAccountCount: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        accountId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RListAccountCountVO, void>({
        path: `/coreApi/account/count`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 交易账户接口
     * @name GetAccountCountAccountprofit
     * @summary 交易账户-盈亏
     * @request GET:/coreApi/account/count/accountProfit
     * @secure
     */
    getAccountCountAccountprofit: (
      query: {
        /**
         * 账户ID
         * @format int64
         */
        accountId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBigdecimal, void>({
        path: `/coreApi/account/count/accountProfit`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name GetAccountDetail
     * @summary 交易账户-详情
     * @request GET:/coreApi/account/detail
     * @secure
     */
    getAccountDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RAccountPage, void>({
        path: `/coreApi/account/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入account
     *
     * @tags 交易账户接口
     * @name GetAccountList
     * @summary 交易账户-分页
     * @request GET:/coreApi/account/list
     * @secure
     */
    getAccountList: (
      query?: {
        /**
         * 交易账号组ID
         * @format int64
         */
        accountGroupId?: number;
        /**
         * 交易账号ID
         * @format int64
         */
        accountId?: number;
        /** 客户登录账号 */
        clientAccount?: string;
        /**
         * 客户ID
         * @format int64
         */
        clientId?: number;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /** 是否模拟 */
        isSimulate?: boolean;
        /** 交易账号名称 */
        name?: string;
        /** 订单模式 */
        orderMode?: GetAccountListParamsOrderModeEnum;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageAccountPage, void>({
        path: `/coreApi/account/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入moneyRecords
     *
     * @tags 交易账户接口
     * @name GetAccountMoneyrecords
     * @summary 资金变更记录-分页
     * @request GET:/coreApi/account/moneyRecords
     * @secure
     */
    getAccountMoneyrecords: (
      query: {
        /**
         * 交易账号ID
         * @format int64
         */
        accountId: number;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 结束时间
         * @format date-time
         */
        endTime?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 开始时间
         * @format date-time
         */
        startTime?: string;
        /** 类型 */
        type?: GetAccountMoneyrecordsParamsTypeEnum;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageMoneyRecords, void>({
        path: `/coreApi/account/moneyRecords`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name PostAccountRecharge
     * @summary 交易账户-充值
     * @request POST:/coreApi/account/recharge
     * @secure
     */
    postAccountRecharge: (
      handRechargeVO: HandRechargeVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/recharge`,
        method: "POST",
        body: handRechargeVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name PostAccountRechargeSimulate
     * @summary 交易账户-模拟入金
     * @request POST:/coreApi/account/rechargeSimulate
     * @secure
     */
    postAccountRechargeSimulate: (
      handRechargeVO: HandRechargeVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/rechargeSimulate`,
        method: "POST",
        body: handRechargeVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name PostAccountRemove
     * @summary 交易账户-删除
     * @request POST:/coreApi/account/remove
     * @secure
     */
    postAccountRemove: (
      query: {
        /** 主键ID */
        id: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入account
     *
     * @tags 交易账户接口
     * @name PostAccountSave
     * @summary 交易账户-新增
     * @request POST:/coreApi/account/save
     * @secure
     */
    postAccountSave: (
      accountCreate: AccountCreateVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/save`,
        method: "POST",
        body: accountCreate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 交易账户接口
     * @name GetAccountTradesymbollist
     * @summary 交易账户-品种及配置List
     * @request GET:/coreApi/account/tradeSymbolList
     * @secure
     */
    getAccountTradesymbollist: (
      query?: {
        /**
         * 交易账户ID
         * @format int64
         */
        accountId?: number;
        /** 交易品种分类 */
        classify?: string;
        /** 交易品种 */
        symbol?: string;
        /** 交易品种路径 */
        symbolPath?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RListSymbols, void>({
        path: `/coreApi/account/tradeSymbolList`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name PostAccountTransfer
     * @summary 交易账户-资金划转
     * @request POST:/coreApi/account/transfer
     * @secure
     */
    postAccountTransfer: (
      accountMoneyTransferVO: AccountMoneyTransferVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/transfer`,
        method: "POST",
        body: accountMoneyTransferVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入account
     *
     * @tags 交易账户接口
     * @name PostAccountUpdate
     * @summary 交易账户-修改
     * @request POST:/coreApi/account/update
     * @secure
     */
    postAccountUpdate: (
      accountUpdate: AccountUpdateVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/update`,
        method: "POST",
        body: accountUpdate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户接口
     * @name PostAccountWithdraw
     * @summary 交易账户-出金
     * @request POST:/coreApi/account/withdraw
     * @secure
     */
    postAccountWithdraw: (
      handWithdrawVO: HandWithdrawVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/account/withdraw`,
        method: "POST",
        body: handWithdrawVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  accountGroup = {
    /**
     * @description 传入accountGroup
     *
     * @tags 交易账户组接口
     * @name PostAccountGroupAdd
     * @summary 交易账户组-新增
     * @request POST:/coreApi/accountGroup/add
     * @secure
     */
    postAccountGroupAdd: (
      accountGroupSave: AccountGroupSaveVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/add`,
        method: "POST",
        body: accountGroupSave,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户组接口
     * @name PostAccountGroupClone
     * @summary 交易账户组-克隆
     * @request POST:/coreApi/accountGroup/clone
     * @secure
     */
    postAccountGroupClone: (
      accountGroupClone: AccountGroupCloneVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/clone`,
        method: "POST",
        body: accountGroupClone,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户组接口
     * @name GetAccountgroupConfDetail
     * @summary 交易账户组关联产品配置-详情
     * @request GET:/coreApi/accountGroup/conf/detail
     * @secure
     */
    getAccountgroupConfDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RSymbolConf, void>({
        path: `/coreApi/accountGroup/conf/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入symbolConf
     *
     * @tags 交易账户组接口
     * @name PostAccountGroupConfEdit
     * @summary 交易账户组关联产品配置-修改
     * @request POST:/coreApi/accountGroup/conf/edit
     * @secure
     */
    postAccountGroupConfEdit: (
      accountGroupSymbolConfSave: _9,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/conf/edit`,
        method: "POST",
        body: accountGroupSymbolConfSave,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户组接口
     * @name GetAccountgroupDetail
     * @summary 交易账户组-详情
     * @request GET:/coreApi/accountGroup/detail
     * @secure
     */
    getAccountgroupDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RAccountGroup, void>({
        path: `/coreApi/accountGroup/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入accountGroup
     *
     * @tags 交易账户组接口
     * @name GetAccountgroupList
     * @summary 交易账户组-分页
     * @request GET:/coreApi/accountGroup/list
     * @secure
     */
    getAccountgroupList: (
      query?: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageAccountGroup, void>({
        path: `/coreApi/accountGroup/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户组接口
     * @name PostAccountGroupRemove
     * @summary 交易账户组-删除
     * @request POST:/coreApi/accountGroup/remove
     * @secure
     */
    postAccountGroupRemove: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易账户组接口
     * @name GetAccountgroupSymbolDelete
     * @summary 交易账户组关联产品-删除
     * @request GET:/coreApi/accountGroup/symbol/delete
     * @secure
     */
    getAccountgroupSymbolDelete: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/symbol/delete`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入accountGroupSymbols
     *
     * @tags 交易账户组接口
     * @name GetAccountgroupSymbolList
     * @summary 交易账户组关联产品-分页
     * @request GET:/coreApi/accountGroup/symbol/list
     * @secure
     */
    getAccountgroupSymbolList: (
      query: {
        /**
         * 账户组id
         * @format int64
         */
        accountGroupId: number;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageAccountGroupSymbols, void>({
        path: `/coreApi/accountGroup/symbol/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入accountGroupSymbols
     *
     * @tags 交易账户组接口
     * @name PostAccountGroupSymbolSave
     * @summary 交易账户组关联产品-新增/修改
     * @request POST:/coreApi/accountGroup/symbol/save
     * @secure
     */
    postAccountGroupSymbolSave: (
      accountGroupSymbols: AccountGroupSymbols,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/symbol/save`,
        method: "POST",
        body: accountGroupSymbols,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id和isDefault
     *
     * @tags 交易账户组接口
     * @name GetAccountgroupSymbolSwitch
     * @summary 交易账户组关联产品-默认/自定义开关
     * @request GET:/coreApi/accountGroup/symbol/switch
     * @secure
     */
    getAccountgroupSymbolSwitch: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
        /** 是否默认配置 */
        isDefault: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/symbol/switch`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入accountGroup
     *
     * @tags 交易账户组接口
     * @name PostAccountGroupUpdate
     * @summary 交易账户组-修改
     * @request POST:/coreApi/accountGroup/update
     * @secure
     */
    postAccountGroupUpdate: (
      accountGroupSave: AccountGroupSaveVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/accountGroup/update`,
        method: "POST",
        body: accountGroupSave,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  delayUser = {
    /**
     * @description 传入delayUser
     *
     * @tags 交易延迟用户记录接口
     * @name PostDelayUserAdd
     * @summary 新增
     * @request POST:/coreApi/delayUser/add
     * @secure
     */
    postDelayUserAdd: (
      query: {
        /** 用户名/手机/邮箱 */
        accountEmailPhone: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/delayUser/add`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入delayUser
     *
     * @tags 交易延迟用户记录接口
     * @name GetDelayuserPageList
     * @summary 分页
     * @request GET:/coreApi/delayUser/page
     * @secure
     */
    getDelayuserPageList: (
      query?: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /** accountEmailPhone */
        accountEmailPhone?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageDelayUser, void>({
        path: `/coreApi/delayUser/page`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags 交易延迟用户记录接口
     * @name PostDelayUserRemove
     * @summary 删除
     * @request POST:/coreApi/delayUser/remove
     * @secure
     */
    postDelayUserRemove: (
      query: {
        /** 主键集合 */
        ids: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/delayUser/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  followManage = {
    /**
     * @description 传入followManageId
     *
     * @tags 跟单池接口
     * @name GetFollowmanageAccountshares
     * @summary 跟单金库存款账户列表
     * @request GET:/coreApi/followManage/accountShares
     * @secure
     */
    getFollowmanageAccountshares: (
      query: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 主键id
         * @format int64
         */
        followManageId: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageAccountManage, void>({
        path: `/coreApi/followManage/accountShares`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入followManageCreate
     *
     * @tags 跟单池接口
     * @name PostFollowManageCreatePool
     * @summary 创建跟单池
     * @request POST:/coreApi/followManage/createPool
     * @secure
     */
    postFollowManageCreatePool: (
      followManageCreate: FollowManageCreateVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/followManage/createPool`,
        method: "POST",
        body: followManageCreate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入跟单金库ID
     *
     * @tags 跟单池接口
     * @name GetFollowmanagePooldetail
     * @summary 跟单池详情
     * @request GET:/coreApi/followManage/poolDetail
     * @secure
     */
    getFollowmanagePooldetail: (
      query: {
        /**
         * 跟单管理id
         * @format int64
         */
        followManageId: number;
        /**
         * 交易账户id
         * @format int64
         */
        tradeAccountId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RPoolManage, void>({
        path: `/coreApi/followManage/poolDetail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入poolManage
     *
     * @tags 跟单池接口
     * @name GetFollowmanagePoollist
     * @summary 跟单金库列表
     * @request GET:/coreApi/followManage/poolList
     * @secure
     */
    getFollowmanagePoollist: (
      query?: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /** 查询参数 */
        searchParam?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPagePoolManage, void>({
        path: `/coreApi/followManage/poolList`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入followManageId
     *
     * @tags 跟单池接口
     * @name GetFollowmanageSharesrecordlist
     * @summary 存款和提款列表
     * @request GET:/coreApi/followManage/sharesRecordList
     * @secure
     */
    getFollowmanageSharesrecordlist: (
      query: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 跟单管理ID
         * @format int64
         */
        followManageId: number;
        /** 类型 */
        followSharesRecordType?: GetFollowmanageSharesrecordlistParamsFollowSharesRecordTypeEnum;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 交易账户ID
         * @format int64
         */
        tradeAccountId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageSharesRecord, void>({
        path: `/coreApi/followManage/sharesRecordList`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入twrRecord
     *
     * @tags 跟单池接口
     * @name GetFollowmanageTwrrecordlist
     * @summary 跟单TWR列表
     * @request GET:/coreApi/followManage/twrRecordList
     * @secure
     */
    getFollowmanageTwrrecordlist: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        followManageId: number;
        /** 时间范围 */
        followTwrQueryScope: GetFollowmanageTwrrecordlistParamsFollowTwrQueryScopeEnum;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RListTwrRecordVO, void>({
        path: `/coreApi/followManage/twrRecordList`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入followManageId
     *
     * @tags 跟单池接口
     * @name PostFollowManageVaultClose
     * @summary 金库关闭
     * @request POST:/coreApi/followManage/vaultClose
     * @secure
     */
    postFollowManageVaultClose: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        followManageId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/followManage/vaultClose`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入poolManage
     *
     * @tags 跟单池接口
     * @name PostFollowManageVaultDivvy
     * @summary 金库分发
     * @request POST:/coreApi/followManage/vaultDivvy
     * @secure
     */
    postFollowManageVaultDivvy: (
      followVaultDivvy: FollowVaultDivvyVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/followManage/vaultDivvy`,
        method: "POST",
        body: followVaultDivvy,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  followShares = {
    /**
     * @description 传入tradeAccountId
     *
     * @tags 跟单账户接口
     * @name GetFollowsharesFollowlist
     * @summary 账户跟单列表
     * @request GET:/coreApi/followShares/followList
     * @secure
     */
    getFollowsharesFollowlist: (
      query: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 主键id
         * @format int64
         */
        tradeAccountId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageAccountManage, void>({
        path: `/coreApi/followShares/followList`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入followPurchaseShares
     *
     * @tags 跟单账户接口
     * @name PostFollowSharesPurchaseShares
     * @summary 存款申购
     * @request POST:/coreApi/followShares/purchaseShares
     * @secure
     */
    postFollowSharesPurchaseShares: (
      followPurchaseShares: FollowPurchaseSharesVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/followShares/purchaseShares`,
        method: "POST",
        body: followPurchaseShares,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入followRedeemShares
     *
     * @tags 跟单账户接口
     * @name PostFollowSharesRedeemShares
     * @summary 取款赎回
     * @request POST:/coreApi/followShares/redeemShares
     * @secure
     */
    postFollowSharesRedeemShares: (
      followRedeemShares: FollowRedeemSharesVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/followShares/redeemShares`,
        method: "POST",
        body: followRedeemShares,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 账户跟单份额详情
     *
     * @tags 跟单账户接口
     * @name GetFollowsharesSharesdetail
     * @summary 账户跟单详情
     * @request GET:/coreApi/followShares/sharesDetail
     * @secure
     */
    getFollowsharesSharesdetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        followSharesId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RAccountManage, void>({
        path: `/coreApi/followShares/sharesDetail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  holiday = {
    /**
     * @description 传入holiday
     *
     * @tags 假期日历接口
     * @name GetHolidayDetail
     * @summary 假期日历-详情
     * @request GET:/coreApi/holiday/detail
     * @secure
     */
    getHolidayDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RHoliday, void>({
        path: `/coreApi/holiday/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入holiday
     *
     * @tags 假期日历接口
     * @name GetHolidayList
     * @summary 假期日历-分页
     * @request GET:/coreApi/holiday/list
     * @secure
     */
    getHolidayList: (
      query?: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageHoliday, void>({
        path: `/coreApi/holiday/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags 假期日历接口
     * @name PostHolidayRemove
     * @summary 假期日历-删除
     * @request POST:/coreApi/holiday/remove
     * @secure
     */
    postHolidayRemove: (
      query: {
        /** 主键集合 */
        ids: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/holiday/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入holiday
     *
     * @tags 假期日历接口
     * @name PostHolidaySubmit
     * @summary 假期日历-新增或修改
     * @request POST:/coreApi/holiday/submit
     * @secure
     */
    postHolidaySubmit: (holiday: Holiday, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/holiday/submit`,
        method: "POST",
        body: holiday,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入symbols
     *
     * @tags 假期日历接口
     * @name GetHolidaySymbolisholiday
     * @summary 假期日历-判断品种当前是否在假期
     * @request GET:/coreApi/holiday/symbolIsHoliday
     * @secure
     */
    getHolidaySymbolisholiday: (
      query: {
        /** 品种集合 */
        symbols: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RMapStringBoolean, void>({
        path: `/coreApi/holiday/symbolIsHoliday`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  lbPool = {
    /**
     * @description 传入lbPool
     *
     * @tags LB池接口
     * @name PostLbPoolAdd
     * @summary 新增
     * @request POST:/coreApi/lbPool/add
     * @secure
     */
    postLbPoolAdd: (lbPoolAdd: LbPoolAddVO, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/lbPool/add`,
        method: "POST",
        body: lbPoolAdd,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入lbPool
     *
     * @tags LB池接口
     * @name GetLbpoolDetail
     * @summary 详情
     * @request GET:/coreApi/lbPool/detail
     * @secure
     */
    getLbpoolDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RLbPool, void>({
        path: `/coreApi/lbPool/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入lbPool
     *
     * @tags LB池接口
     * @name PostLbPoolInit
     * @summary 初始化链上账户
     * @request POST:/coreApi/lbPool/init
     * @secure
     */
    postLbPoolInit: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/lbPool/init`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入lbPool
     *
     * @tags LB池接口
     * @name GetLbpoolList
     * @summary 分页
     * @request GET:/coreApi/lbPool/list
     * @secure
     */
    getLbpoolList: (
      query?: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageLbPool, void>({
        path: `/coreApi/lbPool/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags LB池接口
     * @name PostLbPoolRemove
     * @summary 删除
     * @request POST:/coreApi/lbPool/remove
     * @secure
     */
    postLbPoolRemove: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/lbPool/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags LB池接口
     * @name PostLbPoolSymbolGroup
     * @summary 交易品种-账户组配置
     * @request POST:/coreApi/lbPool/symbol-group
     * @secure
     */
    postLbPoolSymbolGroup: (params: RequestParams = {}) =>
      this.http.request<RSetObject, void>({
        path: `/coreApi/lbPool/symbol-group`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入lbPool
     *
     * @tags LB池接口
     * @name PostLbPoolUpdate
     * @summary 修改
     * @request POST:/coreApi/lbPool/update
     * @secure
     */
    postLbPoolUpdate: (
      lbPoolUpdate: LbPoolUpdateVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/lbPool/update`,
        method: "POST",
        body: lbPoolUpdate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  orders = {
    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name PostOrdersAddMargin
     * @summary 持仓订单-追加逐仓保证金
     * @request POST:/coreApi/orders/addMargin
     * @secure
     */
    postOrdersAddMargin: (orderAddMargin: _8, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/orders/addMargin`,
        method: "POST",
        body: orderAddMargin,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入持仓单ID
     *
     * @tags 订单接口
     * @name GetOrdersAlldetail
     * @summary 持仓订单-全部详情
     * @request GET:/coreApi/orders/allDetail
     * @secure
     */
    getOrdersAlldetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBagOrder, void>({
        path: `/coreApi/orders/allDetail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入bagOrder
     *
     * @tags 订单接口
     * @name GetOrdersBgaorderpageList
     * @summary 持仓订单-分页
     * @request GET:/coreApi/orders/bgaOrderPage
     * @secure
     */
    getOrdersBgaorderpageList: (
      query?: {
        /**
         * 交易账户ID
         * @pattern ^(?:\d+)?$
         */
        accountId?: string;
        /**
         * 持仓订单号ID
         * @pattern ^(?:\d+)?$
         */
        bagOrderId?: string;
        /**
         * 持仓时间（秒）
         * @format int32
         */
        bagOrderTime?: number;
        /** 订单方向 */
        buySell?: GetOrdersBgaorderpageListParamsBuySellEnum;
        /**
         * 客户ID
         * @pattern ^(?:\d+)?$
         */
        clientId?: string;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /** 邮箱或者手机号 */
        emailOrPhone?: string;
        /**
         * 结束时间
         * @format date-time
         */
        endTime?: string;
        /** 是否模拟，false真实，true模拟 */
        isSimulate?: boolean;
        /** 保证金类型 */
        marginType?: GetOrdersBgaorderpageListParamsMarginTypeEnum;
        /** 订单模式 */
        mode?: GetOrdersBgaorderpageListParamsModeEnum;
        /** 排序 */
        orderBy?: GetOrdersBgaorderpageListParamsOrderByEnum;
        /** 排序字段 */
        orderByField?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 开始时间
         * @format date-time
         */
        startTime?: string;
        /** 状态 */
        status?: GetOrdersBgaorderpageListParamsStatusEnum;
        /** 交易品种 */
        symbol?: string;
        /** 客户UID */
        userAccount?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageBagOrder, void>({
        path: `/coreApi/orders/bgaOrderPage`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入bagOrder
     *
     * @tags 订单接口
     * @name GetOrdersBgaorderpriceprofit
     * @summary 持仓订单-报价&盈亏
     * @request GET:/coreApi/orders/bgaOrderPriceProfit
     * @secure
     */
    getOrdersBgaorderpriceprofit: (
      query: {
        /** 交易账户ID-交易品种-账户组ID-持仓单ID（多个用','隔开） */
        asgoArrayStr: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RJSONObject, void>({
        path: `/coreApi/orders/bgaOrderPriceProfit`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name PostOrdersCreateOrder
     * @summary 委托订单-下单
     * @request POST:/coreApi/orders/createOrder
     * @secure
     */
    postOrdersCreateOrder: (orderCreate: _5, params: RequestParams = {}) =>
      this.http.request<ROrders, void>({
        path: `/coreApi/orders/createOrder`,
        method: "POST",
        body: orderCreate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 订单接口
     * @name GetOrdersCrosshigh
     * @summary 【全仓】追加预付款账户【敏感账户】
     * @request GET:/coreApi/orders/crossHigh
     * @secure
     */
    getOrdersCrosshigh: (params: RequestParams = {}) =>
      this.http.request<RListAccountHighVO, void>({
        path: `/coreApi/orders/crossHigh`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name PostOrdersExtractMargin
     * @summary 持仓订单-提取逐仓保证金
     * @request POST:/coreApi/orders/extractMargin
     * @secure
     */
    postOrdersExtractMargin: (
      orderExtractMargin: _7,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/orders/extractMargin`,
        method: "POST",
        body: orderExtractMargin,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 订单接口
     * @name GetOrdersIsolatedhigh
     * @summary 【逐仓】追加预付款订单【敏感订单】
     * @request GET:/coreApi/orders/isolatedHigh
     * @secure
     */
    getOrdersIsolatedhigh: (params: RequestParams = {}) =>
      this.http.request<RListOrderHighVO, void>({
        path: `/coreApi/orders/isolatedHigh`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 订单接口
     * @name PostOrdersNewOrderMargin
     * @summary 委托订单-计算新订单保证金
     * @request POST:/coreApi/orders/newOrderMargin
     * @secure
     */
    postOrdersNewOrderMargin: (orderCreate: _5, params: RequestParams = {}) =>
      this.http.request<RString, void>({
        path: `/coreApi/orders/newOrderMargin`,
        method: "POST",
        body: orderCreate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name PostOrdersOrderCancel
     * @summary 委托订单-取消
     * @request POST:/coreApi/orders/orderCancel
     * @secure
     */
    postOrdersOrderCancel: (
      query: {
        /**
         * 订单id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/orders/orderCancel`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入订单ID
     *
     * @tags 订单接口
     * @name GetOrdersOrderdetail
     * @summary 委托订单-详情
     * @request GET:/coreApi/orders/orderDetail
     * @secure
     */
    getOrdersOrderdetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<ROrders1, void>({
        path: `/coreApi/orders/orderDetail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name PostOrdersOrderEdit
     * @summary 委托订单-修改
     * @request POST:/coreApi/orders/orderEdit
     * @secure
     */
    postOrdersOrderEdit: (orderEdit: _2, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/orders/orderEdit`,
        method: "POST",
        body: orderEdit,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name GetOrdersOrderpageList
     * @summary 委托订单-分页
     * @request GET:/coreApi/orders/orderPage
     * @secure
     */
    getOrdersOrderpageList: (
      query?: {
        /**
         * 交易账户ID
         * @pattern ^(?:\d+)?$
         */
        accountId?: string;
        /** 订单方向 */
        buySell?: GetOrdersOrderpageListParamsBuySellEnum;
        /**
         * 客户ID
         * @pattern ^(?:\d+)?$
         */
        clientId?: string;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /** 邮箱或者手机号 */
        emailOrPhone?: string;
        /**
         * 结束时间
         * @format date-time
         */
        endTime?: string;
        /** 是否模拟，false真实，true模拟 */
        isSimulate?: boolean;
        /** 保证金类型 */
        marginType?: GetOrdersOrderpageListParamsMarginTypeEnum;
        /** 订单模式 */
        mode?: GetOrdersOrderpageListParamsModeEnum;
        /** 排序 */
        orderBy?: GetOrdersOrderpageListParamsOrderByEnum;
        /** 排序字段 */
        orderByField?: string;
        /**
         * 订单号ID
         * @pattern ^(?:\d+)?$
         */
        orderId?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 开始时间
         * @format date-time
         */
        startTime?: string;
        /** 状态 */
        status?: string;
        /** 交易品种 */
        symbol?: string;
        /** 订单类型 */
        type?: string;
        /** 客户UID */
        userAccount?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageOrders, void>({
        path: `/coreApi/orders/orderPage`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入orders
     *
     * @tags 订单接口
     * @name PostOrdersStopProfitLoss
     * @summary 持仓订单-修改止盈止损
     * @request POST:/coreApi/orders/stopProfitLoss
     * @secure
     */
    postOrdersStopProfitLoss: (
      stopProfitLossVO: _3,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/orders/stopProfitLoss`,
        method: "POST",
        body: stopProfitLossVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入tradeRecords
     *
     * @tags 订单接口
     * @name GetOrdersTraderecordspageList
     * @summary 成交记录-分页
     * @request GET:/coreApi/orders/tradeRecordsPage
     * @secure
     */
    getOrdersTraderecordspageList: (
      query?: {
        /**
         * 交易账户ID
         * @pattern ^(?:\d+)?$
         */
        accountId?: string;
        /**
         * 持仓订单ID
         * @pattern ^(?:\d+)?$
         */
        bagOrderId?: string;
        /**
         * 客户ID
         * @pattern ^(?:\d+)?$
         */
        clientId?: string;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /** 邮箱或者手机号 */
        emailOrPhone?: string;
        /**
         * 结束时间
         * @format date-time
         */
        endTime?: string;
        /** 成交方向 */
        inOut?: GetOrdersTraderecordspageListParamsInOutEnum;
        /** 是否模拟，false真实，true模拟 */
        isSimulate?: boolean;
        /** 排序 */
        orderBy?: GetOrdersTraderecordspageListParamsOrderByEnum;
        /** 排序字段 */
        orderByField?: string;
        /**
         * 订单ID
         * @pattern ^(?:\d+)?$
         */
        orderId?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 开始时间
         * @format date-time
         */
        startTime?: string;
        /** 交易品种 */
        symbol?: string;
        /**
         * 成交单号ID
         * @pattern ^(?:\d+)?$
         */
        tradeRecordsId?: string;
        /** 客户UID */
        userAccount?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageTradeRecords, void>({
        path: `/coreApi/orders/tradeRecordsPage`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  public = {
    /**
     * @description 传入
     *
     * @tags 公开接口接口
     * @name GetPublicLpRedeemapply
     * @summary Lp池MXLP代币赎回申请
     * @request GET:/coreApi/public/lp/redeemApply
     * @secure
     */
    getPublicLpRedeemapply: (
      query: {
        /** address */
        address: string;
        /** applySignature */
        applySignature?: string;
        /** mxlpPrice */
        mxlpPrice: number;
        /** redeemMxlp */
        redeemMxlp: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/coreApi/public/lp/redeemApply`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 公开接口接口
     * @name GetPublicSymbolHoliday
     * @summary 判断品种是否是假期
     * @request GET:/coreApi/public/symbol/holiday
     * @secure
     */
    getPublicSymbolHoliday: (
      query: {
        /** symbol */
        symbol: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/coreApi/public/symbol/holiday`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入null
     *
     * @tags 公开接口接口
     * @name GetPublicTestGetip
     * @summary 测试获取IP
     * @request GET:/coreApi/public/test/getIp
     * @secure
     */
    getPublicTestGetip: (params: RequestParams = {}) =>
      this.http.request<RString, void>({
        path: `/coreApi/public/test/getIp`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入null
     *
     * @tags 公开接口接口
     * @name GetPublicTestI18N
     * @summary 测试国际化
     * @request GET:/coreApi/public/test/i18n
     * @secure
     */
    getPublicTestI18N: (
      query: {
        /** key */
        key: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RString, void>({
        path: `/coreApi/public/test/i18n`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入null
     *
     * @tags 公开接口接口
     * @name GetPublicTestOrderby
     * @summary 测试排序
     * @request GET:/coreApi/public/test/orderBy
     * @secure
     */
    getPublicTestOrderby: (
      query: {
        /** field */
        field: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RString, void>({
        path: `/coreApi/public/test/orderBy`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入null
     *
     * @tags 公开接口接口
     * @name GetPublicTestTimeconvert
     * @summary 测试时间转换
     * @request GET:/coreApi/public/test/timeConvert
     * @secure
     */
    getPublicTestTimeconvert: (
      query: {
        /**
         * moneyRecordsId
         * @format int64
         */
        moneyRecordsId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RMoneyRecords, void>({
        path: `/coreApi/public/test/timeConvert`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  symbolGroup = {
    /**
     * @description 传入id
     *
     * @tags 交易品种组接口
     * @name PostSymbolGroupRemove
     * @summary 交易品种组-删除
     * @request POST:/coreApi/symbolGroup/remove
     * @secure
     */
    postSymbolGroupRemove: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/symbolGroup/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入symbolGroup
     *
     * @tags 交易品种组接口
     * @name PostSymbolGroupSubmit
     * @summary 交易品种组-新增或修改
     * @request POST:/coreApi/symbolGroup/submit
     * @secure
     */
    postSymbolGroupSubmit: (
      symbolGroup: SymbolGroup,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/symbolGroup/submit`,
        method: "POST",
        body: symbolGroup,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 树形结构
     *
     * @tags 交易品种组接口
     * @name GetSymbolgroupTree
     * @summary 交易品种组-树形结构
     * @request GET:/coreApi/symbolGroup/tree
     * @secure
     */
    getSymbolgroupTree: (params: RequestParams = {}) =>
      this.http.request<RListSymbolGroup, void>({
        path: `/coreApi/symbolGroup/tree`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  symbols = {
    /**
     * @description 传入symbols
     *
     * @tags 交易品种接口
     * @name PostSymbolsAdd
     * @summary 交易品种-新增
     * @request POST:/coreApi/symbols/add
     * @secure
     */
    postSymbolsAdd: (symbolAndConfAdd: _4, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/symbols/add`,
        method: "POST",
        body: symbolAndConfAdd,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易品种接口
     * @name GetSymbolsDetail
     * @summary 交易品种-详情
     * @request GET:/coreApi/symbols/detail
     * @secure
     */
    getSymbolsDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RSymbols1, void>({
        path: `/coreApi/symbols/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入symbols
     *
     * @tags 交易品种接口
     * @name GetSymbolsList
     * @summary 交易品种-分页
     * @request GET:/coreApi/symbols/list
     * @secure
     */
    getSymbolsList: (params: RequestParams = {}) =>
      this.http.request<RListSymbols1, void>({
        path: `/coreApi/symbols/list`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入symbols
     *
     * @tags 交易品种接口
     * @name GetSymbolsPageList
     * @summary 交易品种-自定义分页
     * @request GET:/coreApi/symbols/page
     * @secure
     */
    getSymbolsPageList: (
      query?: {
        /** 交易-计算类型 */
        calculationType?: GetSymbolsPageListParamsCalculationTypeEnum;
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /** 备注 */
        remark?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /** 状态 */
        status?: GetSymbolsPageListParamsStatusEnum;
        /** 品种名称 */
        symbol?: string;
        /**
         * 品种组ID
         * @format int64
         */
        symbolGroupId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageSymbols, void>({
        path: `/coreApi/symbols/page`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 交易品种接口
     * @name PostSymbolsRemove
     * @summary 交易品种-删除
     * @request POST:/coreApi/symbols/remove
     * @secure
     */
    postSymbolsRemove: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/coreApi/symbols/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入symbol
     *
     * @tags 交易品种接口
     * @name GetSymbolsSymbolDetail
     * @summary 交易品种-详情
     * @request GET:/coreApi/symbols/symbol/detail
     * @secure
     */
    getSymbolsSymbolDetail: (
      query: {
        /** symbol */
        symbol: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RSymbols, void>({
        path: `/coreApi/symbols/symbol/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 树形结构
     *
     * @tags 交易品种接口
     * @name GetSymbolsTree
     * @summary 交易品种-树形结构
     * @request GET:/coreApi/symbols/tree
     * @secure
     */
    getSymbolsTree: (params: RequestParams = {}) =>
      this.http.request<RJSONArray, void>({
        path: `/coreApi/symbols/tree`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入symbols
     *
     * @tags 交易品种接口
     * @name PostSymbolsUpdate
     * @summary 交易品种-修改
     * @request POST:/coreApi/symbols/update
     * @secure
     */
    postSymbolsUpdate: (symbolAndConfUpdate: _, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/symbols/update`,
        method: "POST",
        body: symbolAndConfUpdate,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  systemSet = {
    /**
     * @description 传入manager
     *
     * @tags 系统参数设置接口
     * @name GetSystemsetDetail
     * @summary 系统参数-详情
     * @request GET:/coreApi/systemSet/detail
     * @secure
     */
    getSystemsetDetail: (params: RequestParams = {}) =>
      this.http.request<R_, void>({
        path: `/coreApi/systemSet/detail`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 系统参数设置接口
     * @name GetSystemsetLanguage
     * @summary 多语言国际化查询
     * @request GET:/coreApi/systemSet/language
     * @secure
     */
    getSystemsetLanguage: (
      query: {
        /** 多语言key */
        key: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<string, void>({
        path: `/coreApi/systemSet/language`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 系统参数设置接口
     * @name PostSystemSetUpdate
     * @summary 系统参数-修改
     * @request POST:/coreApi/systemSet/update
     * @secure
     */
    postSystemSetUpdate: (systemSetVO: _6, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/coreApi/systemSet/update`,
        method: "POST",
        body: systemSetVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
