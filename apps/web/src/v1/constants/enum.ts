import { gray, red, yellow } from '../theme/theme.config'

const getMaxLocale = () => {
  return 'zh-TW'
}

export enum Language {
  'en-US' = 'en-US', // 英语
  'zh-TW' = 'zh-TW', // 台湾繁体
  'vi-VN' = 'vi-VN', // 越南语
}
export const LanguageMap: Record<string, any> = {
  'en-US': {
    key: 'en-US',
    label: 'EN',
    icon: '🇺🇸',
  },
  'vi-VN': {
    key: 'vi-VN',
    label: 'VN',
    icon: '🇻🇳',
  },
  'zh-TW': {
    key: 'zh-TW',
    label: 'ZH',
    icon: '🇨🇳',
  },
}

export type ILanguage = 'en-US' | 'zh-TW' | 'vi-VN'

export const SUPPORTED_LANGUAGES = ['zh-TW', 'en-US', 'vi-VN']

// 传给后台的值，转化一下
export const LanuageTransformMap: Record<ILanguage, string> = {
  'zh-TW': 'zh-TW',
  'en-US': 'en-US',
  'vi-VN': 'vi-VN',
}

// 获取k线对应的语言
export const getTradingViewLng = () => {
  const langMap = {
    'zh-TW': 'zh_TW', // 中文繁体
    'en-US': 'en', // 英文
    'vi-VN': 'vi', // 越南语
  }

  return langMap[getMaxLocale() as ILanguage] || 'en'
}

export const getLocaleForBackend = () => LanuageTransformMap[getMaxLocale() as ILanguage]

// 转换星期文本
export type IWeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
export const transferWeekDay = (weekDay: IWeekDay) => {
  const text = {
    MONDAY: '星期一',
    TUESDAY: '星期二',
    WEDNESDAY: '星期三',
    THURSDAY: '星期四',
    FRIDAY: '星期五',
    SATURDAY: '星期六',
    SUNDAY: '星期日',
  }[weekDay]

  return text
}

// 订单类型
export const ORDER_TYPE = {
  /**市价单 */
  MARKET_ORDER: 'MARKET_ORDER',
  /**限价买入单 */
  LIMIT_BUY_ORDER: 'LIMIT_BUY_ORDER',
  /**限价卖出单 */
  LIMIT_SELL_ORDER: 'LIMIT_SELL_ORDER',
  /**止损限价买入单 */
  STOP_LOSS_LIMIT_BUY_ORDER: 'STOP_LOSS_LIMIT_BUY_ORDER',
  /**止损限价卖出单 */
  STOP_LOSS_LIMIT_SELL_ORDER: 'STOP_LOSS_LIMIT_SELL_ORDER',
  /**止损市价买入单 */
  STOP_LOSS_MARKET_BUY_ORDER: 'STOP_LOSS_MARKET_BUY_ORDER',
  /**止损市价卖出单 */
  STOP_LOSS_MARKET_SELL_ORDER: 'STOP_LOSS_MARKET_SELL_ORDER',
  /**止损单 */
  STOP_LOSS_ORDER: 'STOP_LOSS_ORDER',
  /**止盈单 */
  TAKE_PROFIT_ORDER: 'TAKE_PROFIT_ORDER',
}

// 买卖交易方向
export const TRADE_BUY_SELL = {
  /**买方向 */
  BUY: 'BUY',
  /**买方向 */
  SELL: 'SELL',
}

