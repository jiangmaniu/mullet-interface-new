import { toJS } from 'mobx'

import { IPositionItem } from '@/pages/web/trade/comp/TradeRecord/comp/PositionList'
import { TRADE_BUY_SELL } from '@/v1/constants/enum'
import { IQuoteItem } from '@/v1/mobx/ws.types'
import { stores } from '@/v1/provider/mobxProvider'
import { multiply, subtract } from '@/v1/utils/float'

import { toFixed } from '.'

/**
 * 格式化交易时间段
 * @param a 分钟
 * @returns
 */
export function formatSessionTime(a: any) {
  let b: any = (a / 60).toFixed(2)
  if (parseInt(b) === parseFloat(b)) {
    // console.log('整数')
    if (b < 10) {
      return '0' + parseInt(b).toFixed(0) + ':' + '00'
    } else {
      return parseInt(b).toFixed(0) + ':' + '00'
    }
  } else {
    let c: any = b.substring(b.indexOf('.') + 1, b.length) * 0.01
    let d: any = parseInt(b).toFixed(0)
    if (d < 10) {
      return '0' + d + ':' + (c * 60).toFixed(0)
    } else {
      return d + ':' + (c * 60).toFixed(0)
    }
  }
}

/**
 * 计算汇率
 * @param value 转换的值
 * @param unit 盈利货币单位
 * @param buySell 买卖方向
 * @returns
 */
type IExchangeRateParams = {
  /**需要转化的值 */
  value: any
  /**盈利货币单位 */
  unit: any
  /**买卖方向 */
  buySell: API.TradeBuySell | undefined
}
export const calcExchangeRate = ({ value, unit, buySell }: IExchangeRateParams) => {
  const { trade, ws } = stores
  const quotes = ws.quotes
  // 检查货币是否是外汇/指数，并且不是以 USD 为单位，比如AUDNZD => 这里单位是NZD，找到NZDUSD或者USDNZD的指数取值即可
  // 数字货币、商品黄金石油这些以美元结算的，单位都是USD不需要参与转化直接返回
  // 非USD单位的产品都要转化为美元
  // if ((quoteList2.some((v) => v.name === symbol) || quoteList3.some((v) => v.name === symbol)) && unit !== 'USD') {
  const allSimpleSymbolsMap = trade.allSimpleSymbolsMap // 全部品种map
  let qb: any = {}
  let profit = value || 0
  const isBuy = buySell === TRADE_BUY_SELL.BUY // 是否买入
  const isSell = buySell === TRADE_BUY_SELL.SELL // 是否卖出

  // 交易品种配置的盈利货币单位和账户组配置的货币单位不一致时，需要转换
  if (trade.currentAccountInfo?.currencyUnit !== unit) {
    // USD开头是除法，USD结尾是乘法
    // 除法
    const divName = ('USD' + unit).toUpperCase() // 如 USDNZD
    // 乘法
    const mulName = (unit + 'USD').toUpperCase() // 如 NZDUSD

    // 使用汇率品种的dataSourceCode去获取行情
    // const dataSourceCode = (allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName] || {})?.dataSourceCode
    const symbol = (allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName] || {})?.symbol
    const accountGroupId = trade.currentAccountInfo?.accountGroupId
    const divNameKey = symbol ? `${accountGroupId}/${divName}` : ''
    const mulNameKey = symbol ? `${accountGroupId}/${mulName}` : ''

    const divNameQuote = toJS(quotes.get(divNameKey))
    const mulNameQuote = toJS(quotes.get(mulNameKey))

    // 检查是否存在 divName 对应的报价信息
    if (divNameQuote) {
      qb = divNameQuote

      // 检查交易指令是否是买入，如果是，则获取 divName 对应的报价信息，并用其 bid 除以 profit
      if (isBuy) {
        profit = profit / Number(qb?.priceData?.buy)
      }
      // 检查交易指令是否是卖出，如果是，则获取 divName 对应的报价信息，并用其 ask 除以 profit
      else if (isSell) {
        profit = profit / Number(qb?.priceData?.sell)
      }
    }
    // 如果 divName 对应的报价信息不存在，则检查 mulName 对应的报价信息
    else if (mulNameQuote) {
      qb = mulNameQuote
      // 检查交易指令是否是买入，如果是，则获取 mulName 对应的报价信息，并用其 bid 乘以 profit
      if (isBuy) {
        profit = profit * Number(qb?.priceData?.buy)
      }
      // 检查交易指令是否是卖出，如果是，则获取 mulName 对应的报价信息，并用其 ask 乘以 profit
      else if (isSell) {
        profit = profit * Number(qb?.priceData?.sell)
      }
    }
  }

  return Number(profit)
}

