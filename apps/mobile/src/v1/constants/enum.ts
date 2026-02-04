
import { i18n } from '@lingui/core'
import { t} from '@lingui/core/macro'

// 交易方向
export const OP_BUY = 0 // 买入
export const OP_SELL = 1 // 卖出

// 转换星期文本
export type IWeekDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
export const transferWeekDay = (weekDay: IWeekDay) => {
  const text = {
    MONDAY: t`周一`,
    TUESDAY: t`周二`,
    WEDNESDAY: t`周三`,
    THURSDAY: t`周四`,
    FRIDAY: t`周五`,
    SATURDAY: t`周六`,
    SUNDAY: t`周日`
  }[weekDay]

  return text
}

// 订单类型
export const ORDER_TYPE = {
  /** 市价单 */
  MARKET_ORDER: 'MARKET_ORDER',
  /** 限价买入单 */
  LIMIT_BUY_ORDER: 'LIMIT_BUY_ORDER',
  /** 限价卖出单 */
  LIMIT_SELL_ORDER: 'LIMIT_SELL_ORDER',
  /** 止损限价买入单 */
  STOP_LOSS_LIMIT_BUY_ORDER: 'STOP_LOSS_LIMIT_BUY_ORDER',
  /** 止损限价卖出单 */
  STOP_LOSS_LIMIT_SELL_ORDER: 'STOP_LOSS_LIMIT_SELL_ORDER',
  /** 止损市价买入单 */
  STOP_LOSS_MARKET_BUY_ORDER: 'STOP_LOSS_MARKET_BUY_ORDER',
  /** 止损市价卖出单 */
  STOP_LOSS_MARKET_SELL_ORDER: 'STOP_LOSS_MARKET_SELL_ORDER',
  /** 止损单 */
  STOP_LOSS_ORDER: 'STOP_LOSS_ORDER',
  /** 止盈单 */
  TAKE_PROFIT_ORDER: 'TAKE_PROFIT_ORDER'
}

