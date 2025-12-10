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

/** ClientEmailBindVO */
export interface ClientEmailBindVO {
  /** 邮箱 */
  email: string;
  /**
   * 邮箱验证码
   * @format int32
   */
  emailCode: number;
}

/** ClientEmailEditVO */
export interface ClientEmailEditVO {
  /** 新邮箱 */
  newEmail: string;
  /**
   * 新邮箱验证码
   * @format int32
   */
  newEmailCode: number;
  /**
   * 旧邮箱验证码
   * @format int32
   */
  oldEmailCode: number;
}

/** ClientForgePasswordVO */
export interface ClientForgePasswordVO {
  /** 邮箱或者手机 */
  emailOrPhone: string;
  /** 新密码 */
  newPassword: string;
  /**
   * 验证码
   * @format int32
   */
  validateCode: number;
}

/** ClientGroupDetailVO */
export interface ClientGroupDetailVO {
  /** 账户组ID */
  accountGroupId?: string;
  /** 识别码 */
  code?: string;
  /** 组名称 */
  groupName?: string;
  /**
   * 主健ID
   * @format int64
   */
  id?: number;
  /** KYC认证 */
  kycAuth?: ClientGroupDetailVoKycAuthEnum;
  /** 支付方式 */
  payWay?: string;
  /** 注册方式 */
  registerWay?: ClientGroupDetailVoRegisterWayEnum;
  /** 备注 */
  remark?: string;
  /**
   * 出金申请次数
   * @format int32
   */
  withdrawalLimitCount?: number;
  /**
   * 出金判断周期
   * @format int32
   */
  withdrawalLimitCycle?: number;
  /** 出金金额（累计） */
  withdrawalLimitMoney?: number;
  /** 出金方式 */
  withdrawalWay?: string;
}

/** ClientGroupSaveVO */
export interface ClientGroupSaveVO {
  /** 账户组ID */
  accountGroupId: string;
  /** 识别码 */
  code: string;
  /** 组名称 */
  groupName: string;
  /**
   * 主健ID
   * @format int64
   */
  id?: number;
  /** KYC认证 */
  kycAuth: ClientGroupSaveVoKycAuthEnum;
  /** 支付方式 */
  payWay: string;
  /** 注册方式 */
  registerWay: ClientGroupSaveVoRegisterWayEnum;
  /** 备注 */
  remark?: string;
  /**
   * 出金申请次数
   * @format int32
   */
  withdrawalLimitCount?: number;
  /**
   * 出金判断周期
   * @format int32
   */
  withdrawalLimitCycle?: number;
  /** 出金金额（累计） */
  withdrawalLimitMoney?: number;
  /** 出金方式 */
  withdrawalWay?: string;
}

/** ClientPasswordEditVO */
export interface ClientPasswordEditVO {
  /** 新密码 */
  newPassword: string;
  /**
   * 验证码
   * @format int32
   */
  validateCode: number;
}

/** ClientPhoneBindVO */
export interface ClientPhoneBindVO {
  /** 手机 */
  phone: string;
  /** 手机号码区域代码 */
  phoneAreaCode: string;
  /**
   * 手机验证码
   * @format int32
   */
  phoneCode: number;
}

/** ClientPhoneEditVO */
export interface ClientPhoneEditVO {
  /** 新手机 */
  newPhone: string;
  /**
   * 新手机验证码
   * @format int32
   */
  newPhoneCode: number;
  /**
   * 旧手机验证码
   * @format int32
   */
  oldPhoneCode: number;
  /** 手机号码区域代码 */
  phoneAreaCode: string;
}

/** ClientRegusterSubmitVO */
export interface ClientRegusterSubmitVO {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /**
   * 渠道Id
   * @format int64
   */
  channelId?: number;
  /** 渠道名称 */
  channelName?: string;
  /** 识别码 */
  code: string;
  /** 国家 */
  country?: string;
  /** 邮箱或者手机 */
  emailOrPhone: string;
  /** 注册邀请码 */
  invitationCode?: string;
  /** 密码【加密】 */
  password: string;
  /** 手机号码区域代码 */
  phoneAreaCode?: string;
  /**
   * 验证码
   * @format int32
   */
  validateCode: number;
}

/** ClientSaveVO */
export interface ClientSaveVO {
  /**
   * 账户组ID
   * @format int64
   */
  accountGroupId?: number;
  /** 地址 */
  address?: string;
  /** 头像 */
  avatar?: string;
  /**
   * 生日
   * @format date-time
   */
  birthday?: string;
  /**
   * 渠道Id
   * @format int64
   */
  channelId?: number;
  /** 渠道名称 */
  channelName?: string;
  /**
   * 客户组ID
   * @format int64
   */
  clientGroupId?: number;
  /** 国家 */
  country?: string;
  /** 邮箱 */
  email?: string;
  /**
   * 主健ID
   * @format int64
   */
  id?: number;
  /** 昵称 */
  name?: string;
  /** 密码 */
  password?: string;
  /** 手机 */
  phone?: string;
  /** 手机号码区域代码 */
  phoneAreaCode?: string;
  /** 第三方钱包用户唯一标识 */
  privyId?: string;
  /** 真名 */
  realName?: string;
  /** 备注 */
  remark?: string;
  /**
   * 性别
   * @format int32
   */
  sex?: number;
  /** 状态 */
  status?: ClientSaveVoStatusEnum;
  /**
   * 用户类型
   * @format int32
   */
  userType?: number;
}

/** ClientUpdateVO */
export interface ClientUpdateVO {
  /** 地址 */
  address?: string;
  /** 头像 */
  avatar?: string;
  /**
   * 生日
   * @format date-time
   */
  birthday?: string;
  /**
   * 客户组ID
   * @format int64
   */
  clientGroupId?: number;
  /** 国家 */
  country?: string;
  /** 邮箱 */
  email?: string;
  /**
   * 主健ID
   * @format int64
   */
  id?: number;
  /** 昵称 */
  name?: string;
  /** 密码 */
  password?: string;
  /** 手机 */
  phone?: string;
  /** 手机号码区域代码 */
  phoneAreaCode?: string;
  /** 真名 */
  realName?: string;
  /** 备注 */
  remark?: string;
  /**
   * 性别
   * @format int32
   */
  sex?: number;
  /** 状态 */
  status?: ClientUpdateVoStatusEnum;
}

/** DetectAuthResponse */
export interface DetectAuthResponse {
  bizToken?: string;
  header?: Record<string, string>;
  requestId?: string;
  skipSign?: boolean;
  stream?: boolean;
  url?: string;
}

/** FaceAuthDTO */
export interface FaceAuthDTO {
  /** 身份证号 */
  idCard?: string;
  /** 姓名 */
  name?: string;
  /** 人脸识别后跳传的URL */
  redirectUrl?: string;
}

/** FaceAuthUpdateDTO */
export interface FaceAuthUpdateDTO {
  bizToken?: string;
}

/** GoogleSecretVo */
export interface GoogleSecretVo {
  /**
   * 谷歌绑定状态：0-未绑定；1-已绑定
   * @format int32
   */
  googleStatus?: number;
  /** 二维码 */
  qrCode?: string;
  /** 谷歌秘钥 */
  secret?: string;
}

/** KeyValueVO */
export interface KeyValueVO {
  /** key */
  key?: string;
  /** value */
  value?: string;
}

/** ManagerDTO */
export interface ManagerDTO {
  /** 账号 */
  account?: string;
  /** 头像 */
  avatar?: string;
  /**
   * 生日
   * @format date-time
   */
  birthday?: string;
  /** 客户组 */
  clientGroup?: string;
  /** 用户编号 */
  code?: string;
  /**
   * 创建部门
   * @format int64
   */
  createDept?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 创建人
   * @format int64
   */
  createUser?: number;
  /** 部门id */
  deptId?: string;
  /** 邮箱 */
  email?: string;
  /** 谷歌验证秘钥 */
  googleSecretKey?: string;
  /**
   * 谷歌验证状态
   * @format int32
   */
  googleStatus?: number;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** IP白名单 */
  ipWhitelist?: string;
  /**
   * 是否已删除
   * @format int32
   */
  isDeleted?: number;
  /** 语言 */
  language?: string;
  /** 最后登录地址 */
  lastLoginAddress?: string;
  /** 最后登录IP */
  lastLoginIp?: string;
  /**
   * 最后登录时间
   * @format date-time
   */
  lastLoginTime?: string;
  /** 昵称 */
  name?: string;
  /** 手机 */
  phone?: string;
  /** 手机号码区域代码 */
  phoneAreaCode?: string;
  /** 岗位id */
  postId?: string;
  /** privyId用户唯一标识 */
  privyId?: string;
  /** 真名 */
  realName?: string;
  /** 备注 */
  remark?: string;
  /** 角色别名 */
  roleAlias?: string;
  /** 角色id */
  roleId?: string;
  /**
   * 性别
   * @format int32
   */
  sex?: number;
  /**
   * 业务状态
   * @format int32
   */
  status?: number;
  /** 租户ID */
  tenantId?: string;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /**
   * 更新人
   * @format int64
   */
  updateUser?: number;
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
  /**
   * 用户平台
   * @format int32
   */
  userType?: number;
}