/**
 * 计算订单中的保证金汇率
 * @param param0
 * @returns
 */
export const calcOrderMarginExchangeRate = ({
  value,
  exchangeSymbol,
  exchangeRate,
}: {
  /**需要转化的值 */
  value: any
  /**汇率品种 */
  exchangeSymbol: string
  /**汇率品种的汇率 */
  exchangeRate: string
}) => {
  if (!exchangeSymbol || !exchangeRate) return value

  // USD开头是除法
  if (exchangeSymbol.startsWith('USD')) {
    return value / Number(exchangeRate)
  }
  // USD结尾是乘法
  if (exchangeSymbol.endsWith('USD')) {
    return value * Number(exchangeRate)
  }
  return value
}

/**
 * 将计算的浮动盈亏转化为美元单位
 * @param dataSourceSymbol 数据源品种名称
 * @param positionItem 持仓item
 * @returns
 */
export function covertProfit(positionItem: Order.BgaOrderPageListItem, includeFee?: boolean) {
  const symbol = positionItem?.symbol
  if (!symbol) return
  const quoteInfo = getCurrentQuote(symbol)
  const symbolConf = positionItem?.conf
  const bid = Number(quoteInfo?.bid || 0)
  const ask = Number(quoteInfo?.ask || 0)
  const unit = symbolConf?.profitCurrency // 盈利货币单位
  const number = Number(positionItem.orderVolume || 0) // 手数
  const consize = Number(symbolConf?.contractSize || 1) // 合约量
  const openPrice = Number(positionItem.startPrice || 0) // 开仓价
  const isForeign = symbolConf?.calculationType === 'FOREIGN_CURRENCY' // 外汇

  // 浮动盈亏  (买入价-卖出价) x 合约单位 x 交易手数
  let profit =
    bid && ask
      ? positionItem.buySell === TRADE_BUY_SELL.BUY
        ? (bid - openPrice) * number * consize
        : (openPrice - ask) * number * consize
      : 0

  // 转换汇率
  profit = calcExchangeRate({
    value: profit,
    unit,
    buySell: positionItem.buySell,
  })

  if (includeFee) {
    profit = Number(profit) + Number(positionItem.handlingFees || 0) + Number(positionItem.interestFees || 0)
  }

  // 返回转化后的 profit
  return Number(toFixed(profit))
}

// 计算收益率
export const calcYieldRate = (item: IPositionItem, precision: any, profitValue?: number) => {
  const conf = item.conf as Symbol.SymbolConf
  const orderMargin = Number(item.orderMargin || 0) // 开仓保证金
  // 收益率 = 浮动盈亏 / 保证金
  const profit = profitValue || item.profit || 0
  const value = toFixed((profit / orderMargin) * 100, precision)
  return profit && orderMargin ? (value > 0 ? '+' + value : value) + '%' : ''
}

/**
 * 计算订单的预估强平价
 * @param item 持仓单Item
 * @returns
 */
