// 业务相关工具

import { TRADE_BUY_SELL, transferWeekDay } from '@/v1/constants/enum'
import { getEnv } from '@/v1/env'

// import { getIntl, getLocale } from '@umijs/max'

import { formatMin2Time, getUid, groupBy, isImageFile, parseJsonFields } from '.'
import { STORAGE_GET_TRADE_PAGE_SHOW_TIME, STORAGE_SET_TRADE_PAGE_SHOW_TIME } from './storage'

//  =============

// 转换品种-交易时间配置-提交参数
export function transformTradeTimeSubmit(arr: any[]) {
  const result: any = {}

  arr.forEach((item: any) => {
    const weekDay = item.weekDay
    // 星期
    result[weekDay] = {
      // 是否启动独立时间段
      isAlone: item.isAlone,
      // 交易时间
      trade: groupBy(item.trade, 2).map((v: any) => ({
        start: v[0],
        end: v[1],
      })),
      // 报价时间
      price: groupBy(item.price, 2).map((v: any) => ({
        start: v[0],
        end: v[1],
      })),
    }
  })

  return JSON.stringify(result)
}

// 转换品种-交易时间配置-回显
export function transformTradeTimeShow(conf: any) {
  const result: any = []

  Object.keys(conf).forEach((key: string) => {
    result.push({
      // 星期
      weekDay: key,
      // 是否启动独立时间段
      isAlone: conf[key]?.isAlone,
      // 交易时间
      trade: (conf[key]?.trade || [])?.map((v: any) => [v.start, v.end]).flat(),
      // 报价时间
      price: (conf[key]?.price || [])?.map((v: any) => [v.start, v.end]).flat(),
    })
  })

  return result
}

// 返回交易时间段 eg. 00:06-12:00,14:00-18:00
export const formatTimeStr = (time: number[]) => {
  return groupBy(time, 2)
    .map((v) => [`${formatMin2Time(v[0])}-${formatMin2Time(v[1])}`])
    .flat()
    .join(',') // 两个一组，分段区间的开始和结尾值
}

//  =============

// 转换品种-库存费-提交参数
export function transformTradeInventorySubmit(conf: Symbol.HoldingCostConf) {
  const multiplierSubmit: any = {}
  const multiplier: any = conf.multiplier || [] // 本地的数据格式

  console.log('库存费', conf)
  multiplier.forEach((item: any) => {
    multiplierSubmit[item.weekDay] = item.num
  })

  // 转换为接口需要的格式
  conf.multiplier = multiplierSubmit

  return JSON.stringify(conf || {})
}

// 转换品种-库存费-回显
export function transformTradeInventoryShow(conf: Symbol.HoldingCostConf) {
  const multiplierShow: any = [] // 回显的格式

  Object.keys(conf?.multiplier || {}).forEach((key: any) => {
    multiplierShow.push({
      // 星期
      weekDay: key,
      // 显示名称
      weekDayName: transferWeekDay(key),
      // 库存费乘数
      // @ts-ignore
      num: conf?.multiplier[key],
      id: getUid(), // 需要一个唯一值id，否则编辑表格出错
    })
  })

  // 用新的格式覆盖接口返回的
  conf.multiplier = multiplierShow

  return conf
}

//  =============

// 转换品种-手续费配置-提交参数
export function transformTradeFeeSubmit(conf: Symbol.TransactionFeeConf) {
  // 手续费配置
  const transactionFeeConfType = conf?.type // 手续费范围类型字段
  const params = transactionFeeConfType
    ? {
        type: transactionFeeConfType,
        // @ts-ignore
        [transactionFeeConfType]: conf.table?.map((item: any) => {
          return {
            from: item.from,
            to: item.to,
            compute_mode: item.compute_mode,
            market_fee: item.market_fee,
            limit_fee: item.limit_fee,
            min_value: item?.maxMinMap?.min_value,
            max_value: item?.maxMinMap?.max_value,
          }
        }),
      }
    : {}

  return JSON.stringify(params)
}

// 转换品种-手续费配置-回显
export function transformTradeFeeShow(conf: Symbol.TransactionFeeConf) {
  const type = conf?.type
  const trade_hand = conf?.trade_hand
  const trade_vol = conf?.trade_vol
  const list = type === 'trade_hand' ? trade_hand : trade_vol
  // @ts-ignore
  // table是传给表格回显的
  conf.table = list?.map((item) => {
    return {
      ...item,
      id: getUid(), // 需要一个唯一值id，否则编辑表格出错
      maxMinMap: {
        // 用于显示在表格上的范围值，一个输入框 对应两个值
        min_value: item.min_value,
        max_value: item.max_value,
      },
    }
  })
  return conf
}

