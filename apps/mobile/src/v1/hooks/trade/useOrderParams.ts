import { useMemo } from 'react'

import { useRootStore } from '@/stores'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { OrderTypeEnum } from '@/options/trade/order'
import { ORDER_TYPE } from '@/v1/constants'
import { Order } from '@/v1/services/tradeCore/order/typings'

import useQuote from './useQoute'
import useSpSl from './useSpSl'

export default function useOrderParams() {
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const { symbol, leverageMultiple, buySell, orderVolume, marginType, orderType, orderPrice, isBuy } = useQuote()

  // 止损止盈
  const { slValuePrice, spValuePrice } = useSpSl()

  const stopLoss = useMemo(
    () => (Number.isNaN(slValuePrice) || slValuePrice === 0 ? undefined : slValuePrice),
    [slValuePrice],
  )
  const takeProfit = useMemo(
    () => (Number.isNaN(spValuePrice) || spValuePrice === 0 ? undefined : spValuePrice),
    [spValuePrice],
  )

  const orderParams = useMemo(() => {
    const orderParams = {
      symbol,
      buySell, // 订单方向
      orderVolume,
      stopLoss,
      takeProfit,
      // 浮动杠杆默认1
      leverageMultiple,
      tradeAccountId: activeTradeAccountId,
      marginType,
      type: orderType,
      limitPrice: orderPrice,
    } as Order.CreateOrder

    // if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
    //   orderParams.limitPrice = orderPrice
    // }

    // if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER' || orderType === 'MARKET_ORDER') {
    if (orderType === 'LIMIT_ORDER' || orderType === 'STOP_LIMIT_ORDER') {
      const type = {
        // MARKET_ORDER: ORDER_TYPE.MARKET_ORDER,
        LIMIT_ORDER: isBuy ? ORDER_TYPE.LIMIT_BUY_ORDER : ORDER_TYPE.LIMIT_SELL_ORDER,
        STOP_LIMIT_ORDER: isBuy ? ORDER_TYPE.STOP_LOSS_MARKET_BUY_ORDER : ORDER_TYPE.STOP_LOSS_MARKET_SELL_ORDER,
      }[orderType]

      // 订单类型
      orderParams.type = type as OrderTypeEnum
    }

    return orderParams
  }, [
    symbol,
    buySell,
    orderVolume,
    stopLoss,
    takeProfit,
    leverageMultiple,
    activeTradeAccountId,
    marginType,
    orderType,
    orderPrice,
    isBuy,
  ])

  return orderParams
}