export const calcForceClosePrice = (item: Partial<IPositionItem>) => {
  const { trade } = stores
  let { occupyMargin, balance } = trade.getAccountBalance()
  const digits = item?.symbolDecimal
  const conf = item.conf as Symbol.SymbolConf
  const prepaymentConf = conf?.prepaymentConf as Symbol.PrepaymentConf
  const contractSize = Number(conf?.contractSize || 0) // 合约大小
  const orderVolume = Number(item.orderVolume || 0) // 手数
  const orderMargin = item.orderMargin || 0 // 单笔订单的占用保证金
  const isCrossMargin = item.marginType === 'CROSS_MARGIN' // 全仓
  const startPrice = Number(item.startPrice || 0) // 开仓价格
  let profit = item.profit || 0 // 本单浮动盈亏
  let compelCloseRatio = item.compelCloseRatio || 0 // 强制平仓比例
  compelCloseRatio = compelCloseRatio ? compelCloseRatio / 100 : 0

  const isBuy = item.buySell === 'BUY'

  let leverage = 1
  if (prepaymentConf?.mode === 'fixed_leverage') {
    // 固定杠杆
    leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple)
  } else if (prepaymentConf?.mode === 'float_leverage') {
    // 浮动杠杆，获取用户设置的值
    leverage = trade.leverageMultiple
  }

  // 优先获取订单列表存在的值
  leverage = item.leverageMultiple || leverage || 1

  // 净值 = 账户余额 - 库存费 - 手续费 + 浮动盈亏
  // 汇率品种USD在前面，用除法
  // 汇率品种USD在后，用乘法
  // 净值 - (开仓价格 - 强平价格) * 合约大小 * 手数 * 汇率(乘或除) / 占用保证金 = 强平比例

  // 买：多头强平价格 = 开仓价格 - (净值 - 本单盈亏 - 账户占用保证金*强平比例) / (合约大小 * 手数 * (1/杠杆) * 汇率(乘或除))
  let buyForceClosePrice = 0
  // 卖：空头强平价格 = 开仓价格 + (净值 - 本单盈亏 + 账户占用保证金*强平比例) / (合约大小 * 手数 * (1/杠杆) * 汇率(乘或除))
  let sellForceClosePrice = 0

  // 计算汇率
  let exchangeRateValue = calcExchangeRate({
    value: contractSize * orderVolume * (1 / leverage),
    unit: conf?.profitCurrency,
    buySell: item.buySell,
  })

  // 全仓
  if (isCrossMargin) {
    const value = (balance - profit - occupyMargin * compelCloseRatio) / exchangeRateValue
    buyForceClosePrice = toFixed(startPrice - value)
    sellForceClosePrice = toFixed(startPrice + value)
  } else {
    // 逐仓的净值 = 账户余额(单笔订单的保证金) + 库存费 + 手续费 + 浮动盈亏
    balance = orderMargin + Number(item.interestFees || 0) + Number(item.handlingFees || 0) + Number(item.profit || 0)
    // 单笔订单的占用保证金
    occupyMargin = orderMargin
    const value = (balance - profit - occupyMargin * compelCloseRatio) / exchangeRateValue
    buyForceClosePrice = toFixed(startPrice - value)
    sellForceClosePrice = toFixed(startPrice + value)
  }

  const retValue = isBuy ? buyForceClosePrice : sellForceClosePrice

  return retValue > 0 ? toFixed(retValue, digits) : ''
}

// 获取配置的手续费
export const getHandlingFees = (conf: Symbol.SymbolConf, orderType: API.OrderType | string, orderVolume: number) => {
  const feeConfList =
    conf?.transactionFeeConf?.type === 'trade_vol'
      ? conf?.transactionFeeConf?.trade_vol
      : conf?.transactionFeeConf?.trade_hand // 手续费配置列表
  const feeConfItem = (feeConfList || []).filter((v) => orderVolume >= v.from && orderVolume <= v.to)?.[0]
  const feeComputeMode = feeConfItem?.compute_mode // 手续费计算模式
  let marketFee = Number(feeConfItem?.market_fee || 0) // 市价手续费
  let limitFee = Number(feeConfItem?.limit_fee || 0) // 限价手续费

  if (feeComputeMode === 'percentage') {
    // 后台品种配置的手续费，选择百分比形式
    marketFee = marketFee / 100 // 读取市价手续费的百分比值
    limitFee = limitFee / 100 // 读取市价手续费的百分比值
  }
  const handlingFees = orderType === 'MARKET_ORDER' ? marketFee : limitFee // 手续费

  return handlingFees
}