// ============

// 转换品种-预付款配置-提交参数
export function transformTradePrepaymentConfSubmit(conf: Symbol.PrepaymentConf) {
  // 处理浮动杠杆参数
  if (conf?.float_leverage?.lever_grade?.length) {
    conf.float_leverage.lever_grade = conf.float_leverage.lever_grade
      .filter((item: any) => item.bag_nominal_value)
      .map((item: any) => {
        return {
          bag_nominal_value: item.bag_nominal_value,
          lever_start_value: item?.maxMinMap?.lever_start_value,
          lever_end_value: item?.maxMinMap?.lever_end_value,
        }
      })
  }
  return JSON.stringify(conf || {})
}

// 转换品种-预付款配置-回显
export function transformTradePrepaymentConfShow(conf: Symbol.PrepaymentConf) {
  // 自定义杠杆表格回显
  const lever_grade = conf?.float_leverage?.lever_grade
  if (lever_grade?.length) {
    // @ts-ignore
    conf.float_leverage.lever_grade = lever_grade.map((item) => {
      return {
        ...item,
        id: getUid(), // 需要一个唯一值id，否则编辑表格出错
        maxMinMap: {
          // 用于显示在表格上的范围值，一个输入框 对应两个值
          lever_start_value: item.lever_start_value,
          lever_end_value: item.lever_end_value,
        },
      }
    })
  }
  return conf
}

/**
 * 格式化对象里面的多选字段
 * @param fields 字段
 * @param obj 对象
 * @returns
 */
export const formatMultipleValue = (fields: string[], obj: any) => {
  if (!fields?.length) return
  const result: any = {}
  fields.forEach((key) => {
    result[key] = Array.isArray(obj[key]) ? obj[key] : (obj[key] || '').split(',') || []
  })
  return {
    ...obj,
    ...result,
  }
}

/**
 * 格式化多选参数
 * @param value
 * @returns
 */
export const formatMultipleValueSubmit = (value: any) => {
  if (Array.isArray(value)) {
    return value.join(',')
  }
  return value
}

// 格式化品种配置详情
export const formatSymbolConf = (data: any) => {
  let symbolConf = data
  if (symbolConf) {
    // 字符串对象转对象
    symbolConf = parseJsonFields(symbolConf, [
      'spreadConf', // 点差配置
      'prepaymentConf', // 预付款配置
      'tradeTimeConf', // 交易时间配置
      'quotationConf', // 报价配置
      'transactionFeeConf', // 手续费配置
      'holdingCostConf', // 库存费配置
    ])
    // 格式化多选字段，转化为数组
    symbolConf = formatMultipleValue(['orderType'], symbolConf)

    // 预付款配置回显处理
    const prepaymentConf = symbolConf?.prepaymentConf as unknown as Symbol.PrepaymentConf
    if (prepaymentConf) {
      // @ts-ignore
      symbolConf.prepaymentConf = transformTradePrepaymentConfShow(prepaymentConf)
    }

    // 库存费配置回显处理
    const holdingCostConf = symbolConf?.holdingCostConf as unknown as Symbol.HoldingCostConf
    if (holdingCostConf) {
      // @ts-ignore
      symbolConf.holdingCostConf = transformTradeInventoryShow(holdingCostConf)
    }

    // 交易时间配置回显处理
    const tradeTimeConf = symbolConf?.tradeTimeConf as unknown as Symbol.TradeTimeConf
    if (tradeTimeConf) {
      // @ts-ignore
      symbolConf.tradeTimeConf = transformTradeTimeShow(tradeTimeConf)
    }

    // 手续费配置回显处理
    const transactionFeeConf = symbolConf?.transactionFeeConf as unknown as Symbol.TransactionFeeConf
    if (transactionFeeConf) {
      // @ts-ignore
      symbolConf.transactionFeeConf = transformTradeFeeShow(transactionFeeConf)
    }
  }
  return symbolConf
}

/**
 * 获取默认品种图片地址
 * @param imgUrl 图片地址
 * @returns
 */
export const getSymbolIcon = (imgUrl: any) => {
  const ENV = getEnv()
  const imgDomain = ENV?.imgDomain
  return isImageFile(imgUrl) ? `${imgDomain}${imgUrl}` : `/img/default-symbol-icon.png`
}

/**
 * 获取买卖、保证金文字提示和颜色
 * @param item
 * @returns
 */