export const Enums = {
  // 启用、禁用状态
  Status: {
    DISABLED: { key: 'common.enum.Status.DISABLED' },
    ENABLE: { key: 'common.enum.Status.ENABLE' },
  },
  // 认证状态
  ApproveStatus: {
    TODO: { key: 'common.enum.ApproveStatus.TODO' },
    CANCEL: { key: 'common.enum.ApproveStatus.CANCEL' },
    Disallow: { key: 'common.enum.ApproveStatus.FAIL' },
    SUCCESS: { key: 'common.enum.ApproveStatus.SUCCESS' },
  },
  // 证件类型
  IdentificationType: {
    ID_CARD: { key: 'common.enum.IdentificationType.ID_CARD' },
    PASSPORT: { key: 'common.enum.IdentificationType.PASSPORT' },
  },
  // 银行卡类型
  BankCardType: {
    DEBIT_CARD: { key: 'common.enum.BankCardType.DEBIT_CARD' },
    CREDIT_CARD: { key: 'common.enum.BankCardType.CREDIT_CARD' },
  },
  // 交易方向类型：只有两种 买、卖
  TradeBuySell: {
    BUY: { key: 'common.enum.TradeBuySell.BUY' },
    SELL: { key: 'common.enum.TradeBuySell.SELL' },
  },
  // 订单类型
  OrderType: {
    MARKET_ORDER: { value: 10, key: 'common.enum.OrderType.MARKET_ORDER' },
    STOP_LOSS_ORDER: { value: 20, key: 'common.enum.OrderType.STOP_LOSS_ORDER' },
    TAKE_PROFIT_ORDER: {
      value: 30,
      key: 'common.enum.OrderType.TAKE_PROFIT_ORDER',
    },
    LIMIT_BUY_ORDER: { value: 40, key: 'common.enum.OrderType.LIMIT_BUY_ORDER' },
    LIMIT_SELL_ORDER: { value: 50, key: 'common.enum.OrderType.LIMIT_SELL_ORDER' },
    STOP_LOSS_LIMIT_BUY_ORDER: {
      value: 60,
      key: 'common.enum.OrderType.STOP_LOSS_LIMIT_BUY_ORDER',
    },
    STOP_LOSS_LIMIT_SELL_ORDER: {
      value: 70,
      key: 'common.enum.OrderType.STOP_LOSS_LIMIT_SELL_ORDER',
    },
    STOP_LOSS_MARKET_BUY_ORDER: {
      value: 80,
      key: 'common.enum.OrderType.STOP_LOSS_MARKET_BUY_ORDER',
    },
    STOP_LOSS_MARKET_SELL_ORDER: {
      value: 90,
      key: 'common.enum.OrderType.STOP_LOSS_MARKET_BUY_ORDER',
    },
  },
  // 订单状态
  OrderStatus: {
    CANCEL: { key: 'common.enum.OrderStatus.CANCEL' },
    ENTRUST: { key: 'common.enum.OrderStatus.ENTRUST' },
    FAIL: { key: 'common.enum.OrderStatus.FAIL' },
    FINISH: { key: 'common.enum.OrderStatus.FINISH' },
  },
  // 订单成交方向
  OrderInOut: {
    IN: { key: 'common.enum.OrderInOut.IN' },
    OUT: { key: 'common.enum.OrderInOut.OUT' },
  },
  // 持仓单状态
  BGAStatus: {
    BAG: { key: 'common.enum.BGAStatus.BAG' },
    FINISH: { key: 'common.enum.BGAStatus.FINISH' },
  },
  // 保证金类型
  MarginType: {
    CROSS_MARGIN: { key: 'common.enum.MarginType.CROSS_MARGIN' },
    ISOLATED_MARGIN: { key: 'common.enum.MarginType.ISOLATED_MARGIN' },
  },
  // 客户管理-交易账号-结余-表格-类型
  CustomerBalanceRecordType: {
    DEPOSIT: { key: 'common.enum.BalanceType.DEPOSIT' },
    DEPOSIT_SIMULATE: { key: 'common.enum.BalanceType.DEPOSIT_SIMULATE' },
    WITHDRAWAL: { key: 'common.enum.BalanceType.WITHDRAWAL' },
    MARGIN: { key: 'common.enum.BalanceType.MARGIN' },
    PROFIT: { key: 'common.enum.BalanceType.PROFIT' },
    GIFT: { key: 'common.enum.BalanceType.GIFT' },
    BALANCE: { key: 'common.enum.BalanceType.BALANCE' },
    TRANSFER: { key: 'common.enum.BalanceType.TRANSFER' },
    ZERO: { key: 'common.enum.BalanceType.ZERO' },
    FOLLOW_PROFIT: { key: 'common.enum.BalanceType.FOLLOW_PROFIT' },
    HANDLING_FEES: { key: 'common.enum.BalanceType.HANDLING_FEES' },
    INTEREST_FEES: { key: 'common.enum.BalanceType.INTEREST_FEES' },
    BACK: { key: 'mt.tixiantuihui' },
  },
}