type IExpectedForceClosePrice = {
  /**手数 */
  orderVolume: number
  /**订单保证金 */
  orderMargin: number
  /**买卖方向 */
  buySell: API.TradeBuySell
  /**订单类型 */
  orderType: API.OrderType | string
}
/**
 * 计算下单时的预估强平价
 * @returns
 */
export const calcExpectedForceClosePrice = (obj: IExpectedForceClosePrice) => {
  const { orderVolume, orderType, orderMargin, buySell } = obj
  const { trade } = stores
  const quote = getCurrentQuote()

  const conf = quote?.symbolConf

  const handlingFees = getHandlingFees(conf, orderType, orderVolume) // 手续费

  const item = {
    conf,
    symbolDecimal: quote?.digits,
    orderVolume,
    orderMargin,
    buySell,
    marginType: trade.marginType,
    startPrice: buySell === TRADE_BUY_SELL.BUY ? quote?.ask : quote?.bid,
    compelCloseRatio: trade?.currentAccountInfo?.compelCloseRatio || 0,
    interestFees: 0, // 库存费0
    handlingFees, // 手续费
    profit: 0, // 浮动盈亏0
  }
  return calcForceClosePrice(item)
}

type IExpectedMargin = {
  /**手数 */
  orderVolume: number
  /**买卖方向 */
  buySell: API.TradeBuySell
  /**订单类型 */
  orderType: API.OrderType | string
  /**限价单 用户输入的价格 */
  price?: number
}
/**
 * 实时计算下单时预估保证金
 * @param param0
 * @returns
 */
// export const calcExpectedMargin = (obj: IExpectedMargin) => {
//   let { buySell, orderType, orderVolume, price } = obj
//   const { trade } = stores
//   const quote = getCurrentQuote()

//   orderVolume = Number(orderVolume || 0) // 手数

//   const conf = quote?.symbolConf
//   const prepaymentConf = quote?.prepaymentConf
//   const contractSize = Number(conf?.contractSize || 0) // 合约大小
//   const isCrossMargin = trade.marginType === 'CROSS_MARGIN' // 全仓
//   const currentPrice = buySell === TRADE_BUY_SELL.BUY ? quote?.ask : quote?.bid // 现价

//   let compelCloseRatio = trade?.currentAccountInfo?.compelCloseRatio || 0 // 强平比例
//   compelCloseRatio = compelCloseRatio ? compelCloseRatio / 100 : 0

//   price = Number(orderType === 'MARKET_ORDER' ? currentPrice : price) // 区分市价单和限价单价格

//   // 交易品种选择外汇类型，计算预付款不需要加上价格。设置价格为1
//   if (conf?.calculationType === 'FOREIGN_CURRENCY') {
//     price = 1
//   }

//   let leverage = 1
//   if (prepaymentConf?.mode === 'fixed_leverage') {
//     // 固定杠杆
//     leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple)
//   } else if (prepaymentConf?.mode === 'float_leverage') {
//     // 浮动杠杆，获取用户设置的值
//     leverage = trade.leverageMultiple
//   }

//   let expectedMargin = 0 // 预估保证金

//   // 固定预付款模式：占用保证金 = 固定预付款 * 手数
//   if (prepaymentConf?.mode === 'fixed_margin') {
//     expectedMargin = (prepaymentConf.fixed_margin?.initial_margin || 0) * orderVolume
//   } else {
//     // 杠杆模式：占用保证金 = 合约大小 * 手数 * 价格(买或卖) / 杠杆
//     expectedMargin = (contractSize * orderVolume * price) / leverage
//   }

//   // 转化汇率
//   return calcExchangeRate({
//     value: expectedMargin,
//     unit: conf?.prepaymentCurrency,
//     buySell
//   })
// }

/**
 * 计算可开仓手数
 * @param param0
 * @returns
 */
