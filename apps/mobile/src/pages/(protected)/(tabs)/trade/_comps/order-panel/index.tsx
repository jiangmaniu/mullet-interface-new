import { View } from 'react-native'

import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'

import { OrderAmount } from './order-amount'
import { OrderDirection } from './order-direction'
import { OrderOverview } from './order-overview'
import { OrderPrice } from './order-price'
import { OrderSubmit } from './order-submit'
import { OrderTpSl } from './order-tp-sl'
import { OrderType } from './order-type'

export const OrderPanel = () => {
  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)

  return (
    <View className="px-xl gap-xl">
      {/* Order Type Tabs */}
      <OrderType />

      {/* Buy/Sell Buttons */}
      <OrderDirection symbol={activeSymbol} />

      {/* Price Input - Different UI for Market vs Limit */}
      <OrderPrice symbol={activeSymbol} />

      {/* Quantity Input */}
      <OrderAmount symbol={activeSymbol} />

      {/* Stop Loss */}
      <OrderTpSl symbol={activeSymbol} />

      <OrderSubmit symbol={activeSymbol} />

      <OrderOverview symbol={activeSymbol} />
    </View>
  )
}
