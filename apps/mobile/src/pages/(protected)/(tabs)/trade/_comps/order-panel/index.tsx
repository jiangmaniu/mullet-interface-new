import { observer } from 'mobx-react-lite'
import { View } from 'react-native'

import { useStores } from '@/v1/provider/mobxProvider'

import { OrderAmount } from './order-amount'
import { OrderDirection } from './order-direction'
import { OrderOverview } from './order-overview'
import { OrderPrice } from './order-price'
import { OrderSubmit } from './order-submit'
import { OrderTpSl } from './order-tp-sl'
import { OrderType } from './order-type'

// ============ OrderPanel ============
interface OrderPanelProps {}

export const OrderPanel = observer(({}: OrderPanelProps) => {
  const { trade } = useStores()
  const activeSymbolName = trade.activeSymbolName

  // 添加安全检查，确保 symbol 存在
  if (!activeSymbolName) {
    return null
  }

  return (
    <View className="px-xl gap-xl">
      {/* Order Type Tabs */}
      <OrderType />

      {/* Buy/Sell Buttons */}
      <OrderDirection symbol={activeSymbolName} />

      {/* Price Input - Different UI for Market vs Limit */}
      <OrderPrice symbol={activeSymbolName} />

      {/* Quantity Input */}
      <OrderAmount symbol={activeSymbolName} />

      {/* Stop Loss */}
      <OrderTpSl symbol={activeSymbolName} />

      <OrderSubmit />

      <OrderOverview symbol={activeSymbolName} />
    </View>
  )
})