export const getMaxOpenVolume = ({ buySell }: { buySell: API.TradeBuySell }) => {
  const trade = stores.trade
  const { availableMargin } = trade.getAccountBalance()
  const quote = getCurrentQuote()
  const prepaymentConf = quote?.prepaymentConf
  const consize = quote.consize
  const mode = prepaymentConf?.mode
  const currentPrice = buySell === 'SELL' ? quote?.bid : quote?.ask
  let volume = 0

  const getExchangeValue = (value: number) => {
    return calcExchangeRate({
      value,
      unit: quote?.symbolConf?.prepaymentCurrency,
      buySell,
    })
  }

  const exchangeValue = getExchangeValue(currentPrice * consize || 0)

  if (availableMargin) {
    if (mode === 'fixed_margin') {
      // 可用/固定预付款

      // 需要换汇处理
      const marginExchangeValue = getExchangeValue(prepaymentConf?.fixed_margin?.initial_margin || 0)
      const initial_margin = Number(marginExchangeValue)
      volume = initial_margin ? Number(availableMargin / initial_margin) : 0
    } else if (mode === 'fixed_leverage') {
      // 固定杠杆：可用 /（价格*合约大小*手数x/固定杠杆）
      // 手数x = 可用 * 固定杠杆 / (价格*合约大小)*汇率
      const fixed_leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple || 0)
      if (fixed_leverage) {
        volume = (availableMargin * fixed_leverage) / exchangeValue
      }
    } else if (mode === 'float_leverage') {
      // 浮动杠杆：可用 /（价格*合约大小*手数x/浮动杠杆）
      // 手数x = 可用 * 固定杠杆 / (价格*合约大小)*汇率
      const float_leverage = Number(trade.leverageMultiple || 1)
      if (float_leverage) {
        volume = (availableMargin * float_leverage) / exchangeValue
      }
    }
  }

  return volume > 0 ? toFixed(volume) : '0.00'
}

/**
 * 获取当前激活打开的品种行情，高开低收，涨幅百分比
 * @param {*} currentSymbol 当前传入的symbolName
 * @returns
 */

