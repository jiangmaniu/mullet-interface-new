import { useMemo } from 'react'

import { ORDER_TYPE } from '@/v1/constants'
import { useStores } from '@/v1/provider/mobxProvider'

import useQuote from './useQoute'
import useSpSl from './useSpSl'

export default function useOrderParams() {
  const { trade } = useStores()
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
      tradeAccountId: trade.currentAccountInfo?.id,
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
      orderParams.type = type as API.OrderType
    }

    return orderParams
  }, [
    symbol,
    buySell,
    orderVolume,
    stopLoss,
    takeProfit,
    leverageMultiple,
    trade.currentAccountInfo?.id,
    orderType,
    orderPrice,
    marginType,
  ])

  return orderParams
}