export const getBuySellInfo = (item: any) => {
  // const intl = getIntl()
  const mode = item?.conf?.prepaymentConf?.mode
  const isFixedMargin = mode === 'fixed_margin' // 固定保证金
  const isBuy = item.buySell === TRADE_BUY_SELL.BUY
  const buySellText = isBuy ? '买入' : '卖出'

  let marginTypeText = ''
  if (item.marginType) {
    marginTypeText = item.marginType === 'CROSS_MARGIN' ? '全仓' : '逐仓'
  }
  const fixedMarginText = isFixedMargin ? '固定' : ''
  const leverageMultiple = item.leverageMultiple
  const leverageText = leverageMultiple ? `${leverageMultiple}X` : fixedMarginText

  let text = buySellText

  if (leverageText) {
    text += ` · ${leverageText}`
  }

  let text2 = buySellText
  if (marginTypeText) {
    text2 += ` · ${marginTypeText}`
  }
  if (leverageText) {
    text2 += ` · ${leverageText}`
  }

  return {
    text,
    text2,
    buySellText,
    marginTypeText,
    leverageText,
    colorClassName: isBuy ? 'text-green' : 'text-red',
  }
}

/**
 * 根据字典的value拆分语言，根据当前切换的语言
 * @param value 字典的value值
 */
export const getDictLabelByLocale = (value: string) => {
  const [zh, en] = (value || '').split(',')
  // return getLocale() === 'zh-TW' ? zh : en || zh
  return 'zh-TW' === 'zh-TW' ? zh : en || zh
}

// 格式化品种数据为字母列表分类
export function formatSymbolList(symbolList: any) {
  // 1. 首先提取所有symbol并按字母排序
  const symbols = symbolList.map((item: any) => item.symbol).sort()

  // 2. 创建一个对象来存储按首字母分组的数据
  const groupedData: any = {}

  // 3. 遍历排序后的symbols，按首字母分组
  symbols.forEach((symbol: string) => {
    const firstLetter = symbol.charAt(0).toUpperCase()
    if (!groupedData[firstLetter]) {
      groupedData[firstLetter] = []
    }
    groupedData[firstLetter].push(symbol)
  })

  // 4. 转换成最终需要的格式
  const result = Object.keys(groupedData)
    .sort() // 确保A-Z顺序
    .map((letter) => ({
      title: letter,
      data: groupedData[letter],
    }))

  return result
}

export const checkPageShowTime = (duration?: number) => {
  const time = duration || 2 * 60 * 1000
  // 记录上次进入时间
  const updateTime = STORAGE_GET_TRADE_PAGE_SHOW_TIME()
  // 缓存时间大于5分钟、初次载入
  if ((updateTime && Date.now() - updateTime > time) || !updateTime) {
    STORAGE_SET_TRADE_PAGE_SHOW_TIME(Date.now())
    return true
  }
  return false
}

// 移除后台发送过来的消息模板中的字符[symbol=] [tradeVolume=]
// "Order [symbol=BTC] [tradeVolume=0.01] [tradeDirection=BUY] Lot successful" => Order BTC 0.01 BUY Lot successful
export const removeOrderMessageFieldNames = (message: string) => {
  return (message || '')
    .replace(/\[[^\]]+=/g, '')
    .replace(/\]/g, '')
    .trim()
}

/**解析消息模板返回的消息字符串，并提取所需的字段
 * 示例
 * Order [symbol=BTC] [tradeVolume=0.01] [tradeDirection=BUY] Lot successful" =>
  {
    "symbol": "BTC",
    "tradeVolume": "0.01",
    "tradeDirection": "BUY"
  }
 * @param message
 * @returns
 */
type MessageResult = {
  symbol: string
  /**下单手数 */
  tradeVolume: string
  /**订单方向 */
  tradeDirection: API.TradeBuySell
  /**保证金类型 */
  marginType: API.MarginType
  /**订单类型 */
  orderType: API.OrderType
}
export const parseOrderMessage = (message: string) => {
  const regex = /\[([^\]]+)=([^\]]+)\]/g
  const result: any = {}
  let match

  while ((match = regex.exec(message)) !== null) {
    const key = match?.[1]?.trim()
    const value = match?.[2]?.trim()
    if (key && value) {
      result[key] = value
    }
  }

  return result as MessageResult
}

/**
 * 根据当前语言返回当前账户简介信息
 * @param synopsis
 * @returns
 */
export const getAccountSynopsisByLng = (synopsis: any) => {
  // const locale = getLocale()
  const locale = 'zh-TW'
  // 没有找到设置的语言，则取第一项
  const item =
    Array.isArray(synopsis) && synopsis.length
      ? synopsis.find((item: AccountGroup.SynopsisConf) => item.language === locale) || synopsis?.[0] || {}
      : {}
  return item as AccountGroup.SynopsisConf
}
