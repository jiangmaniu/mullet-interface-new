declare namespace User {
  // 用户基本信息
  export type UserInfo = {
    name?: any
    imgUrl?: string
  } & LoginResult &
    ClientInfo
  // 注册参数
  type RegisterParams = {
    /**
     * 识别码：后台配置前端写死，区分不同渠道部署的应用
     */
    code: string
    /**
     * 国家
     */
    country?: string
    /**
     * 邮箱或者手机
     */
    emailOrPhone: string
    /**
     * 密码【加密】
     */
    password: string
    /**
     * 验证码
     */
    validateCode: number
    /**
     * 手机区号
     */
    phoneAreaCode?: string
  }
  // 登录参数
  type LoginParams = {
    username?: string
    password?: string
    phoneAreaCode?: string
    /**刷新token */
    refresh_token?: string
    /**租户ID：默认值 000000 */
    tenanId?: string
    /**登录传的类型，账户密码登录传account */
    type?: 'account'
    grant_type?: 'captcha' | 'password' | 'refresh_token' | 'privy_token'
    /**验证码 */
    captchaCode?: string
    scope?: 'all'
  }
  // 登录返回结果
  type LoginResult = Partial<{
    /**token */
    access_token: string
    /**token类型 headers['Authentication'] = 'Bearer ' + token */
    token_type: string
    refresh_token: string
    expires_in: number
    scope: string
    tenant_id: string
    user_name: string
    real_name: string
    avatar: string
    client_id: string
    role_name: string
    license: string
    post_id: string
    user_id: string
    role_id: string
    nick_name: string
    oauth_id: string
    detail: { type: string }
    dept_id: string
    account: string
    jti: string
    success?: boolean
    /**接口防重放秘钥 */
    app_key?: string
  }>
  // 客户详细信息
  type ClientInfo = {
    accountCount?: {
      /**
       * 账户净值
       */
      availableBalance?: number
      /**
       * 交易账户id
       */
      id?: number
      /**
       * 总入金
       */
      totalDeposit?: number
      /**
       * 总盈亏
       */
      totalProfitLoss?: number
      /**
       * 总成交量
       */
      totalTradeVolume?: number
      /**
       * 总出金
       */
      totalWithdrawal?: number
    }
    /**
     * 客户交易账户
     */
    accountList?: AccountItem[]
    /**
     * 地址
     */
    address?: string
    /**
     * 银行卡认证信息
     */
    bankCardAuth?: BankCard.ListItem[]
    /**
     * 客户组ID
     */
    clientGroupId?: number
    /**
     * 主键
     */
    id?: number
    /**
     * 是否绑定银行卡
     */
    isBankcardBind?: boolean
    /**
     * 是否KYC认证
     */
    isKycAuth?: boolean
    /**
     * KYC认证信息
     */
    kycAuth?: KycAuth.ListItem[]
    /**
     * KYC身份认证ID
     */
    kycAuthId?: number
    /**
     * 备注
     */
    remark?: string
    userInfo?: ClientUserInfo
    /**国家区号信息 */
    countryInfo?: {
      id: string
      /**简称 AN */
      abbr: string
      /**英文名字 eg.NETHERLANDS ANTILLES */
      nameEn: string
      /**中文名字  eg.荷属安的列斯群岛*/
      nameCn: string
      /**繁体名字 eg.荷屬安地列斯 */
      nameTw: string
      /**区号 eg.599*/
      areaCode: string
    }
    /**国家-简称 */
    country?: string
    /** 是否基礎認證 */
    isBaseAuth?: boolean
    /** 證件類型 */
    identificationType?: 'ID_CARD' | 'PASSPORT'
    /** 姓 */
    lastName?: string
    /**名 */
    firstName?: string
    /** 證件號 */
    identificationCode?: string
    // 业务线信息
    clientGroup?: {
      /**
       * 账户组ID
       */
      accountGroupId?: string
      /**
       * 识别码
       */
      code?: string
      /**
       * 组名称
       */
      groupName?: string
      /**
       * 主健ID
       */
      id?: number
      /**
       * KYC认证
       */
      kycAuth?: API.KycAuthType
      /**
       * 支付方式
       */
      payWay?: string
      /**
       * 注册方式
       */
      registerWay?: API.RegisterWay
      /**
       * 备注
       */
      remark?: string
      /**
       * 出金申请次数
       */
      withdrawalLimitCount?: number
      /**
       * 出金判断周期
       */
      withdrawalLimitCycle?: number
      /**
       * 出金金额（累计）
       */
      withdrawalLimitMoney?: number
      /**
       * 出金方式
       */
      withdrawalWay?: string
    }
  }
  // 客户用户信息
  type ClientUserInfo = {
    /**
     * 账号
     */
    account?: string
    /**
     * 头像
     */
    avatar?: string
    /**
     * 生日
     */
    birthday?: string
    /**
     * 用户编号
     */
    code?: string
    /**
     * 创建部门
     */
    createDept?: number
    /**
     * 创建时间
     */
    createTime?: string
    /**
     * 创建人
     */
    createUser?: number
    /**
     * 部门id
     */
    deptId?: string
    /**
     * 邮箱
     */
    email?: string
    /**
     * 主键id
     */
    id?: number
    /**
     * 是否已删除
     */
    isDeleted?: number
    /**
     * 昵称
     */
    name?: string
    /**
     * 密码
     */
    password?: string
    /**
     * 手机
     */
    phone?: string
    /**
     * 手机区号
     */
    phoneAreaCode?: string
    /**
     * 岗位id
     */
    postId?: string
    /**
     * 真名
     */
    realName?: string
    /**
     * 角色id
     */
    roleId?: string
    /**
     * 性别
     */
    sex?: number
    /**
     * 业务状态
     */
    status?: number
    /**
     * 租户ID
     */
    tenantId?: string
    /**
     * 更新时间
     */
    updateTime?: string
    /**
     * 更新人
     */
    updateUser?: number
    /**
     * 用户平台
     */
    userType?: number
    /**最后登录时间 */
    lastLoginTime?: string
    /**最后登录具体地址 */
    lastLoginAddress?: string
    /**最后登录IP */
    lastLoginIp?: string
    /**用户设置的语言 */
    language: string
  }
  // 忘记密码
  type ForgetPasswordParams = {
    /**
     * 邮箱或者手机
     */
    emailOrPhone: string
    /**
     * 新密码
     */
    newPassword: string
    /**
     * 验证码
     */
    validateCode: number
  }
  /**当前账户切换列表 */
  type AccountItem = {
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
    id: any
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
     * 状态 禁用、启用
     */
    status?: API.Status
    /**启用禁用交易账号 */
    isTrade?: boolean
    /**追加预付款比例 */
    addAdvanceCharge?: number
    /**强制平仓比例 */
    compelCloseRatio?: number
    /**启用禁用交易账号连接状态 */
    enableConnect: boolean
    /**禁用账户组交易 */
    enableTrade: boolean
    /**账户组描述 */
    synopsis?: AccountGroup.SynopsisConf[]
    /**账户组小数位 */
    currencyDecimal?: number
    /**账户组货币单位 */
    currencyUnit?: string
    /**账户组可用预付款配置 */
    usableAdvanceCharge?: API.UsableAdvanceCharge
    /** 跟单状态 */
    followStatus?: number
    /** pda代币地址 */
    pdaTokenAddress?: any
    /** Solana网络RPC */
    networkRpc?: string
    /**
     * Solana网络WS
     */
    networkWs?: string
    /**
     * Solana网络别名
     */
    networkAlias?: string
    /**
     * 智能合约ID
     */
    programId?: string
    /**
     * Mint代币地址
     */
    mintAddress?: any
    /**
     * Mint代币小数位
     */
    mintDecimals?: number
  }

  // 区域列表
  type AreaCodeItem = {
    phoneAreaCode: string
    areaGroup: string
    areaId: number
    areaName: string
    areaNameZh: string
  }
  // 图形验证码响应
  type Captcha = { key: string; image: string }
  /**菜单列表 */
  type MenuItem = {
    /**
     * 操作按钮类型
     */
    action?: number
    actionName?: string
    /**
     * 菜单别名
     */
    alias?: string
    /**
     * 菜单类型
     */
    category?: number
    categoryName?: string
    children?: MenuItem[]
    /**
     * 菜单编号
     */
    code?: string
    /**
     * 组件资源
     */
    component?: string
    hasChildren?: boolean
    id?: number
    /**
     * 是否已删除
     */
    isDeleted?: number
    /**
     * 是否打开新页面
     */
    isOpen?: number
    isOpenName?: string
    /**
     * 菜单名称
     */
    name?: string
    parentId?: number
    parentName?: string
    /**
     * 请求地址
     */
    path?: string
    /**
     * 备注
     */
    remark?: string
    /**
     * 排序
     */
    sort?: number
    /**
     * 菜单资源
     */
    source?: string
  }
  type EditPhoneParams = {
    /**
     * 新手机
     */
    newPhone: string
    /**
     * 新手机验证码
     */
    newPhoneCode: number
    /**
     * 旧手机验证码
     */
    oldPhoneCode: number
    /**
     * 手机区号
     */
    phoneAreaCode: string
  }
  type EditEmailParams = {
    /**
     * 新邮箱
     */
    newEmail: string
    /**
     * 新邮箱验证码
     */
    newEmailCode: number
    /**
     * 旧邮箱验证码
     */
    oldEmailCode: number
  }
  // 绑定手机
  type BindPhoneParams = {
    /**
     * 手机
     */
    phone: string
    /**
     * 手机验证码
     */
    phoneCode: number
    /**
     * 手机区号
     */
    phoneAreaCode: string
  }
  // 绑定邮箱
  type BindEmailParams = {
    /**
     * 邮箱
     */
    email: string
    /**
     * 邮箱验证码
     */
    emailCode: number
  }
}