// 定义缓存的数据类型
const quoteCache = new Map()
export function getCurrentQuote(currentSymbolName?: string) {
  const { ws, trade } = stores
  const { quotes } = ws
  let symbol = currentSymbolName || trade.activeSymbolName // 后台自定义的品种名称，symbol是唯一的

  // const cacheKey = `${symbol}`
  // const cachedData = quoteCache.get(cacheKey)
  // // 检查缓存是否需要更新
  // if (cachedData && !hasQuoteChanged(cachedData)) {
  //   return cachedData
  // }

  // 当前品种的详细信息
  // const currentSymbol = (trade.symbolListAll.find((item) => item.symbol === symbol) || {}) as Account.TradeSymbolListItem
  const currentSymbol = trade.symbolMapAll?.[symbol] || {}
  const dataSourceSymbol = currentSymbol?.dataSourceSymbol
  const dataSourceCode = currentSymbol?.dataSourceCode
  const accountGroupId = currentSymbol?.accountGroupId
  const dataSourceKey = `${accountGroupId}/${symbol}` // 获取行情的KEY，数据源+品种名称去获取

  const currentQuote = quotes.get(dataSourceKey) // 行情信息
  const symbolConf = currentSymbol?.symbolConf as Symbol.SymbolConf // 当前品种配置
  const prepaymentConf = currentSymbol?.symbolConf?.prepaymentConf as Symbol.PrepaymentConf // 当前品种预付款配置
  const transactionFeeConf = currentSymbol?.symbolConf?.transactionFeeConf as Symbol.TransactionFeeConf // 当前品种手续费配置
  const holdingCostConf = currentSymbol?.symbolConf?.holdingCostConf as Symbol.HoldingCostConf // 当前品种手续费配置
  const spreadConf = currentSymbol?.symbolConf?.spreadConf as Symbol.SpreadConf // 当前品种点差配置
  const tradeTimeConf = currentSymbol?.symbolConf?.tradeTimeConf as Symbol.TradeTimeConf // 当前品种交易时间配置
  const quotationConf = currentSymbol?.symbolConf?.quotationConf as Symbol.QuotationConf // 当前品种交易时间配置
  const symbolNewTicker = stores.trade.tradeSymbolTickerMap[symbol] || currentSymbol.symbolNewTicker // 高开低收价格信息，只加载一次，不会实时跳动，需要使用ws的覆盖
  const symbolNewPrice = currentSymbol.symbolNewPrice // 第一口报价信息，只加载一次，不会实时跳动，需要使用ws的覆盖
  const quoteTimeStamp = currentQuote?.priceData?.id || symbolNewPrice?.id // 行情时间戳

  const digits = Number(currentSymbol?.symbolDecimal || 2) // 小数位，默认2
  // ask是买价，切记ask买价一般都比bid卖价高：卖盘买价（相对于卖价是高价） 加了点差的价格
  let ask = toFixed(Number(currentQuote?.priceData?.sell || symbolNewPrice?.sell || 0), digits, false)
  // bid是卖价：买盘卖价（相对于买价是低价） 没有加点差的价格
  let bid = toFixed(Number(currentQuote?.priceData?.buy || symbolNewPrice?.buy || 0), digits, false)
  const open = Number(symbolNewTicker?.open || 0) // 开盘价
  const high = Math.max.apply(Math, [Number(symbolNewTicker?.high || 0), bid]) // 拿当前价格跟首次返回的比
  const low = Math.min.apply(Math, [Number(symbolNewTicker?.low || 0), bid]) // 拿当前价格跟首次返回的比
  const close = Number(bid || symbolNewTicker?.close || 0) // 使用卖价作为最新的收盘价格
  const percent = bid && open ? (((bid - open) / open) * 100).toFixed(2) : 0

  // 买卖点差
  const spread = Math.abs(multiply(Math.abs(Number(subtract(bid, ask))), Math.pow(10, digits)) as number)

  const result = {
    symbol, // 用于展示的symbol自定义名称
    dataSourceSymbol, // 数据源品种
    dataSourceKey, // 获取行情源的key
    digits,
    currentQuote,
    quoteTimeStamp,
    currentSymbol, // 当前品种信息
    symbolConf, // 全部品种配置
    prepaymentConf, // 预付款配置
    transactionFeeConf, // 手续费配置
    holdingCostConf, // 库存费配置
    spreadConf, // 点差配置
    tradeTimeConf, // 交易时间配置
    quotationConf, // 报价配置
    symbolNewTicker, // 高开低收
    symbolNewPrice, // 第一口报价信息
    percent, //涨幅百分比
    quotes,
    consize: Number(symbolConf?.contractSize || 0),
    ask,
    bid,
    high: toFixed(high, digits, false), //高
    low: toFixed(low, digits, false), //低
    open: toFixed(open, digits, false), //开
    close: toFixed(close, digits, false), //收
    spread, // 买卖点差
    bidDiff: currentQuote?.bidDiff || 0,
    askDiff: currentQuote?.askDiff || 0,
    hasQuote: !!currentQuote?.priceData?.buy, // 是否存在行情
  }

  // quoteCache.set(cacheKey, result)

  return result
}

