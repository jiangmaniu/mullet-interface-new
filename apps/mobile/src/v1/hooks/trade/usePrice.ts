import { useMemo } from 'react'
import useQuote from './useQoute'
import { throttle } from 'lodash'

export default function usePrice() {
  const { stopl, currentPrice, d, isBuy, orderPrice, isStopLossLimit, isLimit } = useQuote()

  const stopll = useMemo(() => (isBuy ? stopl : -stopl), [isBuy, stopl])

  // 价格范围
  const priceTip = useMemo(() => {
    if (isStopLossLimit) {
      return Number((isBuy ? currentPrice + stopll : currentPrice + stopll).toFixed(d))
    } else if (isLimit) {
      return Number((isBuy ? currentPrice - stopll : currentPrice - stopll).toFixed(d))
    }
    return 0
  }, [isStopLossLimit, isLimit, isBuy, stopll, d, currentPrice])

  const rangeSymbol = ['≥', '≤']
  // 价格范围 大于或者小于符号
  const priceRangeSymbol = useMemo(() => {
    if (isLimit) {
      return isBuy ? rangeSymbol[1] : rangeSymbol[0]
    } else if (isStopLossLimit) {
      return isBuy ? rangeSymbol[0] : rangeSymbol[1]
    }
    return ''
  }, [isLimit, isStopLossLimit, isBuy])

  // 价格范围提示文字红色
  const showPriceTipRedColor = useMemo(
    throttle(
      () => {
        const price = Number(orderPrice)
        if (isStopLossLimit) {
          return !Number.isNaN(price) && (isBuy ? price < priceTip : price > priceTip)
        } else if (isLimit) {
          return !Number.isNaN(price) && (isBuy ? price > Number(priceTip) : price < Number(priceTip))
        }
        return false
      },
      100,
      {
        // 立即执行
        leading: true
      }
    ),
    [isStopLossLimit, isLimit, isBuy, orderPrice, priceTip]
  )

  return {
    priceTip,
    priceRangeSymbol,
    // price,
    showPriceTipRedColor
  }
}
