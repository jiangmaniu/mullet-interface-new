import { useCallback } from 'react'

import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountInfoSelector } from '@/stores/user-slice/infoSlice'
import { stores } from '@/v1/provider/mobxProvider'
import { DEFAULT_LEVERAGE_MULTIPLE } from '@/v1/constants'
import { toFixed } from '@/v1/utils'
import {
  useCalcExchangeRateCallback,
  calcExchangeRate,
  useGetAccountBalanceCallback,
  useGetCurrentQuoteCallback,
  getCurrentQuoteV2,
} from '@/v1/utils/wsUtil'

type ICalcMaxOpenVolumeParams = {
  buySell: 'BUY' | 'SELL'
}

/**
 * 计算可开仓手数（纯函数版本，适合 callback / 事件处理器中调用）
 */
export const calcMaxOpenVolume = ({ buySell }: ICalcMaxOpenVolumeParams): string => {
  const { trade } = stores

  // 从 Zustand store 读取快照
  const state = useRootStore.getState()
  const currentAccountInfo = userInfoActiveTradeAccountInfoSelector(state)
  const money = currentAccountInfo?.money ?? 0
  const occupyMargin =
    Number(currentAccountInfo?.margin || 0) + Number(currentAccountInfo?.isolatedMargin || 0)
  let availableMargin = Number(money) - occupyMargin

  // 获取当前品种行情快照
  const quoteMap = state.market.quote.quoteMap
  const symbolMap = state.market.symbol.infoMap
  const quote = getCurrentQuoteV2(quoteMap, trade.activeSymbolName, symbolMap)

  const prepaymentConf = quote?.prepaymentConf
  const consize = quote?.consize
  const mode = prepaymentConf?.mode
  const currentPrice = buySell === 'SELL' ? quote?.bid : quote?.ask
  let volume = 0

  const getExchangeValue = (value: number) =>
    calcExchangeRate({
      value,
      unit: quote?.symbolConf?.prepaymentCurrency,
      buySell,
    })

  const exchangeValue = getExchangeValue(Number(currentPrice) * (consize || 0) || 0)

  if (availableMargin) {
    if (mode === 'fixed_margin') {
      // 固定预付款：可用 / 固定预付款（换汇后）
      const marginExchangeValue = getExchangeValue(prepaymentConf?.fixed_margin?.initial_margin || 0)
      const initial_margin = Number(marginExchangeValue)
      volume = initial_margin ? availableMargin / initial_margin : 0
    } else if (mode === 'fixed_leverage') {
      // 固定杠杆：可用 * 固定杠杆 / (价格 * 合约大小 * 汇率)
      const fixed_leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple || 0)
      if (fixed_leverage && exchangeValue) {
        volume = (availableMargin * fixed_leverage) / exchangeValue
      }
    } else if (mode === 'float_leverage') {
      // 浮动杠杆：可用 * 浮动杠杆 / (价格 * 合约大小 * 汇率)
      const float_leverage = Number(trade.leverageMultiple || DEFAULT_LEVERAGE_MULTIPLE)
      if (float_leverage && exchangeValue) {
        volume = (availableMargin * float_leverage) / exchangeValue
      }
    }
  }

  return volume > 0 ? toFixed(volume) : '0.00'
}

/**
 * 计算可开仓手数（hook 版本，响应式，适合 React 组件使用）
 */
export const useMaxOpenVolumeCalc = () => {
  const {
    trade: { leverageMultiple },
  } = stores
  const getAccountBalance = useGetAccountBalanceCallback()
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const calcExchangeRateFn = useCalcExchangeRateCallback()

  return useCallback(
    ({ buySell }: ICalcMaxOpenVolumeParams): string => {
      const { availableMargin } = getAccountBalance()
      const quote = getCurrentQuote()
      const prepaymentConf = quote?.prepaymentConf
      const consize = quote?.consize
      const mode = prepaymentConf?.mode
      const currentPrice = buySell === 'SELL' ? quote?.bid : quote?.ask
      let volume = 0

      const getExchangeValue = (value: number) =>
        calcExchangeRateFn({
          value,
          unit: quote?.symbolConf?.prepaymentCurrency,
          buySell,
        })

      const exchangeValue = getExchangeValue(Number(currentPrice) * (consize || 0) || 0)

      if (availableMargin) {
        if (mode === 'fixed_margin') {
          // 固定预付款：可用 / 固定预付款（换汇后）
          const marginExchangeValue = getExchangeValue(prepaymentConf?.fixed_margin?.initial_margin || 0)
          const initial_margin = Number(marginExchangeValue)
          volume = initial_margin ? Number(availableMargin) / initial_margin : 0
        } else if (mode === 'fixed_leverage') {
          // 固定杠杆：可用 * 固定杠杆 / (价格 * 合约大小 * 汇率)
          const fixed_leverage = Number(prepaymentConf?.fixed_leverage?.leverage_multiple || 0)
          if (fixed_leverage && exchangeValue) {
            volume = (Number(availableMargin) * fixed_leverage) / exchangeValue
          }
        } else if (mode === 'float_leverage') {
          // 浮动杠杆：可用 * 浮动杠杆 / (价格 * 合约大小 * 汇率)
          const float_leverage = Number(leverageMultiple || DEFAULT_LEVERAGE_MULTIPLE)
          if (float_leverage && exchangeValue) {
            volume = (Number(availableMargin) * float_leverage) / exchangeValue
          }
        }
      }

      return volume > 0 ? toFixed(volume) : '0.00'
    },
    [getAccountBalance, getCurrentQuote, leverageMultiple, calcExchangeRateFn],
  )
}