export function getCurrentQuoteV2(
  quotes: Map<string, IQuoteItem>,
  currentSymbolName: string,
  symbolMap: { [key: string]: Account.TradeSymbolListItem },
) {
  let symbol = currentSymbolName // 后台自定义的品种名称，symbol是唯一的, || trade.activeSymbolName 改成外部传入

  const currentSymbol = symbolMap?.[symbol] || {}
  const dataSourceCode = currentSymbol?.dataSourceCode
  const accountGroupId = currentSymbol?.accountGroupId
  // 当前品种的详细信息
  const dataSourceKey = Number(accountGroupId) ? `${accountGroupId}/${symbol}` : `${dataSourceCode}/${symbol}` // 获取行情的KEY，数据源+品种名称去获取
  const currentQuote = quotes.get(dataSourceKey) // 行情信息

  const dataSourceSymbol = currentSymbol?.dataSourceSymbol
  const symbolConf = currentSymbol?.symbolConf as Symbol.SymbolConf // 当前品种配置
  const prepaymentConf = currentSymbol?.symbolConf?.prepaymentConf as Symbol.PrepaymentConf // 当前品种预付款配置
  const transactionFeeConf = currentSymbol?.symbolConf?.transactionFeeConf as Symbol.TransactionFeeConf // 当前品种手续费配置
  const holdingCostConf = currentSymbol?.symbolConf?.holdingCostConf as Symbol.HoldingCostConf // 当前品种手续费配置
  const spreadConf = currentSymbol?.symbolConf?.spreadConf as Symbol.SpreadConf // 当前品种点差配置
  const tradeTimeConf = currentSymbol?.symbolConf?.tradeTimeConf as Symbol.TradeTimeConf // 当前品种交易时间配置
  const quotationConf = currentSymbol?.symbolConf?.quotationConf as Symbol.QuotationConf // 当前品种交易时间配置
  const symbolNewTicker = stores.trade.tradeSymbolTickerMap[symbol] || currentSymbol.symbolNewTicker // 高开低收价格信息，只加载一次，不会实时跳动，需要使用ws的覆盖
  const symbolNewPrice = currentSymbol.symbolNewPrice // 第一口报价信息，只加载一次，不会实时跳动，需要使用ws的覆盖
  const quoteTimeStamp = currentQuote?.priceData?.id || symbolNewPrice?.id // 行情时间戳

  const digits = Number(currentSymbol?.symbolDecimal || 2) // 小数位，默认2
  // ask是买价，切记ask买价一般都比bid卖价高：卖盘买价（相对于卖价是高价） 加了点差的价格
  let ask = toFixed(Number(currentQuote?.priceData?.sell || symbolNewPrice?.sell || 0), digits, false)
  // bid是卖价：买盘卖价（相对于买价是低价） 没有加点差的价格
  let bid = toFixed(Number(currentQuote?.priceData?.buy || symbolNewPrice?.buy || 0), digits, false)
  const open = Number(symbolNewTicker?.open || 0) // 开盘价
  const high = Math.max.apply(Math, [Number(symbolNewTicker?.high || 0), bid]) // 拿当前价格跟首次返回的比
  const low = Math.min.apply(Math, [Number(symbolNewTicker?.low || 0), bid]) // 拿当前价格跟首次返回的比
  const close = Number(bid || symbolNewTicker?.close || 0) // 使用卖价作为最新的收盘价格
  const percent = bid && open ? (((bid - open) / open) * 100).toFixed(2) : 0

  // 买卖点差
  const spread = Math.abs(multiply(Math.abs(Number(subtract(bid, ask))), Math.pow(10, digits)) as number)

  const result = {
    symbol, // 用于展示的symbol自定义名称
    dataSourceSymbol, // 数据源品种
    dataSourceKey, // 获取行情源的key
    digits,
    currentQuote,
    quoteTimeStamp,
    currentSymbol, // 当前品种信息
    symbolConf, // 全部品种配置
    prepaymentConf, // 预付款配置
    transactionFeeConf, // 手续费配置
    holdingCostConf, // 库存费配置
    spreadConf, // 点差配置
    tradeTimeConf, // 交易时间配置
    quotationConf, // 报价配置
    symbolNewTicker, // 高开低收
    symbolNewPrice, // 第一口报价信息
    percent, //涨幅百分比
    quotes,
    consize: Number(symbolConf?.contractSize || 0),
    ask,
    bid,
    high: toFixed(high, digits, false), //高
    low: toFixed(low, digits, false), //低
    open: toFixed(open, digits, false), //开
    close: toFixed(close, digits, false), //收
    spread, // 买卖点差
    bidDiff: currentQuote?.bidDiff || 0,
    askDiff: currentQuote?.askDiff || 0,
    hasQuote: !!currentQuote?.priceData?.buy, // 是否存在行情
  }

  return result
}