// 买卖交易方向
export const TRADE_BUY_SELL = {
  /** 买方向 */
  BUY: 'BUY',
  /** 买方向 */
  SELL: 'SELL'
}
export const Enums = {
  // 启用、禁用状态
  Status: {
    DISABLED: { key: 'common.enum.Status.DISABLED' },
    ENABLE: { key: 'common.enum.Status.ENABLE' }
  },
  // 认证状态
  ApproveStatus: {
    TODO: { key: 'common.enum.ApproveStatus.TODO' },
    CANCEL: { key: 'common.enum.ApproveStatus.CANCEL' },
    Disallow: { key: 'common.enum.ApproveStatus.FAIL' },
    SUCCESS: { key: 'common.enum.ApproveStatus.SUCCESS' }
  },
  // 证件类型
  IdentificationType: {
    ID_CARD: { key: 'common.enum.IdentificationType.ID_CARD' },
    PASSPORT: { key: 'common.enum.IdentificationType.PASSPORT' }
  },
  // 银行卡类型
  BankCardType: {
    DEBIT_CARD: { key: 'common.enum.BankCardType.DEBIT_CARD' },
    CREDIT_CARD: { key: 'common.enum.BankCardType.CREDIT_CARD' }
  },
  // 交易方向类型：只有两种 买、卖
  TradeBuySell: {
    BUY: { key: 'common.enum.TradeBuySell.BUY' },
    SELL: { key: 'common.enum.TradeBuySell.SELL' }
  },
  // 订单类型
  OrderType: {
    MARKET_ORDER: { value: 10, key: 'common.enum.OrderType.MARKET_ORDER' },
    STOP_LOSS_ORDER: { value: 20, key: 'common.enum.OrderType.STOP_LOSS_ORDER' },
    TAKE_PROFIT_ORDER: {
      value: 30,
      key: 'common.enum.OrderType.TAKE_PROFIT_ORDERR'
    },
    LIMIT_BUY_ORDER: { value: 40, key: 'common.enum.OrderType.LIMIT_BUY_ORDER' },
    LIMIT_SELL_ORDER: { value: 50, key: 'common.enum.OrderType.LIMIT_SELL_ORDER' },
    STOP_LOSS_LIMIT_BUY_ORDER: {
      value: 60,
      key: 'common.enum.OrderType.STOP_LOSS_LIMIT_BUY_ORDER'
    },
    STOP_LOSS_LIMIT_SELL_ORDER: {
      value: 70,
      key: 'common.enum.OrderType.STOP_LOSS_LIMIT_SELL_ORDER'
    },
    STOP_LOSS_MARKET_BUY_ORDER: {
      value: 80,
      key: 'common.enum.OrderType.STOP_LOSS_MARKET_BUY_ORDER'
    },
    STOP_LOSS_MARKET_SELL_ORDER: {
      value: 90,
      key: 'common.enum.OrderType.STOP_LOSS_MARKET_BUY_ORDER'
    }
  },
  // 订单状态
  OrderStatus: {
    CANCEL: { key: 'common.enum.OrderStatus.CANCEL' },
    ENTRUST: { key: 'common.enum.OrderStatus.ENTRUST' },
    FAIL: { key: 'common.enum.OrderStatus.FAIL' },
    FINISH: { key: 'common.enum.OrderStatus.FINISH' }
  },
  // 订单成交方向
  OrderInOut: {
    IN: { key: 'common.enum.OrderInOut.IN' },
    OUT: { key: 'common.enum.OrderInOut.OUT' }
  },
  // 持仓单状态
  BGAStatus: {
    BAG: { key: 'common.enum.BGAStatus.BAG' },
    FINISH: { key: 'common.enum.BGAStatus.FINISH' }
  },
  // 保证金类型
  MarginType: {
    CROSS_MARGIN: { key: 'common.enum.MarginType.CROSS_MARGIN' },
    ISOLATED_MARGIN: { key: 'common.enum.MarginType.ISOLATED_MARGIN' }
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
    INTEREST_FEES: { key: 'common.enum.BalanceType.INTEREST_FEES' }
  },
  BalanceType: {
    DEPOSIT: { key: 'common.enum.BalanceType.DEPOSIT' },
    DEPOSIT_SIMULATE: { key: 'common.enum.BalanceType.DEPOSIT_SIMULATE' },
    WITHDRAWAL: { key: 'common.enum.BalanceType.WITHDRAWAL' },
    MARGIN: { key: 'common.enum.BalanceType.MARGIN' },
    PROFIT: { key: 'common.enum.BalanceType.PROFIT' },
    BALANCE: { key: 'common.enum.BalanceType.BALANCE' },
    TRANSFER: { key: 'common.enum.BalanceType.TRANSFER' },
    HANDLING_FEES: { key: 'common.enum.BalanceType.HANDLING_FEES' },
    INTEREST_FEES: { key: 'common.enum.BalanceType.INTEREST_FEES' }
  }
}

// 业务枚举
export const getEnum = () => {
  const t = i18n.t

  //  ============= 业务枚举值 ================
  // 使用text形式命名，方便表格 valueEnum 消费
  const Enum = (Object.keys(Enums) as (keyof typeof Enums)[]).reduce(
    (acc, key) => {
      acc[key] = (Object.keys(Enums[key]) as (keyof (typeof Enums)[typeof key])[]).reduce(
        (innerAcc, innerKey) => {
          const item = Enums[key][innerKey] as { key?: string; value?: number }
          innerAcc[innerKey] = {
            ...item,
            text: item.key ? t(item.key) : undefined
          }
          return innerAcc
        },
        {} as Record<string, { key?: string; value?: number; text?: string }>
      )
      return acc
    },
    {} as Record<keyof typeof Enums, Record<string, { key?: string; value?: number; text?: string }>>
  )

  //  ============= 枚举对象转options数组选项 ================
  const enumToOptions = (enumKey: keyof typeof Enum, valueKey?: string) => {
    const options: { value: any; label: string }[] = []
    const enumObj = Enum[enumKey] as any

    Object.keys(enumObj).forEach((key) => {
      options.push({
        value: valueKey ? enumObj[key][valueKey] : key,
        label: enumObj[key].text
      })
    })

    return options
  }

  type RetType = {
    Enum: Record<keyof typeof Enum, { [key: string]: { text?: string; color?: string; key?: string; value?: number } }>
    enumToOptions: (enumKey: keyof typeof Enum, valueKey?: string) => { value: any; label: string }[]
  }

  const ret: RetType = {
    Enum,
    enumToOptions
  }

  return ret
}
