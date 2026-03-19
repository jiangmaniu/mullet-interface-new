import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { parseTradeDirectionInfo, parseTradeOrderCreateTypeInfo } from '@/helpers/parse/trade'
import { TradePositionDirectionEnum } from '@/options/trade/position'
import { useRootStore } from '@/stores'
import { tradeFormDataSelector } from '@/stores/trade-slice/formDataSlice'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'

export const useOrderMarketPrice = (props: { symbol?: string; direction?: TradePositionDirectionEnum }) => {
  const { symbol, direction } = props

  const { isBuy, isSell } = parseTradeDirectionInfo(direction)
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbol)

  const orderMarketPrice = isBuy
    ? (symbolMarketInfo?.ask as string)
    : isSell
      ? (symbolMarketInfo?.bid as string)
      : undefined

  return orderMarketPrice
}

export const useCreateOrderPrice = (props: { symbol?: string }) => {
  const { symbol } = props

  const {
    type: orderType,
    direction,
    limitPrice,
  } = useRootStore(
    useShallow((s) => {
      const { orderType: type, direction, limitPrice } = tradeFormDataSelector(s)
      return {
        type,
        direction,
        limitPrice,
      }
    }),
  )

  const orderMarketPrice = useOrderMarketPrice({
    symbol: symbol,
    direction: direction,
  })

  const { isMarket } = parseTradeOrderCreateTypeInfo(orderType)
  const orderPrice = useMemo(() => {
    return isMarket ? orderMarketPrice : limitPrice
  }, [isMarket, limitPrice, orderMarketPrice])

  return orderPrice
}