/** ManagerSaveVO */
export interface ManagerSaveVO {
  /** 账号 */
  account: string;
  /** 头像 */
  avatar?: string;
  /**
   * 生日
   * @format date-time
   */
  birthday?: string;
  /** 客户组 */
  clientGroup?: string;
  /** 邮箱 */
  email?: string;
  /**
   * 主健ID
   * @format int64
   */
  id?: number;
  /** IP白名单 */
  ipWhitelist?: string;
  /** 昵称 */
  name?: string;
  /** 密码【加密】 */
  password?: string;
  /** 手机 */
  phone?: string;
  /** 手机号码区域代码 */
  phoneAreaCode?: string;
  /** 真名 */
  realName?: string;
  /** 备注 */
  remark?: string;
  /** 角色id */
  roleId: string;
  /**
   * 性别
   * @format int32
   */
  sex?: number;
  /**
   * 状态
   * @format int32
   */
  status?: number;
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

/** ResetGoogleDTO */
export interface ResetGoogleDTO {
  /**
   * 用户ID
   * @format int64
   */
  userId?: number;
}

/** Type */
export interface Type {
  typeName?: string;
}

/** User */
export interface User {
  /** 账号 */
  account?: string;
  /** 头像 */
  avatar?: string;
  /**
   * 生日
   * @format date-time
   */
  birthday?: string;
  /** 用户编号 */
  code?: string;
  /**
   * 创建部门
   * @format int64
   */
  createDept?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 创建人
   * @format int64
   */
  createUser?: number;
  /** 部门id */
  deptId?: string;
  /** 邮箱 */
  email?: string;
  /** 谷歌验证秘钥 */
  googleSecretKey?: string;
  /**
   * 谷歌验证状态（0-未绑定；1-已绑定）
   * @format int32
   */
  googleStatus?: number;
  /**
   * 主键id
   * @format int64
   */
  id?: number;
  /**
   * 是否已删除
   * @format int32
   */
  isDeleted?: number;
  /** 语言 */
  language?: string;
  /** 最后登录地址 */
  lastLoginAddress?: string;
  /** 最后登录IP */
  lastLoginIp?: string;
  /**
   * 最后登录时间
   * @format date-time
   */
  lastLoginTime?: string;
  /** 昵称 */
  name?: string;
  /** 密码 */
  password?: string;
  /** 手机 */
  phone?: string;
  /** 手机号码区域代码 */
  phoneAreaCode?: string;
  /** 岗位id */
  postId?: string;
  /** privyId用户唯一标识 */
  privyId?: string;
  /** 真名 */
  realName?: string;
  /** 角色id */
  roleId?: string;
  /**
   * 性别
   * @format int32
   */
  sex?: number;
  /**
   * 业务状态
   * @format int32
   */
  status?: number;
  /** 租户ID */
  tenantId?: string;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /**
   * 更新人
   * @format int64
   */
  updateUser?: number;
  /**
   * 用户平台
   * @format int32
   */
  userType?: number;
}

/** VerifySecretDTO */
export interface VerifySecretDTO {
  /** 谷歌验证码 */
  googleCode?: string;
  /** 秘钥 */
  secret?: string;
  /**
   * 用户ID不能为空
   * @format int64
   */
  userId?: number;
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
 * BankCard对象
 * 银行卡
 */
export interface BankCard {
  /**
   * 审核时间
   * @format date-time
   */
  auditTime?: string;
  /**
   * 审核人ID
   * @format int64
   */
  auditUserId?: number;
  /** 认证图片 */
  authImgsUrl?: string;
  /** 银行卡号 */
  bankCardCode?: string;
  /** 银行卡类型 */
  bankCardType?: BankCardBankCardTypeEnum;
  /** 银行名称 */
  bankName?: string;
  /**
   * 客户ID
   * @format int64
   */
  clientId?: number;
  /** 开户行 */
  createBank?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdTime?: string;
  /** 持卡人 */
  holder?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: BankCardStatusEnum;
}

/**
 * BankCard对象_1
 * 银行卡提交审核
 */
export interface BankCard1 {
  /** 认证图片 */
  authImgsUrl: string;
  /** 银行卡号 */
  bankCardCode: string;
  /** 银行卡类型 */
  bankCardType: BankCard1BankCardTypeEnum;
  /** 银行名称 */
  bankName: string;
  /** 开户行 */
  createBank: string;
  /** 持卡人 */
  holder: string;
}

/**
 * BaseAuthSubmitVO对象
 * 基础认证-提交审核
 */
export interface BaseAuthSubmitVO {
  /** 国家 */
  country?: string;
  /** 名(名字) */
  firstName: string;
  /** 证件号 */
  identificationCode: string;
  /** 证件类型 */
  identificationType: BaseAuthSubmitVoIdentificationTypeEnum;
  /** 姓(姓氏) */
  lastName: string;
}

/**
 * ClientAccountListVO对象
 * 客户交易账户
 */
export interface ClientAccountListVO {
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
  /**
   * 货币小数位
   * @format int32
   */
  currencyDecimal?: number;
  /** 货币单位 */
  currencyUnit?: string;
  /** 启用链接 */
  enableConnect?: boolean;
  /** 启用逐仓 */
  enableIsolated?: boolean;
  /** 启用交易 */
  enableTrade?: boolean;
  /** 资金划转 */
  fundTransfer?: ClientAccountListVoFundTransferEnum;
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
  orderMode?: ClientAccountListVoOrderModeEnum;
  /** PDA代币账户 */
  pdaTokenAddress?: string;
  /** 智能合约ID */
  programId?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: ClientAccountListVoStatusEnum;
  /** 简介 */
  synopsis?: string;
  /** 总盈亏 */
  totalProfitLoss?: number;
  /** 账户类型 */
  type?: ClientAccountListVoTypeEnum;
  /** 可用预付款 */
  usableAdvanceCharge?: ClientAccountListVoUsableAdvanceChargeEnum;
}

/**
 * ClientGroup对象
 * 客户用户组
 */
export interface ClientGroup {
  /** 账户组ID */
  accountGroupId?: string;
  /** 识别码 */
  code?: string;
  /**
   * 创建部门
   * @format int64
   */
  createDept?: number;
  /**
   * 创建时间
   * @format date-time
   */
  createTime?: string;
  /**
   * 创建人
   * @format int64
   */
  createUser?: number;
  /** 组名称 */
  groupName?: string;
  /**
   * 主键id
   * @format int64
   */
  id?: number;
  /**
   * 是否已删除
   * @format int32
   */
  isDeleted?: number;
  /** 是否KYC认证 */
  kycAuth?: ClientGroupKycAuthEnum;
  /** 支付方式 */
  payWay?: string;
  /** 注册方式 */
  registerWay?: ClientGroupRegisterWayEnum;
  /** 备注 */
  remark?: string;
  /**
   * 状态
   * @format int32
   */
  status?: number;
  /** 租户ID */
  tenantId?: string;
  /**
   * 更新时间
   * @format date-time
   */
  updateTime?: string;
  /**
   * 更新人
   * @format int64
   */
  updateUser?: number;
  /**
   * 出金申请次数
   * @format int32
   */
  withdrawalLimitCount?: number;
  /**
   * 出金判断周期
   * @format int32
   */
  withdrawalLimitCycle?: number;
  /** 出金金额（累计） */
  withdrawalLimitMoney?: number;
  /** 出金方式 */
  withdrawalWay?: string;
}

/**
 * Client对象
 * 客户
 */
export interface Client {
  /** 客户交易账户 */
  accountList?: ClientAccountListVO[];
  /** 地址 */
  address?: string;
  /** 银行卡认证信息 */
  bankCardAuth?: BankCard[];
  /** bizToken */
  bizToken?: string;
  /**
   * 客户组ID
   * @format int64
   */
  clientGroupId?: number;
  /** 国家 */
  country?: string;
  /** 国家信息 */
  countryInfo?: Country;
  /** 名(名字) */
  firstName: string;
  /** 业务线名称 */
  groupName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 证件号 */
  identificationCode: string;
  /** 证件类型 */
  identificationType: ClientIdentificationTypeEnum;
  /** 是否绑定银行卡 */
  isBankcardBind?: boolean;
  /** 是否基础认证 */
  isBaseAuth?: boolean;
  /** 是否KYC认证 */
  isKycAuth?: boolean;
  /** KYC认证信息 */
  kycAuth?: KycAuth[];
  /**
   * KYC身份认证ID
   * @format int64
   */
  kycAuthId?: number;
  /** 姓(姓氏) */
  lastName: string;
  /** 备注 */
  remark?: string;
  /** PASS认证通过，WAIT待审核 */
  status?: ClientStatusEnum;
  /** 用户信息 */
  userInfo?: User;
}

/**
 * Client对象_1
 * 客户
 */
export interface Client1 {
  /** 交易账户统计 */
  accountCount?: AccountCountVO;
  /** 客户交易账户 */
  accountList?: ClientAccountListVO[];
  /** 地址 */
  address?: string;
  /** 银行卡认证信息 */
  bankCardAuth?: BankCard[];
  /** bizToken */
  bizToken?: string;
  /** 业务线信息 */
  clientGroup?: ClientGroupDetailVO;
  /**
   * 客户组ID
   * @format int64
   */
  clientGroupId?: number;
  /** 国家 */
  country?: string;
  /** 国家信息 */
  countryInfo?: Country;
  /** 名(名字) */
  firstName: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 证件号 */
  identificationCode: string;
  /** 证件类型 */
  identificationType: Client1IdentificationTypeEnum;
  /** 是否绑定银行卡 */
  isBankcardBind?: boolean;
  /** 是否基础认证 */
  isBaseAuth?: boolean;
  /** 是否KYC认证 */
  isKycAuth?: boolean;
  /** KYC认证信息 */
  kycAuth?: KycAuth[];
  /**
   * KYC身份认证ID
   * @format int64
   */
  kycAuthId?: number;
  /** 姓(姓氏) */
  lastName: string;
  /** 备注 */
  remark?: string;
  /** 用户信息 */
  userInfo?: User;
}

/**
 * Country对象
 * 国家
 */
export interface Country {
  /** 缩码 */
  abbr?: string;
  /** 国际电话区号 */
  areaCode?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 国家(地区)名(简体) */
  nameCn?: string;
  /** 国家(地区)名(英文) */
  nameEn?: string;
  /** 国家(地区)名(繁体) */
  nameTw?: string;
  /** 备注 */
  remark?: string;
  /**
   * 排序
   * @format int32
   */
  sort?: number;
}

/**
 * DictBizVO对象
 * DictBizVO对象
 */
export interface DictBizVO {
  children?: DictBizVO[];
  /** 字典码 */
  code?: string;
  /** 字典值 */
  dictKey?: string;
  /** 字典名称 */
  dictValue?: string;
  hasChildren?: boolean;
  /** @format int64 */
  id?: number;
  /**
   * 是否已删除
   * @format int32
   */
  isDeleted?: number;
  /**
   * 是否已封存
   * @format int32
   */
  isSealed?: number;
  /** @format int64 */
  parentId?: number;
  parentName?: string;
  /** 字典备注 */
  remark?: string;
  /**
   * 排序
   * @format int32
   */
  sort?: number;
  /** 租户ID */
  tenantId?: string;
}

/** IPage«BankCard对象» */
export interface IPageBankCard {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: BankCard[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«ClientGroup对象» */
export interface IPageClientGroup {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: ClientGroup[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«Client对象» */
export interface IPageClient {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: Client[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«KycAuth对象» */
export interface IPageKycAuth {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: KycAuth[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/** IPage«ManagerDTO» */
export interface IPageManagerDTO {
  /** @format int64 */
  current?: number;
  /** @format int64 */
  pages?: number;
  records?: ManagerDTO[];
  /** @format int64 */
  size?: number;
  /** @format int64 */
  total?: number;
}

/**
 * KycAuthSubmitVO对象
 * KYC身份认证提交审核
 */
export interface KycAuthSubmitVO {
  /** 认证图片 */
  authImgsUrl: string;
  /** 国家 */
  country?: string;
  /** 名(名字) */
  firstName: string;
  /** 证件号 */
  identificationCode: string;
  /** 证件类型 */
  identificationType: KycAuthSubmitVoIdentificationTypeEnum;
  /** 姓(姓氏) */
  lastName: string;
}

/**
 * KycAuth对象
 * KYC身份认证
 */
export interface KycAuth {
  /**
   * 审核时间
   * @format date-time
   */
  auditTime?: string;
  /**
   * 审核人ID
   * @format int64
   */
  auditUserId?: number;
  /** 认证图片 */
  authImgsUrl?: string;
  /**
   * 客户ID
   * @format int64
   */
  clientId?: number;
  /** 国家 */
  country?: string;
  /**
   * 创建时间
   * @format date-time
   */
  createdTime?: string;
  /** 名(名字) */
  firstName?: string;
  /**
   * 主键
   * @format int64
   */
  id?: number;
  /** 证件号 */
  identificationCode?: string;
  /** 证件类型 */
  identificationType?: KycAuthIdentificationTypeEnum;
  /** 姓(姓氏) */
  lastName?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: KycAuthStatusEnum;
}

/**
 * R«BankCard对象»
 * 返回信息
 */
export interface RBankCard {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: BankCard;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«ClientGroupDetailVO»
 * 返回信息
 */
export interface RClientGroupDetailVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: ClientGroupDetailVO;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«ClientGroup对象»
 * 返回信息
 */
export interface RClientGroup {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: ClientGroup;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«Client对象»
 * 返回信息
 */
export interface RClient {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Client1;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«DetectAuthResponse»
 * 返回信息
 */
export interface RDetectAuthResponse {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: DetectAuthResponse;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«GoogleSecretVo»
 * 返回信息
 */
export interface RGoogleSecretVo {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: GoogleSecretVo;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«BankCard对象»»
 * 返回信息
 */
export interface RIPageBankCard {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageBankCard;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«ClientGroup对象»»
 * 返回信息
 */
export interface RIPageClientGroup {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageClientGroup;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«Client对象»»
 * 返回信息
 */
export interface RIPageClient {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageClient;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«KycAuth对象»»
 * 返回信息
 */
export interface RIPageKycAuth {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageKycAuth;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«IPage«ManagerDTO»»
 * 返回信息
 */
export interface RIPageManagerDTO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: IPageManagerDTO;
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
 * R«KycAuth对象»
 * 返回信息
 */
export interface RKycAuth {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: KycAuth;
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«AccountGroup对象»»
 * 返回信息
 */
export interface RListAccountGroup {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: AccountGroup[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«Country对象»»
 * 返回信息
 */
export interface RListCountry {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: Country[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«DictBizVO对象»»
 * 返回信息
 */
export interface RListDictBizVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: DictBizVO[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«List«KeyValueVO»»
 * 返回信息
 */
export interface RListKeyValueVO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: KeyValueVO[];
  /** 返回消息 */
  msg: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * R«ManagerDTO»
 * 返回信息
 */
export interface RManagerDTO {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /** 承载数据 */
  data?: ManagerDTO;
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
 * R«int»
 * 返回信息
 */
export interface RInt {
  /**
   * 状态码
   * @format int32
   */
  code: number;
  /**
   * 承载数据
   * @format int32
   */
  data?: number;
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
 * 审核对象
 * 审核
 */
export interface _ {
  /**
   * 审核ID
   * @format int64
   */
  id: number;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status: StatusEnum;
}

/**
 * 密码提交
 * 密码提交
 */
export interface _2 {
  /** 密码 */
  password: string;
  /**
   * 用户id
   * @format int64
   */
  userId: number;
}

/** KYC认证 */
export type ClientGroupDetailVoKycAuthEnum =
  | "NOT"
  | "UPLOAD_INFO_AUTH"
  | "TENCENT_THREE_AUTH"
  | "TENCENT_FACE_AUTH";

/** 注册方式 */
export type ClientGroupDetailVoRegisterWayEnum = "PHONE" | "EMAIL";

/** KYC认证 */
export type ClientGroupSaveVoKycAuthEnum =
  | "NOT"
  | "UPLOAD_INFO_AUTH"
  | "TENCENT_THREE_AUTH"
  | "TENCENT_FACE_AUTH";

/** 注册方式 */
export type ClientGroupSaveVoRegisterWayEnum = "PHONE" | "EMAIL";

/** 状态 */
export type ClientSaveVoStatusEnum = "ENABLE" | "DISABLED";

/** 状态 */
export type ClientUpdateVoStatusEnum = "ENABLE" | "DISABLED";

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

/** 银行卡类型 */
export type BankCardBankCardTypeEnum = "DEBIT_CARD" | "CREDIT_CARD";

/** 状态 */
export type BankCardStatusEnum = "TODO" | "SUCCESS" | "DISALLOW" | "CANCEL";

/** 银行卡类型 */
export type BankCard1BankCardTypeEnum = "DEBIT_CARD" | "CREDIT_CARD";

/** 证件类型 */
export type BaseAuthSubmitVoIdentificationTypeEnum =
  | "ID_CARD"
  | "PASSPORT"
  | "DRIVER_LICENSE";

/** 资金划转 */
export type ClientAccountListVoFundTransferEnum = "ALLOWABLE" | "PROHIBIT";

/** 订单模式 */
export type ClientAccountListVoOrderModeEnum = "NETTING" | "LOCKED_POSITION";

/** 状态 */
export type ClientAccountListVoStatusEnum = "DISABLED" | "ENABLE";

/** 账户类型 */
export type ClientAccountListVoTypeEnum = "MAIN" | "SIMULATE" | "FOLLOW";

/** 可用预付款 */
export type ClientAccountListVoUsableAdvanceChargeEnum =
  | "NOT_PROFIT_LOSS"
  | "PROFIT_LOSS";

/** 是否KYC认证 */
export type ClientGroupKycAuthEnum =
  | "NOT"
  | "UPLOAD_INFO_AUTH"
  | "TENCENT_THREE_AUTH"
  | "TENCENT_FACE_AUTH";

/** 注册方式 */
export type ClientGroupRegisterWayEnum = "PHONE" | "EMAIL";

/** 证件类型 */
export type ClientIdentificationTypeEnum =
  | "ID_CARD"
  | "PASSPORT"
  | "DRIVER_LICENSE";

/** PASS认证通过，WAIT待审核 */
export type ClientStatusEnum = "PASS" | "WAIT";

/** 证件类型 */
export type Client1IdentificationTypeEnum =
  | "ID_CARD"
  | "PASSPORT"
  | "DRIVER_LICENSE";

/** 证件类型 */
export type KycAuthSubmitVoIdentificationTypeEnum =
  | "ID_CARD"
  | "PASSPORT"
  | "DRIVER_LICENSE";

/** 证件类型 */
export type KycAuthIdentificationTypeEnum =
  | "ID_CARD"
  | "PASSPORT"
  | "DRIVER_LICENSE";

/** 状态 */
export type KycAuthStatusEnum = "TODO" | "SUCCESS" | "DISALLOW" | "CANCEL";

/** 状态 */
export type StatusEnum = "TODO" | "SUCCESS" | "DISALLOW" | "CANCEL";

/** 状态 */
export type GetClientListParamsStatusEnum =
  | "TODO"
  | "SUCCESS"
  | "DISALLOW"
  | "CANCEL";

export namespace BankCard {
  /**
   * @description 传入ID
   * @tags 银行卡绑定接口
   * @name GetBankcardDetail
   * @summary 银行卡绑定-详情
   * @request GET:/crmApi/bankCard/detail
   * @secure
   */
  export namespace GetBankcardDetail {
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
    export type ResponseBody = RBankCard;
  }

  /**
   * @description 传入bankCard
   * @tags 银行卡绑定接口
   * @name GetBankcardList
   * @summary 银行卡绑定-分页
   * @request GET:/crmApi/bankCard/list
   * @secure
   */
  export namespace GetBankcardList {
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
    export type ResponseBody = RIPageBankCard;
  }

  /**
   * @description 传入id
   * @tags 银行卡绑定接口
   * @name PostBankCardRemove
   * @summary 银行卡绑定-删除
   * @request POST:/crmApi/bankCard/remove
   * @secure
   */
  export namespace PostBankCardRemove {
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
   * @description 传入examineVO
   * @tags 银行卡绑定接口
   * @name PostBankCardUpdate
   * @summary 银行卡绑定-审核
   * @request POST:/crmApi/bankCard/update
   * @secure
   */
  export namespace PostBankCardUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace Client {
  /**
   * @description 传入manager
   * @tags 客户接口
   * @name GetClientDetail
   * @summary 客户用户-详情
   * @request GET:/crmApi/client/detail
   * @secure
   */
  export namespace GetClientDetail {
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
    export type ResponseBody = RClient;
  }

  /**
   * @description 传入manager
   * @tags 客户接口
   * @name GetClientList
   * @summary 客户用户-分页
   * @request GET:/crmApi/client/list
   * @secure
   */
  export namespace GetClientList {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 用户UID */
      account?: string;
      /** 交易账户组ID */
      accountGroupId?: string;
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
      /** 邮箱 */
      email?: string;
      /** 邮箱或手机 */
      emailOrPhone?: string;
      /**
       * 注册结束时间
       * @format date-time
       */
      endTime?: string;
      /** 业务线 */
      groupName?: string;
      /** 是否绑定银行卡 */
      isBankcardBind?: boolean;
      /** 是否基础认证 */
      isBaseAuth?: boolean;
      /** 是否KYC认证 */
      isKycAuth?: boolean;
      /** 姓名 */
      name?: string;
      /** 手机 */
      phone?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /**
       * 注册开始时间
       * @format date-time
       */
      startTime?: string;
      /** 状态 */
      status?: GetClientListParamsStatusEnum;
      /**
       * 交易账户ID
       * @format int64
       */
      tradeAccountId?: number;
      /** 客户登录账号 */
      userAccount?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageClient;
  }

  /**
   * @description 传入ids
   * @tags 客户接口
   * @name PostClientRemove
   * @summary 客户用户-逻辑删除
   * @request POST:/crmApi/client/remove
   * @secure
   */
  export namespace PostClientRemove {
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
   * @description 传入manager
   * @tags 客户接口
   * @name PostClientSubmit
   * @summary 客户用户-新增
   * @request POST:/crmApi/client/submit
   * @secure
   */
  export namespace PostClientSubmit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientSaveVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入manager
   * @tags 客户接口
   * @name PostClientUpdate
   * @summary 客户用户-修改
   * @request POST:/crmApi/client/update
   * @secure
   */
  export namespace PostClientUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientUpdateVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * No description
   * @tags 客户信息
   * @name GetClientGetuserkyc
   * @summary 客户用户-kyc认证，true为认证，false
   * @request GET:/crmClient/client/getUserKyc
   * @secure
   */
  export namespace GetClientGetuserkyc {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }
}

export namespace ClientGroup {
  /**
   * @description 传入clientGroup
   * @tags 客户用户组接口
   * @name GetClientgroupDetail
   * @summary 客户用户组-详情
   * @request GET:/crmApi/clientGroup/detail
   * @secure
   */
  export namespace GetClientgroupDetail {
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
    export type ResponseBody = RClientGroup;
  }

  /**
   * @description 传入clientGroup
   * @tags 客户用户组接口
   * @name GetClientgroupList
   * @summary 客户用户组-分页
   * @request GET:/crmApi/clientGroup/list
   * @secure
   */
  export namespace GetClientgroupList {
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
    export type ResponseBody = RIPageClientGroup;
  }

  /**
   * @description 传入ids
   * @tags 客户用户组接口
   * @name PostClientGroupRemove
   * @summary 客户用户组-逻辑删除
   * @request POST:/crmApi/clientGroup/remove
   * @secure
   */
  export namespace PostClientGroupRemove {
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
   * @description 传入clientGroup
   * @tags 客户用户组接口
   * @name PostClientGroupSubmit
   * @summary 客户用户组-新增或修改
   * @request POST:/crmApi/clientGroup/submit
   * @secure
   */
  export namespace PostClientGroupSubmit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientGroupSaveVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace KycAuth {
  /**
   * @description 传入id
   * @tags KYC认证接口
   * @name GetKycauthDetail
   * @summary KYC认证-详情
   * @request GET:/crmApi/kycAuth/detail
   * @secure
   */
  export namespace GetKycauthDetail {
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
    export type ResponseBody = RKycAuth;
  }

  /**
   * @description 传入kycAuth
   * @tags KYC认证接口
   * @name PostKycAuthExamine
   * @summary KYC认证-审核
   * @request POST:/crmApi/kycAuth/examine
   * @secure
   */
  export namespace PostKycAuthExamine {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入kycAuth
   * @tags KYC认证接口
   * @name GetKycauthList
   * @summary KYC认证-分页
   * @request GET:/crmApi/kycAuth/list
   * @secure
   */
  export namespace GetKycauthList {
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
    export type ResponseBody = RIPageKycAuth;
  }

  /**
   * @description 传入ids
   * @tags KYC认证接口
   * @name PostKycAuthRemove
   * @summary KYC认证-删除
   * @request POST:/crmApi/kycAuth/remove
   * @secure
   */
  export namespace PostKycAuthRemove {
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
}

export namespace Manager {
  /**
   * No description
   * @tags 系统用户接口
   * @name GetManagerCheckgooglecode
   * @summary 登录成功验证谷歌验证码
   * @request GET:/crmApi/manager/checkGoogleCode
   * @secure
   */
  export namespace GetManagerCheckgooglecode {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 谷歌验证码 */
      googleCode?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 用户ID
   * @tags 系统用户接口
   * @name PostManagerCreateGoogleScret
   * @summary 创建/获取谷歌验证秘钥
   * @request POST:/crmApi/manager/createGoogleScret
   * @secure
   */
  export namespace PostManagerCreateGoogleScret {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 用户ID
       * @format int64
       */
      userId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RGoogleSecretVo;
  }

  /**
   * @description 传入manager
   * @tags 系统用户接口
   * @name GetManagerDetail
   * @summary 系统用户-详情
   * @request GET:/crmApi/manager/detail
   * @secure
   */
  export namespace GetManagerDetail {
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
    export type ResponseBody = RManagerDTO;
  }

  /**
   * No description
   * @tags 系统用户接口
   * @name GetManagerIsbind
   * @summary 是否已绑定谷歌验证码
   * @request GET:/crmApi/manager/isBind
   * @secure
   */
  export namespace GetManagerIsbind {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 用户ID
       * @format int64
       */
      userId: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入manager
   * @tags 系统用户接口
   * @name GetManagerList
   * @summary 系统用户-分页
   * @request GET:/crmApi/manager/list
   * @secure
   */
  export namespace GetManagerList {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * 当前页
       * @format int32
       */
      current?: number;
      /**
       * 经理ID
       * @format int64
       */
      managerId?: number;
      /** 姓名 */
      name?: string;
      /**
       * 每页的数量
       * @format int32
       */
      size?: number;
      /** 经理登录账号 */
      userAccount?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RIPageManagerDTO;
  }

  /**
   * @description 传入ids
   * @tags 系统用户接口
   * @name PostManagerRemove
   * @summary 系统用户-逻辑删除
   * @request POST:/crmApi/manager/remove
   * @secure
   */
  export namespace PostManagerRemove {
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
   * No description
   * @tags 系统用户接口
   * @name PostManagerResetMchGoogle
   * @summary 重置谷歌验证码
   * @request POST:/crmApi/manager/resetMchGoogle
   * @secure
   */
  export namespace PostManagerResetMchGoogle {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ResetGoogleDTO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 获取角色树
   * @tags 系统用户接口
   * @name GetManagerRoleFunction
   * @summary 获取角色树
   * @request GET:/crmApi/manager/role-function
   * @secure
   */
  export namespace GetManagerRoleFunction {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RJSONArray;
  }

  /**
   * @description 传入manager
   * @tags 系统用户接口
   * @name PostManagerSubmit
   * @summary 系统用户-新增
   * @request POST:/crmApi/manager/submit
   * @secure
   */
  export namespace PostManagerSubmit {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ManagerSaveVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入manager
   * @tags 系统用户接口
   * @name PostManagerUpdate
   * @summary 系统用户-修改
   * @request POST:/crmApi/manager/update
   * @secure
   */
  export namespace PostManagerUpdate {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ManagerSaveVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * No description
   * @tags 系统用户接口
   * @name PostManagerVerifyGoogleScret
   * @summary 绑定谷歌验证码
   * @request POST:/crmApi/manager/verifyGoogleScret
   * @secure
   */
  export namespace PostManagerVerifyGoogleScret {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifySecretDTO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace User {
  /**
   * @description 传入
   * @tags 用户操作接口
   * @name PostUserEditPassword
   * @summary 用户-修改密码
   * @request POST:/crmApi/user/editPassword
   * @secure
   */
  export namespace PostUserEditPassword {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _2;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 用户操作接口
   * @name PostUserSetLanguage
   * @summary 用户-设置语言
   * @request POST:/crmApi/user/setLanguage
   * @secure
   */
  export namespace PostUserSetLanguage {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 语言 */
      language: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 用户操作接口
   * @name PostUserValidatePassword
   * @summary 用户-验证密码
   * @request POST:/crmApi/user/validatePassword
   * @secure
   */
  export namespace PostUserValidatePassword {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = _2;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入bankCard
   * @tags 客户用户接口
   * @name PostUserBankCard
   * @summary 银行卡-提交审核
   * @request POST:/crmClient/user/bankCard
   * @secure
   */
  export namespace PostUserBankCard {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BankCard1;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入ids
   * @tags 客户用户接口
   * @name PostUserBaseAuth
   * @summary 基础认证-提交
   * @request POST:/crmClient/user/baseAuth
   * @secure
   */
  export namespace PostUserBaseAuth {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BaseAuthSubmitVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name PostUserBindEmail
   * @summary 客户用户-绑定邮箱
   * @request POST:/crmClient/user/bindEmail
   * @secure
   */
  export namespace PostUserBindEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientEmailBindVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name PostUserBindPhone
   * @summary 客户用户-绑定手机号
   * @request POST:/crmClient/user/bindPhone
   * @secure
   */
  export namespace PostUserBindPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientPhoneBindVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name GetUserDetail
   * @summary 客户用户-详情
   * @request GET:/crmClient/user/detail
   * @secure
   */
  export namespace GetUserDetail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RClient;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name PostUserEditEmail
   * @summary 客户用户-更换邮箱
   * @request POST:/crmClient/user/editEmail
   * @secure
   */
  export namespace PostUserEditEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientEmailEditVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name PostUserEditPasswordEmail
   * @summary 客户用户-修改密码【邮箱】
   * @request POST:/crmClient/user/editPasswordEmail
   * @secure
   */
  export namespace PostUserEditPasswordEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientPasswordEditVO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name PostUserEditPasswordPhone
   * @summary 客户用户-修改密码【手机】
   * @request POST:/crmClient/user/editPasswordPhone
   * @secure
   */
  export namespace PostUserEditPasswordPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientPasswordEditVO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name PostUserEditPhone
   * @summary 客户用户-更换手机号
   * @request POST:/crmClient/user/editPhone
   * @secure
   */
  export namespace PostUserEditPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientPhoneEditVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户接口
   * @name GetUserGetuserkycflag
   * @summary 当前登录用户是否KYC认证,true是，false否
   * @request GET:/crmClient/user/getUserKycFlag
   * @secure
   */
  export namespace GetUserGetuserkycflag {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入kycAuth
   * @tags 客户用户接口
   * @name PostUserKycAuth
   * @summary KYC身份认证-提交审核
   * @request POST:/crmClient/user/kycAuth
   * @secure
   */
  export namespace PostUserKycAuth {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = KycAuthSubmitVO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入认证图片
   * @tags 客户用户接口
   * @name PostUserSeniorAuth
   * @summary 高级认证-提交审核
   * @request POST:/crmClient/user/seniorAuth
   * @secure
   */
  export namespace PostUserSeniorAuth {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 认证图片 */
      authImgsUrl: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace Account {
  /**
   * @description 传入manager
   * @tags 客户交易账户接口
   * @name GetAccountAccountgroup
   * @summary 客户用户-交易账户组
   * @request GET:/crmClient/account/accountGroup
   * @secure
   */
  export namespace GetAccountAccountgroup {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 是否模拟 */
      isSimulate?: boolean;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListAccountGroup;
  }
}

export namespace Face {
  /**
   * @description 传入
   * @tags 人脸核身接口
   * @name PostFaceGetFaceAuthUrl
   * @summary 获取人脸核身URL
   * @request POST:/crmClient/face/getFaceAuthUrl
   * @secure
   */
  export namespace PostFaceGetFaceAuthUrl {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FaceAuthDTO;
    export type RequestHeaders = {};
    export type ResponseBody = RDetectAuthResponse;
  }

  /**
   * @description 传入
   * @tags 人脸核身接口
   * @name PostFaceUpdateFaceResult
   * @summary 触发跳传后调的接口
   * @request POST:/crmClient/face/updateFaceResult
   * @secure
   */
  export namespace PostFaceUpdateFaceResult {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FaceAuthUpdateDTO;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }
}

export namespace Public {
  /**
   * @description 传入识别码
   * @tags 公开参数接口
   * @name GetPublicClientgroup
   * @summary 获取客户组信息
   * @request GET:/crmClient/public/clientGroup/{code}
   * @secure
   */
  export namespace GetPublicClientgroup {
    export type RequestParams = {
      /** code */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RClientGroupDetailVO;
  }

  /**
   * @description 传入
   * @tags 公开参数接口
   * @name GetPublicCountrylist
   * @summary 获取国家信息
   * @request GET:/crmClient/public/countryList
   * @secure
   */
  export namespace GetPublicCountrylist {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListCountry;
  }

  /**
   * @description 传入
   * @tags 公开参数接口
   * @name GetPublicDict
   * @summary 获取系统字典
   * @request GET:/crmClient/public/dict/{code}
   * @secure
   */
  export namespace GetPublicDict {
    export type RequestParams = {
      /** code */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListKeyValueVO;
  }

  /**
   * @description 传入
   * @tags 公开参数接口
   * @name GetPublicDictbiz
   * @summary 获取业务字典
   * @request GET:/crmClient/public/dictBiz/{code}
   * @secure
   */
  export namespace GetPublicDictbiz {
    export type RequestParams = {
      /** code */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListKeyValueVO;
  }

  /**
   * @description 获取业务字典树
   * @tags 公开参数接口
   * @name GetPublicDictionarytree
   * @summary 获取业务字典树
   * @request GET:/crmClient/public/dictionaryTree/{code}
   * @secure
   */
  export namespace GetPublicDictionarytree {
    export type RequestParams = {
      /** code */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RListDictBizVO;
  }

  /**
   * @description 传入
   * @tags 公开参数接口
   * @name GetPublicParam
   * @summary 获取参数配置
   * @request GET:/crmClient/public/param/{code}
   * @secure
   */
  export namespace GetPublicParam {
    export type RequestParams = {
      /** code */
      code: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RString;
  }
}

export namespace Register {
  /**
   * @description 传入
   * @tags 客户用户注册接口
   * @name PostRegisterForgetPasswordEmail
   * @summary 客户用户-忘记密码【邮箱】
   * @request POST:/crmClient/register/forgetPasswordEmail
   * @secure
   */
  export namespace PostRegisterForgetPasswordEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientForgePasswordVO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入
   * @tags 客户用户注册接口
   * @name PostRegisterForgetPasswordPhone
   * @summary 客户用户-忘记密码【手机】
   * @request POST:/crmClient/register/forgetPasswordPhone
   * @secure
   */
  export namespace PostRegisterForgetPasswordPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientForgePasswordVO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入
   * @tags 客户用户注册接口
   * @name PostRegisterSubmitEmail
   * @summary 客户用户-邮箱注册
   * @request POST:/crmClient/register/submitEmail
   * @secure
   */
  export namespace PostRegisterSubmitEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientRegusterSubmitVO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }

  /**
   * @description 传入
   * @tags 客户用户注册接口
   * @name PostRegisterSubmitPhone
   * @summary 客户用户-手机注册
   * @request POST:/crmClient/register/submitPhone
   * @secure
   */
  export namespace PostRegisterSubmitPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ClientRegusterSubmitVO;
    export type RequestHeaders = {};
    export type ResponseBody = RBoolean;
  }
}

export namespace ValidateCode {
  /**
   * @description 传入
   * @tags 客户用户验证码接口
   * @name PostValidateCodeCustomEmail
   * @summary 发送验证码-邮箱
   * @request POST:/crmClient/validateCode/customEmail
   * @secure
   */
  export namespace PostValidateCodeCustomEmail {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 邮箱 */
      email: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RInt;
  }

  /**
   * @description 传入
   * @tags 客户用户验证码接口
   * @name PostValidateCodeCustomPhone
   * @summary 发送验证码-手机
   * @request POST:/crmClient/validateCode/customPhone
   * @secure
   */
  export namespace PostValidateCodeCustomPhone {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 手机号 */
      phone: string;
      /** 电话区号 */
      phoneAreaCode: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户验证码接口
   * @name GetValidatecodeGetphone
   * @summary 查询手机号是否存在
   * @request GET:/crmClient/validateCode/getPhone
   * @secure
   */
  export namespace GetValidatecodeGetphone {
    export type RequestParams = {};
    export type RequestQuery = {
      /** 手机号 */
      phone: string;
      /** 电话区号 */
      phoneAreaCode: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = R;
  }

  /**
   * @description 传入
   * @tags 客户用户验证码接口
   * @name PostValidateCodeUserEmail
   * @summary 发送验证码-用户邮箱
   * @request POST:/crmClient/validateCode/userEmail
   * @secure
   */
  export namespace PostValidateCodeUserEmail {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RInt;
  }

  /**
   * @description 传入
   * @tags 客户用户验证码接口
   * @name PostValidateCodeUserPhone
   * @summary 发送验证码-用户手机
   * @request POST:/crmClient/validateCode/userPhone
   * @secure
   */
  export namespace PostValidateCodeUserPhone {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RInt;
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
  public baseUrl: string = "//172.31.27.8:8000/trade-crm";
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

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
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
 * @baseUrl //172.31.27.8:8000/trade-crm
 * @contact 翼宿 <bladejava@qq.com> (https://gitee.com/smallc)
 *
 * BladeX 接口文档系统
 */
export class TradeCrmApi<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  bankCard = {
    /**
     * @description 传入ID
     *
     * @tags 银行卡绑定接口
     * @name GetBankcardDetail
     * @summary 银行卡绑定-详情
     * @request GET:/crmApi/bankCard/detail
     * @secure
     */
    getBankcardDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBankCard, void>({
        path: `/crmApi/bankCard/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入bankCard
     *
     * @tags 银行卡绑定接口
     * @name GetBankcardList
     * @summary 银行卡绑定-分页
     * @request GET:/crmApi/bankCard/list
     * @secure
     */
    getBankcardList: (
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
      this.http.request<RIPageBankCard, void>({
        path: `/crmApi/bankCard/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入id
     *
     * @tags 银行卡绑定接口
     * @name PostBankCardRemove
     * @summary 银行卡绑定-删除
     * @request POST:/crmApi/bankCard/remove
     * @secure
     */
    postBankCardRemove: (
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
        path: `/crmApi/bankCard/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入examineVO
     *
     * @tags 银行卡绑定接口
     * @name PostBankCardUpdate
     * @summary 银行卡绑定-审核
     * @request POST:/crmApi/bankCard/update
     * @secure
     */
    postBankCardUpdate: (examineVO: _, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/crmApi/bankCard/update`,
        method: "POST",
        body: examineVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  client = {
    /**
     * @description 传入manager
     *
     * @tags 客户接口
     * @name GetClientDetail
     * @summary 客户用户-详情
     * @request GET:/crmApi/client/detail
     * @secure
     */
    getClientDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RClient, void>({
        path: `/crmApi/client/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 客户接口
     * @name GetClientList
     * @summary 客户用户-分页
     * @request GET:/crmApi/client/list
     * @secure
     */
    getClientList: (
      query?: {
        /** 用户UID */
        account?: string;
        /** 交易账户组ID */
        accountGroupId?: string;
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
        /** 邮箱 */
        email?: string;
        /** 邮箱或手机 */
        emailOrPhone?: string;
        /**
         * 注册结束时间
         * @format date-time
         */
        endTime?: string;
        /** 业务线 */
        groupName?: string;
        /** 是否绑定银行卡 */
        isBankcardBind?: boolean;
        /** 是否基础认证 */
        isBaseAuth?: boolean;
        /** 是否KYC认证 */
        isKycAuth?: boolean;
        /** 姓名 */
        name?: string;
        /** 手机 */
        phone?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /**
         * 注册开始时间
         * @format date-time
         */
        startTime?: string;
        /** 状态 */
        status?: GetClientListParamsStatusEnum;
        /**
         * 交易账户ID
         * @format int64
         */
        tradeAccountId?: number;
        /** 客户登录账号 */
        userAccount?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageClient, void>({
        path: `/crmApi/client/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags 客户接口
     * @name PostClientRemove
     * @summary 客户用户-逻辑删除
     * @request POST:/crmApi/client/remove
     * @secure
     */
    postClientRemove: (
      query: {
        /** 主键集合 */
        ids: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/client/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 客户接口
     * @name PostClientSubmit
     * @summary 客户用户-新增
     * @request POST:/crmApi/client/submit
     * @secure
     */
    postClientSubmit: (
      clientSaveVO: ClientSaveVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/client/submit`,
        method: "POST",
        body: clientSaveVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 客户接口
     * @name PostClientUpdate
     * @summary 客户用户-修改
     * @request POST:/crmApi/client/update
     * @secure
     */
    postClientUpdate: (
      clientUpdateVO: ClientUpdateVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/client/update`,
        method: "POST",
        body: clientUpdateVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 客户信息
     * @name GetClientGetuserkyc
     * @summary 客户用户-kyc认证，true为认证，false
     * @request GET:/crmClient/client/getUserKyc
     * @secure
     */
    getClientGetuserkyc: (params: RequestParams = {}) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/client/getUserKyc`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  clientGroup = {
    /**
     * @description 传入clientGroup
     *
     * @tags 客户用户组接口
     * @name GetClientgroupDetail
     * @summary 客户用户组-详情
     * @request GET:/crmApi/clientGroup/detail
     * @secure
     */
    getClientgroupDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RClientGroup, void>({
        path: `/crmApi/clientGroup/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入clientGroup
     *
     * @tags 客户用户组接口
     * @name GetClientgroupList
     * @summary 客户用户组-分页
     * @request GET:/crmApi/clientGroup/list
     * @secure
     */
    getClientgroupList: (
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
      this.http.request<RIPageClientGroup, void>({
        path: `/crmApi/clientGroup/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags 客户用户组接口
     * @name PostClientGroupRemove
     * @summary 客户用户组-逻辑删除
     * @request POST:/crmApi/clientGroup/remove
     * @secure
     */
    postClientGroupRemove: (
      query: {
        /** 主键集合 */
        ids: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/clientGroup/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入clientGroup
     *
     * @tags 客户用户组接口
     * @name PostClientGroupSubmit
     * @summary 客户用户组-新增或修改
     * @request POST:/crmApi/clientGroup/submit
     * @secure
     */
    postClientGroupSubmit: (
      clientGroupSaveVO: ClientGroupSaveVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/clientGroup/submit`,
        method: "POST",
        body: clientGroupSaveVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  kycAuth = {
    /**
     * @description 传入id
     *
     * @tags KYC认证接口
     * @name GetKycauthDetail
     * @summary KYC认证-详情
     * @request GET:/crmApi/kycAuth/detail
     * @secure
     */
    getKycauthDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RKycAuth, void>({
        path: `/crmApi/kycAuth/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入kycAuth
     *
     * @tags KYC认证接口
     * @name PostKycAuthExamine
     * @summary KYC认证-审核
     * @request POST:/crmApi/kycAuth/examine
     * @secure
     */
    postKycAuthExamine: (examineVO: _, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/crmApi/kycAuth/examine`,
        method: "POST",
        body: examineVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入kycAuth
     *
     * @tags KYC认证接口
     * @name GetKycauthList
     * @summary KYC认证-分页
     * @request GET:/crmApi/kycAuth/list
     * @secure
     */
    getKycauthList: (
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
      this.http.request<RIPageKycAuth, void>({
        path: `/crmApi/kycAuth/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags KYC认证接口
     * @name PostKycAuthRemove
     * @summary KYC认证-删除
     * @request POST:/crmApi/kycAuth/remove
     * @secure
     */
    postKycAuthRemove: (
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
        path: `/crmApi/kycAuth/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  manager = {
    /**
     * No description
     *
     * @tags 系统用户接口
     * @name GetManagerCheckgooglecode
     * @summary 登录成功验证谷歌验证码
     * @request GET:/crmApi/manager/checkGoogleCode
     * @secure
     */
    getManagerCheckgooglecode: (
      query?: {
        /** 谷歌验证码 */
        googleCode?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmApi/manager/checkGoogleCode`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 用户ID
     *
     * @tags 系统用户接口
     * @name PostManagerCreateGoogleScret
     * @summary 创建/获取谷歌验证秘钥
     * @request POST:/crmApi/manager/createGoogleScret
     * @secure
     */
    postManagerCreateGoogleScret: (
      query: {
        /**
         * 用户ID
         * @format int64
         */
        userId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RGoogleSecretVo, void>({
        path: `/crmApi/manager/createGoogleScret`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 系统用户接口
     * @name GetManagerDetail
     * @summary 系统用户-详情
     * @request GET:/crmApi/manager/detail
     * @secure
     */
    getManagerDetail: (
      query: {
        /**
         * 主键id
         * @format int64
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RManagerDTO, void>({
        path: `/crmApi/manager/detail`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 系统用户接口
     * @name GetManagerIsbind
     * @summary 是否已绑定谷歌验证码
     * @request GET:/crmApi/manager/isBind
     * @secure
     */
    getManagerIsbind: (
      query: {
        /**
         * 用户ID
         * @format int64
         */
        userId: number;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmApi/manager/isBind`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 系统用户接口
     * @name GetManagerList
     * @summary 系统用户-分页
     * @request GET:/crmApi/manager/list
     * @secure
     */
    getManagerList: (
      query?: {
        /**
         * 当前页
         * @format int32
         */
        current?: number;
        /**
         * 经理ID
         * @format int64
         */
        managerId?: number;
        /** 姓名 */
        name?: string;
        /**
         * 每页的数量
         * @format int32
         */
        size?: number;
        /** 经理登录账号 */
        userAccount?: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RIPageManagerDTO, void>({
        path: `/crmApi/manager/list`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags 系统用户接口
     * @name PostManagerRemove
     * @summary 系统用户-逻辑删除
     * @request POST:/crmApi/manager/remove
     * @secure
     */
    postManagerRemove: (
      query: {
        /** 主键集合 */
        ids: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/manager/remove`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 系统用户接口
     * @name PostManagerResetMchGoogle
     * @summary 重置谷歌验证码
     * @request POST:/crmApi/manager/resetMchGoogle
     * @secure
     */
    postManagerResetMchGoogle: (
      resetGoogleDTO: ResetGoogleDTO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmApi/manager/resetMchGoogle`,
        method: "POST",
        body: resetGoogleDTO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 获取角色树
     *
     * @tags 系统用户接口
     * @name GetManagerRoleFunction
     * @summary 获取角色树
     * @request GET:/crmApi/manager/role-function
     * @secure
     */
    getManagerRoleFunction: (params: RequestParams = {}) =>
      this.http.request<RJSONArray, void>({
        path: `/crmApi/manager/role-function`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 系统用户接口
     * @name PostManagerSubmit
     * @summary 系统用户-新增
     * @request POST:/crmApi/manager/submit
     * @secure
     */
    postManagerSubmit: (
      managerSaveVO: ManagerSaveVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/manager/submit`,
        method: "POST",
        body: managerSaveVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入manager
     *
     * @tags 系统用户接口
     * @name PostManagerUpdate
     * @summary 系统用户-修改
     * @request POST:/crmApi/manager/update
     * @secure
     */
    postManagerUpdate: (
      managerSaveVO: ManagerSaveVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/manager/update`,
        method: "POST",
        body: managerSaveVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 系统用户接口
     * @name PostManagerVerifyGoogleScret
     * @summary 绑定谷歌验证码
     * @request POST:/crmApi/manager/verifyGoogleScret
     * @secure
     */
    postManagerVerifyGoogleScret: (
      verifySecretDTO: VerifySecretDTO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/manager/verifyGoogleScret`,
        method: "POST",
        body: verifySecretDTO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  user = {
    /**
     * @description 传入
     *
     * @tags 用户操作接口
     * @name PostUserEditPassword
     * @summary 用户-修改密码
     * @request POST:/crmApi/user/editPassword
     * @secure
     */
    postUserEditPassword: (passwordSubmit: _2, params: RequestParams = {}) =>
      this.http.request<R, void>({
        path: `/crmApi/user/editPassword`,
        method: "POST",
        body: passwordSubmit,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 用户操作接口
     * @name PostUserSetLanguage
     * @summary 用户-设置语言
     * @request POST:/crmApi/user/setLanguage
     * @secure
     */
    postUserSetLanguage: (
      query: {
        /** 语言 */
        language: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/user/setLanguage`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 用户操作接口
     * @name PostUserValidatePassword
     * @summary 用户-验证密码
     * @request POST:/crmApi/user/validatePassword
     * @secure
     */
    postUserValidatePassword: (
      passwordSubmit: _2,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmApi/user/validatePassword`,
        method: "POST",
        body: passwordSubmit,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入bankCard
     *
     * @tags 客户用户接口
     * @name PostUserBankCard
     * @summary 银行卡-提交审核
     * @request POST:/crmClient/user/bankCard
     * @secure
     */
    postUserBankCard: (
      bankCardSubmitVO: BankCard1,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/bankCard`,
        method: "POST",
        body: bankCardSubmitVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入ids
     *
     * @tags 客户用户接口
     * @name PostUserBaseAuth
     * @summary 基础认证-提交
     * @request POST:/crmClient/user/baseAuth
     * @secure
     */
    postUserBaseAuth: (
      baseAuthSubmitVO: BaseAuthSubmitVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/baseAuth`,
        method: "POST",
        body: baseAuthSubmitVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name PostUserBindEmail
     * @summary 客户用户-绑定邮箱
     * @request POST:/crmClient/user/bindEmail
     * @secure
     */
    postUserBindEmail: (
      clientEmailBindVO: ClientEmailBindVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/bindEmail`,
        method: "POST",
        body: clientEmailBindVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name PostUserBindPhone
     * @summary 客户用户-绑定手机号
     * @request POST:/crmClient/user/bindPhone
     * @secure
     */
    postUserBindPhone: (
      clientPhoneBindVO: ClientPhoneBindVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/bindPhone`,
        method: "POST",
        body: clientPhoneBindVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name GetUserDetail
     * @summary 客户用户-详情
     * @request GET:/crmClient/user/detail
     * @secure
     */
    getUserDetail: (params: RequestParams = {}) =>
      this.http.request<RClient, void>({
        path: `/crmClient/user/detail`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name PostUserEditEmail
     * @summary 客户用户-更换邮箱
     * @request POST:/crmClient/user/editEmail
     * @secure
     */
    postUserEditEmail: (
      clientEmailEditVO: ClientEmailEditVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/editEmail`,
        method: "POST",
        body: clientEmailEditVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name PostUserEditPasswordEmail
     * @summary 客户用户-修改密码【邮箱】
     * @request POST:/crmClient/user/editPasswordEmail
     * @secure
     */
    postUserEditPasswordEmail: (
      clientPasswordEditVO: ClientPasswordEditVO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/user/editPasswordEmail`,
        method: "POST",
        body: clientPasswordEditVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name PostUserEditPasswordPhone
     * @summary 客户用户-修改密码【手机】
     * @request POST:/crmClient/user/editPasswordPhone
     * @secure
     */
    postUserEditPasswordPhone: (
      clientPasswordEditVO: ClientPasswordEditVO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/user/editPasswordPhone`,
        method: "POST",
        body: clientPasswordEditVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name PostUserEditPhone
     * @summary 客户用户-更换手机号
     * @request POST:/crmClient/user/editPhone
     * @secure
     */
    postUserEditPhone: (
      clientPhoneEditVO: ClientPhoneEditVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/editPhone`,
        method: "POST",
        body: clientPhoneEditVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户接口
     * @name GetUserGetuserkycflag
     * @summary 当前登录用户是否KYC认证,true是，false否
     * @request GET:/crmClient/user/getUserKycFlag
     * @secure
     */
    getUserGetuserkycflag: (params: RequestParams = {}) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/user/getUserKycFlag`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入kycAuth
     *
     * @tags 客户用户接口
     * @name PostUserKycAuth
     * @summary KYC身份认证-提交审核
     * @request POST:/crmClient/user/kycAuth
     * @secure
     */
    postUserKycAuth: (
      kycAuthSubmitVO: KycAuthSubmitVO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/kycAuth`,
        method: "POST",
        body: kycAuthSubmitVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入认证图片
     *
     * @tags 客户用户接口
     * @name PostUserSeniorAuth
     * @summary 高级认证-提交审核
     * @request POST:/crmClient/user/seniorAuth
     * @secure
     */
    postUserSeniorAuth: (
      query: {
        /** 认证图片 */
        authImgsUrl: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/user/seniorAuth`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  account = {
    /**
     * @description 传入manager
     *
     * @tags 客户交易账户接口
     * @name GetAccountAccountgroup
     * @summary 客户用户-交易账户组
     * @request GET:/crmClient/account/accountGroup
     * @secure
     */
    getAccountAccountgroup: (
      query?: {
        /** 是否模拟 */
        isSimulate?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RListAccountGroup, void>({
        path: `/crmClient/account/accountGroup`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),
  };
  face = {
    /**
     * @description 传入
     *
     * @tags 人脸核身接口
     * @name PostFaceGetFaceAuthUrl
     * @summary 获取人脸核身URL
     * @request POST:/crmClient/face/getFaceAuthUrl
     * @secure
     */
    postFaceGetFaceAuthUrl: (
      faceAuthDTO: FaceAuthDTO,
      params: RequestParams = {},
    ) =>
      this.http.request<RDetectAuthResponse, void>({
        path: `/crmClient/face/getFaceAuthUrl`,
        method: "POST",
        body: faceAuthDTO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 人脸核身接口
     * @name PostFaceUpdateFaceResult
     * @summary 触发跳传后调的接口
     * @request POST:/crmClient/face/updateFaceResult
     * @secure
     */
    postFaceUpdateFaceResult: (
      faceAuthUpdateDTO: FaceAuthUpdateDTO,
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/face/updateFaceResult`,
        method: "POST",
        body: faceAuthUpdateDTO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  public = {
    /**
     * @description 传入识别码
     *
     * @tags 公开参数接口
     * @name GetPublicClientgroup
     * @summary 获取客户组信息
     * @request GET:/crmClient/public/clientGroup/{code}
     * @secure
     */
    getPublicClientgroup: (code: string, params: RequestParams = {}) =>
      this.http.request<RClientGroupDetailVO, void>({
        path: `/crmClient/public/clientGroup/${code}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 公开参数接口
     * @name GetPublicCountrylist
     * @summary 获取国家信息
     * @request GET:/crmClient/public/countryList
     * @secure
     */
    getPublicCountrylist: (params: RequestParams = {}) =>
      this.http.request<RListCountry, void>({
        path: `/crmClient/public/countryList`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 公开参数接口
     * @name GetPublicDict
     * @summary 获取系统字典
     * @request GET:/crmClient/public/dict/{code}
     * @secure
     */
    getPublicDict: (code: string, params: RequestParams = {}) =>
      this.http.request<RListKeyValueVO, void>({
        path: `/crmClient/public/dict/${code}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 公开参数接口
     * @name GetPublicDictbiz
     * @summary 获取业务字典
     * @request GET:/crmClient/public/dictBiz/{code}
     * @secure
     */
    getPublicDictbiz: (code: string, params: RequestParams = {}) =>
      this.http.request<RListKeyValueVO, void>({
        path: `/crmClient/public/dictBiz/${code}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 获取业务字典树
     *
     * @tags 公开参数接口
     * @name GetPublicDictionarytree
     * @summary 获取业务字典树
     * @request GET:/crmClient/public/dictionaryTree/{code}
     * @secure
     */
    getPublicDictionarytree: (code: string, params: RequestParams = {}) =>
      this.http.request<RListDictBizVO, void>({
        path: `/crmClient/public/dictionaryTree/${code}`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 公开参数接口
     * @name GetPublicParam
     * @summary 获取参数配置
     * @request GET:/crmClient/public/param/{code}
     * @secure
     */
    getPublicParam: (code: string, params: RequestParams = {}) =>
      this.http.request<RString, void>({
        path: `/crmClient/public/param/${code}`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
  register = {
    /**
     * @description 传入
     *
     * @tags 客户用户注册接口
     * @name PostRegisterForgetPasswordEmail
     * @summary 客户用户-忘记密码【邮箱】
     * @request POST:/crmClient/register/forgetPasswordEmail
     * @secure
     */
    postRegisterForgetPasswordEmail: (
      clientForgePasswordVO: ClientForgePasswordVO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/register/forgetPasswordEmail`,
        method: "POST",
        body: clientForgePasswordVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户注册接口
     * @name PostRegisterForgetPasswordPhone
     * @summary 客户用户-忘记密码【手机】
     * @request POST:/crmClient/register/forgetPasswordPhone
     * @secure
     */
    postRegisterForgetPasswordPhone: (
      clientForgePasswordVO: ClientForgePasswordVO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/register/forgetPasswordPhone`,
        method: "POST",
        body: clientForgePasswordVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户注册接口
     * @name PostRegisterSubmitEmail
     * @summary 客户用户-邮箱注册
     * @request POST:/crmClient/register/submitEmail
     * @secure
     */
    postRegisterSubmitEmail: (
      clientRegusterSubmitVO: ClientRegusterSubmitVO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/register/submitEmail`,
        method: "POST",
        body: clientRegusterSubmitVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户注册接口
     * @name PostRegisterSubmitPhone
     * @summary 客户用户-手机注册
     * @request POST:/crmClient/register/submitPhone
     * @secure
     */
    postRegisterSubmitPhone: (
      clientRegusterSubmitVO: ClientRegusterSubmitVO,
      params: RequestParams = {},
    ) =>
      this.http.request<RBoolean, void>({
        path: `/crmClient/register/submitPhone`,
        method: "POST",
        body: clientRegusterSubmitVO,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  validateCode = {
    /**
     * @description 传入
     *
     * @tags 客户用户验证码接口
     * @name PostValidateCodeCustomEmail
     * @summary 发送验证码-邮箱
     * @request POST:/crmClient/validateCode/customEmail
     * @secure
     */
    postValidateCodeCustomEmail: (
      query: {
        /** 邮箱 */
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<RInt, void>({
        path: `/crmClient/validateCode/customEmail`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户验证码接口
     * @name PostValidateCodeCustomPhone
     * @summary 发送验证码-手机
     * @request POST:/crmClient/validateCode/customPhone
     * @secure
     */
    postValidateCodeCustomPhone: (
      query: {
        /** 手机号 */
        phone: string;
        /** 电话区号 */
        phoneAreaCode: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/validateCode/customPhone`,
        method: "POST",
        query: query,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户验证码接口
     * @name GetValidatecodeGetphone
     * @summary 查询手机号是否存在
     * @request GET:/crmClient/validateCode/getPhone
     * @secure
     */
    getValidatecodeGetphone: (
      query: {
        /** 手机号 */
        phone: string;
        /** 电话区号 */
        phoneAreaCode: string;
      },
      params: RequestParams = {},
    ) =>
      this.http.request<R, void>({
        path: `/crmClient/validateCode/getPhone`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户验证码接口
     * @name PostValidateCodeUserEmail
     * @summary 发送验证码-用户邮箱
     * @request POST:/crmClient/validateCode/userEmail
     * @secure
     */
    postValidateCodeUserEmail: (params: RequestParams = {}) =>
      this.http.request<RInt, void>({
        path: `/crmClient/validateCode/userEmail`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 传入
     *
     * @tags 客户用户验证码接口
     * @name PostValidateCodeUserPhone
     * @summary 发送验证码-用户手机
     * @request POST:/crmClient/validateCode/userPhone
     * @secure
     */
    postValidateCodeUserPhone: (params: RequestParams = {}) =>
      this.http.request<RInt, void>({
        path: `/crmClient/validateCode/userPhone`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
