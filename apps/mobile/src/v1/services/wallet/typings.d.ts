declare namespace Wallet {
  /**
   * 资金类型
   */
  type FundsType = 'DEPOSIT' | 'WITHDRAWAL'
  /**
   * 多语言类型CODE编码
   */
  type Language = 'ZHTW' | 'ENUS' | 'VIVN'

  type IMethodStatus = 'locked' | 'unlocked' // 是否可用（解锁）状态

  type IMethodType = 'crypto' | 'bank' // 支付类型： 加密货币 / 银行

  type IOrderStatus = 'beginning' | 'pending' | 'finished' | 'failed' // 订单状态: 开始 / 等待 / 完成 / 失败

  type PaymentType = 'OTC' | 'CHAIN' // 支付类型: OTC / 链

  type CertificateStatus = 'FAIL' | 'NOSUBMIT' | 'PASS' | 'SUBMIT' // 凭证状态

  /**
   * 订单状态
   */
  type IWithdrawalOrderStatus = 'RECEIPT' | 'WAIT' | 'SUCCESS' | 'REJECT' | 'FAIL' | 'WITHDRAW' // 出金订单状态: 收款 / 等待回调

  type IMethodOption = {
    // 图标
    icon?: string
    // 标签
    label?: string
    // 值
    value?: string
    // 描述
    desc?: string
  }

  // 配置详情，到账时间 / 金额限制 / 资费 / 货币类型 / 链名称 / 入金链上地址 / 银行名称 等等
  type IMethodOptions = Record<string, IMethodOption>

  /**
   * 接口获取充值方式返回数据类型
   */
  type DepositMethod = {
    id: string
    // 图标
    icon?: string
    // 标题
    title: string
    // 是否可用（解锁）状态
    status?: IMethodStatus
    // 配置详情，到账时间 / 金额限制 / 资费 / 货币类型 / 链名称 / 入金链上地址 / 银行名称 等等
    options?: IMethodOptions
    // 支付类型
    type?: IMethodType
    // 充值提示 （根据语言类型返回；或前端预设）
    tips?: string
    // 入金须知（html，根据语言类型返回；或前端预设）
    notice?: string

    // [key: string]: any
  }

  /**
   * 接口获取提现方式返回数据类型
   */
  type WithdrawMethod = {
    id: string
    // 图标
    icon?: string
    // 标题
    title: string
    // 是否可用（解锁）状态
    status?: IMethodStatus
    // 配置详情，到账时间 / 金额限制 / 资费 / 货币类型 / 链名称 / 银行名称 等等
    options?: IMethodOptions
    // 支付类型
    type?: IMethodType
    // 充值提示 （根据语言类型返回；或前端预设）
    tips?: string
    // 出金须知（html，根据语言类型返回；或前端预设）
    notice?: string

    // [key: string]: any
  }

  /**
   * 生成充值订单请求参数
   */
  type GenerateDepositOrderParams = {
    // 渠道ID
    channelId: any
    // 交易账户 ID
    tradeAccountId: string
    // 订单金额
    baseOrderAmount?: any
  }

  type GenerateDepositOrderResult = {
    /**
     * 钱包地址
     */
    address?: string
    /**
     * 银行卡账号
     */
    bankCard?: string
    /**
     * 银行名称
     */
    bankName?: string
    /**
     * 取消订单时间
     */
    canncelOrderTime?: number
    /**
     * 创建时间
     */
    createTime?: Date
    /**
     * 订单ID
     */
    id?: number
    /**
     * 地址二维码
     */
    qrCode?: string
    /**
     * 支付到账金额
     */
    receiptAmount?: number
    /**
     * 币种
     */
    symbol?: string
    /**
     * 姓名
     */
    userName?: string
    [property: string]: any
  }

  type GenerateDepositOrderDetailResult = {
    /**
     * 客户账户
     */
    account?: string
    /**
     * 充值地址
     */
    address?: string
    /**
     * 地址状态1失效，0使用中
     */
    addressStatus?: number
    /**
     * 银行卡
     */
    bankCard?: string
    /**
     * 银行名称
     */
    bankName?: string
    /**
     * 基准货币单位
     */
    baseCurrency?: string
    /**
     * 基准货币手续费
     */
    baseHandlingFee?: number
    /**
     * 基准货币订单金额
     */
    baseOrderAmount?: number
    /**
     * 到账金额
     */
    baseReceiptAmount?: number
    /**
     * 取消订单时间
     */
    canncelOrderTime?: number
    /**
     * 凭证状态
     */
    certificateStatus?: CertificateStatus
    /**
     * 凭证图片
     */
    certificateUrl?: string
    /**
     * 渠道入账金额
     */
    channelAccountAmount?: number
    /**
     * 渠道手续费
     */
    channelBaseHandlingFee?: number
    /**
     * 渠道结算汇率
     */
    channelExchangeRate?: number
    /**
     * 渠道ID
     */
    channelId?: number
    /**
     * 支付渠道名称
     */
    channelName?: string
    /**
     * 支付通道编号
     */
    channelNo?: string
    /**
     * 通道编号字典值
     */
    channelNoValue?: string
    /**
     * 渠道回调订单编号
     */
    channelOrderNo?: string
    /**
     * 渠道结算货币基准
     */
    channelSettlementCurrency?: string
    /**
     * 支付渠道类型
     */
    channelType?: string
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 汇差收取费用
     */
    exchangeDifferenceFee?: number
    /**
     * 汇差收取百分比
     */
    exchangeDifferencePercentage?: number
    /**
     * 汇率
     */
    exchangeRate?: number
    /**
     * 账户组组CODE
     */
    groupCode?: string
    /**
     * 账户组名称
     */
    groupName?: string
    /**
     * 手续费
     */
    handlingFee?: number
    /**
     * 主键
     */
    id?: number
    /**
     * 订单金额
     */
    orderAmount?: number
    /**
     * 订单编号
     */
    orderNo?: string
    /**
     * 支付类型
     */
    paymentType?: PaymentType
    /**
     * 二维码
     */
    qrCode?: string
    /**
     * 到账金额法币
     */
    receiptAmount?: number
    /**
     * 到账时间
     */
    receiptTime?: Date
    /**
     * 备注
     */
    remark?: string
    /**
     * 订单状态
     */
    status?: IWithdrawalOrderStatus
    /**
     * 币种
     */
    symbol?: string
    /**
     * 交易账户ID
     */
    tradeAccountId?: number
    /**
     * 交易哈希
     */
    txid?: string
    /**
     * 更新时间
     */
    updateTime?: Date
    /**
     * 用户ID
     */
    userId?: number
    /**
     * 客户姓名
     */
    userName?: string
    [property: string]: any
  }

  type GenerateWithdrawalOrderDetailResult = {
    /**
     * 客户账户
     */
    account?: string
    /**
     * 充值地址
     */
    address?: string
    /**
     * 地址状态1失效，0使用中
     */
    addressStatus?: number
    /**
     * 银行卡
     */
    bankCard?: string
    /**
     * 银行名称
     */
    bankName?: string
    /**
     * 基准货币单位
     */
    baseCurrency?: string
    /**
     * 基准货币手续费
     */
    baseHandlingFee?: number
    /**
     * 基准货币订单金额
     */
    baseOrderAmount?: number
    /**
     * 到账金额
     */
    baseReceiptAmount?: number
    /**
     * 取消订单时间
     */
    canncelOrderTime?: number
    /**
     * 凭证状态
     */
    certificateStatus?: CertificateStatus
    /**
     * 凭证图片
     */
    certificateUrl?: string
    /**
     * 渠道入账金额
     */
    channelAccountAmount?: number
    /**
     * 渠道手续费
     */
    channelBaseHandlingFee?: number
    /**
     * 渠道结算汇率
     */
    channelExchangeRate?: number
    /**
     * 渠道ID
     */
    channelId?: number
    /**
     * 支付渠道名称
     */
    channelName?: string
    /**
     * 支付通道编号
     */
    channelNo?: string
    /**
     * 通道编号字典值
     */
    channelNoValue?: string
    /**
     * 渠道回调订单编号
     */
    channelOrderNo?: string
    /**
     * 渠道结算货币基准
     */
    channelSettlementCurrency?: string
    /**
     * 支付渠道类型
     */
    channelType?: string
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 汇差收取费用
     */
    exchangeDifferenceFee?: number
    /**
     * 汇差收取百分比
     */
    exchangeDifferencePercentage?: number
    /**
     * 汇率
     */
    exchangeRate?: number
    /**
     * 账户组组CODE
     */
    groupCode?: string
    /**
     * 账户组名称
     */
    groupName?: string
    /**
     * 手续费
     */
    handlingFee?: number
    /**
     * 主键
     */
    id?: number
    /**
     * 订单金额
     */
    orderAmount?: number
    /**
     * 订单编号
     */
    orderNo?: string
    /**
     * 支付类型
     */
    paymentType?: PaymentType
    /**
     * 二维码
     */
    qrCode?: string
    /**
     * 到账金额法币
     */
    receiptAmount?: number
    /**
     * 到账时间
     */
    receiptTime?: Date
    /**
     * 备注
     */
    remark?: string
    /**
     * 订单状态
     */
    status?: IWithdrawalOrderStatus
    /**
     * 币种
     */
    symbol?: string
    /**
     * 交易账户ID
     */
    tradeAccountId?: number
    /**
     * 交易哈希
     */
    txid?: string
    /**
     * 更新时间
     */
    updateTime?: Date
    /**
     * 用户ID
     */
    userId?: number
    /**
     * 客户姓名
     */
    userName?: string
    [property: string]: any
  }
  // /**
  //  * 生成提现订单（预览）
  //  */
  // type GenerateWithdrawOrderParams = {
  //   // 出款地址：从该交易账户提取
  //   fromAccountId: string
  //   // 提现金额
  //   amount: number
  //   // 提现方式 ID,
  //   methodId: string
  //   // 收款地址：链地址（crypto） / 银行账户（bank）
  //   toAccountId: string
  //   // 提现币种
  //   currency?: string
  //   // 备注
  //   remark?: string
  // }

  /**
   * 生成提现订单（提交申请）请求参数
   */
  type ConfirmWithdrawOrderParams = {
    // 提现订单 ID
    orderId: string
    // 支付密码
    password: string
    // 验证码
    code: string
  }

  /**
   * 获取入金记录
   */
  type DepositRecord = {
    [key: string]: any
  }

  /**
   * 获取提现记录
   */
  type WithdrawRecord = {
    [key: string]: any
  }

  type fundsMethodPageListParams = {
    /**
     * 资金类型
     */
    fundsType?: FundsType
    /**
     * 多语言类型CODE编码
     */
    language?: Language
    /**
     * 每页的数量
     */
    [property: string]: any
  } & API.PageParam

  /**
   * 出入金方式列表VO，出入金方式列表VO
   */
  type fundsMethodPageListItem = {
    /**
     * 汇率
     */
    exchangeRate?: number
    /**
     * 汇差百分比
     */
    userExchangeDifferencePercentage?: number
    /**
     * 客户交易百分比手续费
     */
    userTradePercentageFee?: number
    /**
     * 客户单笔固定手续费
     */
    userSingleFixedFee?: number
    /**
     * 客户单笔最低手续费
     */
    userSingleLeastFee?: number
    /**
     * 单笔最小金额
     */
    singleAmountMin?: number
    /**
     * 单笔最大金额
     */
    singleAmountMax?: number
    /**
     * 基准货币
     */
    baseCurrency?: string
    /**
     * 渠道图标
     */
    channelIcon?: string
    /**
     * 渠道ID
     */
    channelId: number
    /**
     * 支付通道编号
     */
    channelNo?: string
    /**
     * 渠道展示名称
     */
    channelRevealName?: string
    /**
     * 平台汇率
     */
    exchangeRate?: number
    /**
     * 汇率ID
     */
    exchangeRateId?: number
    /**
     * 出入金说明
     */
    explanation?: Array<{
      title: string
      content: string
    }>
    /**
     * 出入金须知
     */
    notice?: string
    /**
     * 支付类型,OTC，CHAIN(链)
     */
    paymentType?: PaymentType
    /**
     * 币种
     */
    symbol?: string
    /**
     * 汇差百分比
     */
    userExchangeDifferencePercentage?: number
    /**
     * 客户单笔固定手续费
     */
    userSingleFixedFee?: number
    /**
     * 客户单笔最低手续费
     */
    userSingleLeastFee?: number
    /**
     * 客户交易百分比手续费
     */
    userTradePercentageFee?: number

    /**
     * 通道编号字典值，用於識別支付方式類型
     */
    channelNoValue?: string

    [property: string]: any
  }

  type depositOrderListItem = {
    channelIcon?: string
    /**
     * 账户编号
     */
    account?: string
    /**
     * 基准货币单位
     */
    baseCurrency?: string
    /**
     * 入金金额
     */
    baseOrderAmount?: number
    /**
     * 渠道展示名称
     */
    channelRevealName?: string
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 账户组CODE
     */
    groupCode?: string
    /**
     * 订单编号
     */
    orderNo?: string
    /**
     * 订单状态（1待支付 2支付成功 3支付失败）
     */
    status?: IWithdrawalOrderStatus
    /**
     * 交易账户ID
     */
    tradeAccountId?: number
    [property: string]: any
  }

  /**
   * WithdrawalOrderPageVO对象，入金订单表
   */
  type withdrawalOrderListItem = {
    /**
     * 手续费
     */
    baseHandlingFee?: number
    /**
     * 账户编号
     */
    account?: string
    /**
     * 基准货币单位
     */
    baseCurrency?: string
    /**
     * 支付渠道ID
     */
    channelId?: string
    /**
     * 支付渠道名称
     */
    channelName?: string
    /**
     * 渠道展示名称
     */
    channelRevealName?: string
    /**
     * 支付渠道类型值
     */
    channelType?: string
    /**
     * 账户组CODE
     */
    groupCode?: string
    /**
     * 订单金额
     */
    orderAmount?: number
    /**
     * 订单状态
     */
    status?: IWithdrawalOrderStatus
    /**
     * 交易账户ID
     */
    tradeAccountId?: number
    [property: string]: any
  }

  type WithdrawalBank = {
    /**
     * 银行卡号
     */
    bankCard?: string
    /**
     * 银行名称
     */
    bankName?: string
    /**
     * 创建时间
     */
    createTime?: Date
    /**
     * 主键
     */
    id?: number
    /**
     * 备注
     */
    remark?: string
    /**
     * 更新时间
     */
    updateTime?: Date
    /**
     * 用户ID
     */
    userId?: number
    /**
     * 姓名
     */
    userName?: string
    [property: string]: any
  }

  type WithdrawalAddress = {
    /**
     * 提币地址
     */
    address: string
    /**
     * 渠道ID
     */
    channelId?: string
    /**
     * 渠道显示名称（ERC20）
     */
    channelName?: string

    /**
     * 提币地址ID
     */
    id: string
    /**
     * 说明
     */
    remark?: string
    /**
     * 币种（USDT）
     */
    symbol?: string
    [property: string]: any
  }

  type GenerateWithdrawOrderParams = {
    /**
     * 提币地址
     */
    address?: string
    /**
     * 订单金额(基准单位)
     */
    baseOrderAmount?: number
    /**
     * 支付渠道ID
     */
    channelId?: string
    /**
     * 账户密码
     */
    password?: string
    /**
     * 手机验证码
     */
    phoneCode?: any
    /**
     * 交易账户ID
     */
    tradeAccountId?: any
    /**
     * 银行名称
     */
    bankName?: string
    /**
     * 银行账号
     */
    bankCard?: string
    [property: string]: any
  }
}