// 业务枚举
export const getEnum = () => {
  //  ============= 业务枚举值 ================
  // 使用text形式命名，方便表格 valueEnum 消费
  const Enum = {
    // 启用、禁用状态
    Status: {
      DISABLED: { text: '禁用' },
      ENABLE: { text: '启用' },
    },
    // 认证状态
    ApproveStatus: {
      TODO: { text: '待审核', color: yellow['600'] },
      CANCEL: { text: '取消', color: gray['900'] },
      Disallow: { text: '审核失败', color: red['600'] },
      SUCCESS: { text: '审核成功', color: gray['900'] },
    },
    // 证件类型
    IdentificationType: {
      ID_CARD: { text: '身份证' },
      PASSPORT: { text: '护照' },
    },
    // 银行卡类型
    BankCardType: {
      DEBIT_CARD: { text: '借记卡' },
      CREDIT_CARD: { text: '信用卡' },
    },
    // 交易方向类型：只有两种 买、卖
    TradeBuySell: {
      BUY: { text: '买入' },
      SELL: { text: '卖出' },
    },
    // 订单类型
    OrderType: {
      MARKET_ORDER: { text: '市价单', value: 10 },
      STOP_LOSS_ORDER: { text: '止损单', value: 20 },
      TAKE_PROFIT_ORDER: { text: '止盈单', value: 30 },
      LIMIT_BUY_ORDER: { text: '限价买入单', value: 40 },
      LIMIT_SELL_ORDER: { text: '限价卖出单', value: 50 },
      STOP_LOSS_LIMIT_BUY_ORDER: { text: '止损限价买入单', value: 60 },
      STOP_LOSS_LIMIT_SELL_ORDER: { text: '止损限价卖出单', value: 70 },
      STOP_LOSS_MARKET_BUY_ORDER: { text: '止损市价买入单', value: 80 },
      STOP_LOSS_MARKET_SELL_ORDER: { text: '止损市价卖出单', value: 90 },
    },
    // 订单状态
    OrderStatus: {
      CANCEL: { text: '已撤销' },
      ENTRUST: { text: '委托中' },
      FAIL: { text: '失败' },
      FINISH: { text: '已完成' },
    },
    // 订单成交方向
    OrderInOut: {
      IN: { text: '进仓' },
      OUT: { text: '平仓' },
    },
    // 持仓单状态
    BGAStatus: {
      BAG: { text: '持仓中' },
      FINISH: { text: '已完成' },
    },
    // 保证金类型
    MarginType: {
      CROSS_MARGIN: { text: '全仓' },
      ISOLATED_MARGIN: { text: '逐仓' },
    },
    // 客户管理-交易账号-结余-表格-类型
    CustomerBalanceRecordType: {
      DEPOSIT: { text: '充值' },
      DEPOSIT_SIMULATE: { text: '模拟充值' },
      WITHDRAWAL: { text: '提现' },
      MARGIN: { text: '保证金' },
      PROFIT: { text: '盈亏' },
      // GIFT: { text: '赠金' },
      BALANCE: { text: '结余' },
      TRANSFER: { text: '转账' },
      // ZERO: { text: '归零' },
      // FOLLOW_PROFIT: { text: '跟单分润' },
      HANDLING_FEES: { text: '手续费' },
      INTEREST_FEES: { text: '库存费' },
      FEE: { text: '手续费' },
      ACTIVITY: { text: '活动' },
      // BACK: { text: '退回' }
    },
    // 可用预付款
    UsableAdvanceCharge: {
      NOT_PROFIT_LOSS: { text: '不计算未实现盈亏' },
      PROFIT_LOSS: { text: '计算未实现盈亏' },
    }, // 出金订单状态
    PaymentWithdrawalOrderStatus: {
      SUCCESS: { text: '审核通过' },
      RECEIPT: { text: '已到账' },
      WAIT: { text: '转账中' },
      REJECT: { text: '拒绝' },
      FAIL: { text: '失败' },
    },
  }
  //  ============= 业务枚举值 ================
  // // 使用text形式命名，方便表格 valueEnum 消费
  // const Enum = Object.keys(Enums).reduce((acc, key) => {
  //   acc[key] = Object.keys(Enums[key]).reduce((innerAcc, innerKey) => {
  //     innerAcc[innerKey] = {
  //       ...Enums[key][innerKey],
  //       text: Enums[key][innerKey].key ? intl.formatMessage({ id: Enums[key][innerKey].key }) : undefined
  //     }
  //     return innerAcc
  //   }, {})
  //   return acc
  // }, {})

  //  ============= 枚举对象转options数组选项 ================
  const enumToOptions = (enumKey: keyof typeof Enum, valueKey?: string) => {
    const options: Array<{ value: any; label: string }> = []
    const enumObj = Enum[enumKey] as any

    Object.keys(enumObj).forEach((key) => {
      options.push({
        value: valueKey ? enumObj[key][valueKey] : key,
        label: enumObj[key].text,
      })
    })

    return options
  }

  type RetType = {
    Enum: Record<keyof typeof Enum, { [key: string]: { text: string; color?: string } }>
    enumToOptions: (enumKey: keyof typeof Enum, valueKey?: string) => Array<{ value: any; label: string }>
  }

  const ret: RetType = {
    Enum,
    enumToOptions,
  }

  return ret
}
