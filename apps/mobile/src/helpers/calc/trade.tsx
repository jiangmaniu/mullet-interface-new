import { isUndefined } from 'lodash-es'
import { toJS } from 'mobx'

import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { TRADE_BUY_SELL } from '@/v1/constants'
import { stores } from '@/v1/provider/mobxProvider'
import { BNumber, BNumberValue } from '@mullet/utils/number'

/**
 * 计算汇率
 * @param value 转换的值
 * @param unit 盈利货币单位
 * @param buySell 买卖方向
 * @returns
 */
type IExchangeRateParams = {
  /** 需要转化的值 */
  value?: BNumberValue
  /** 盈利货币单位 */
  unit?: string
  /** 买卖方向 */
  buySell: TradePositionDirectionEnum | undefined
}

/**
 * 计算货币汇率
 * @param param0
 * @returns
 */
export const calcCurrencyExchangeRate = ({ value, unit, buySell }: IExchangeRateParams) => {
  if (isUndefined(value)) return

  const { trade, ws } = stores
  const quotes = ws.quotes
  // 检查货币是否是外汇/指数，并且不是以 USD 为单位，比如AUDNZD => 这里单位是NZD，找到NZDUSD或者USDNZD的指数取值即可
  // 数字货币、商品黄金石油这些以美元结算的，单位都是USD不需要参与转化直接返回
  // 非USD单位的产品都要转化为美元
  // if ((quoteList2.some((v) => v.name === symbol) || quoteList3.some((v) => v.name === symbol)) && unit !== 'USD') {
  const allSimpleSymbolsMap = trade.allSimpleSymbolsMap // 全部品种map
  let qb: any = {}
  let profit = BNumber.from(value).toNumber() || 0
  const isBuy = buySell === TRADE_BUY_SELL.BUY // 是否买入
  const isSell = buySell === TRADE_BUY_SELL.SELL // 是否卖出

  const currentAccountInfo = userInfoActiveTradeAccountInfoSelector(useRootStore.getState())

  // 交易品种配置的盈利货币单位和账户组配置的货币单位不一致时，需要转换
  if (currentAccountInfo?.currencyUnit !== unit) {
    // USD开头是除法，USD结尾是乘法
    // 除法
    const divName = ('USD' + unit).toUpperCase() // 如 USDNZD
    // 乘法
    const mulName = (unit + 'USD').toUpperCase() // 如 NZDUSD

    // 使用汇率品种的dataSourceCode去获取行情
    // const dataSourceCode = (allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName] || {})?.dataSourceCode
    const symbol = (allSimpleSymbolsMap[divName] || allSimpleSymbolsMap[mulName] || {})?.symbol
    const accountGroupId = currentAccountInfo?.accountGroupId
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
