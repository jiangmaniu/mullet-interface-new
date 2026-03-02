
import { useState, useCallback, useEffect } from 'react'
import { View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import {
  IconifyNavArrowDown,
  IconifyPage,
  IconNavArrowSuperior,
  IconNavArrowDown,
  IconifyNavArrowRight,
} from '@/components/ui/icons'
import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { Trans } from '@lingui/react/macro'
import { IconButton } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CollapsibleTab,
  CollapsibleTabScene,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleStickyContent,
  CollapsibleScrollView,
} from '@/components/ui/collapsible-tab'

import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useStores } from '@/v1/provider/mobxProvider'
import { observer } from 'mobx-react-lite'
import { TradeHeader } from './_comps/header'
import { OrderPanel } from './_comps/order-panel'
import { AccountCard } from './_comps/account-card'
import { MOCK_POSITIONS, TradePositions } from './_comps/records/positions'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import OrderConfirmationDrawer from './_comps/order-confirmation-drawer'
import { MOCK_PENDING_ORDERS, TradePendingOrders } from './_comps/records/pending-orders'
import { SymbolChartView } from './_comps/symbol-chart-view'

const Trade = observer(() => {
  // Get URL params
  const { side } = useLocalSearchParams<{ side?: 'buy' | 'sell' }>()
  const defaultSide = side === 'sell' ? 'sell' : 'buy'

  // Router
  const router = useRouter()

  const { trade } = useStores()
  const symbol = trade.activeSymbolName

  // Safe Area Insets
  const insets = useSafeAreaInsets()

  // Trade Settings
  const { orderConfirmation, closeConfirmation, chartPosition } = useTradeSettingsStore()

  // State
  const [isOrderConfirmDrawerOpen, setIsOrderConfirmDrawerOpen] = useState(false)
  const [isClosePositionDrawerOpen, setIsClosePositionDrawerOpen] = useState(false)
  const [isStopProfitLossDrawerOpen, setIsStopProfitLossDrawerOpen] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<{
    side: 'buy' | 'sell'
    price: string
    quantity: string
  } | null>(null)

  // Handlers
  const handleBuy = useCallback(() => {
    setPendingOrder({
      side: 'buy',
      price: '184.00',
      quantity: '0.01',
    })
    if (orderConfirmation) {
      setIsOrderConfirmDrawerOpen(true)
    } else {
      // 跳过确认，直接下单
      console.log('Order confirmed (skip confirmation):', { side: 'buy', price: '184.00', quantity: '0.01' })
      // TODO: 实际下单逻辑
    }
  }, [orderConfirmation])

  const handleSell = useCallback(() => {
    setPendingOrder({
      side: 'sell',
      price: '184.00',
      quantity: '0.01',
    })
    if (orderConfirmation) {
      setIsOrderConfirmDrawerOpen(true)
    } else {
      // 跳过确认，直接下单
      console.log('Order confirmed (skip confirmation):', { side: 'sell', price: '184.00', quantity: '0.01' })
      // TODO: 实际下单逻辑
    }
  }, [orderConfirmation])

  const handleConfirmOrder = useCallback(() => {
    if (pendingOrder) {
      console.log('Order confirmed:', pendingOrder)
      // TODO: 实际下单逻辑
      setPendingOrder(null)
    }
  }, [pendingOrder])

  // const handleClosePosition = useCallback((position: Position) => {
  //   setSelectedPosition(position)
  //   if (closeConfirmation) {
  //     setIsClosePositionDrawerOpen(true)
  //   } else {
  //     // 跳过确认，直接平仓
  //     console.log('Close position (skip confirmation):', position)
  //     // TODO: 实际平仓逻辑
  //   }
  // }, [closeConfirmation])

  // const handleConfirmClosePosition = useCallback((quantity: number, orderType: 'market' | 'limit', limitPrice?: string) => {
  //   if (selectedPosition) {
  //     console.log('Close position:', {
  //       position: selectedPosition,
  //       quantity,
  //       orderType,
  //       limitPrice,
  //     })
  //     // TODO: 实际平仓逻辑
  //     setSelectedPosition(null)
  //   }
  // }, [selectedPosition])

  // const handleStopProfitLoss = useCallback((takeProfitPrice: string, takeProfitPercent: string, stopLossPrice: string, stopLossPercent: string) => {
  //   if (selectedPosition) {
  //     console.log('Stop profit/loss:', {
  //       position: selectedPosition,
  //       takeProfitPrice,
  //       takeProfitPercent,
  //       stopLossPrice,
  //       stopLossPercent,
  //     })
  //     // TODO: 实际止盈止损逻辑
  //     setSelectedPosition(null)
  //   }
  // }, [selectedPosition])

  return (
    <View className="flex-1">
      <CollapsibleTab
        variant="underline"
        size="md"
        tabBarClassName="px-xl"
        minHeaderHeight={44 + insets.top}
        renderTabBarRight={() => (
          <IconButton onPress={() => router.push('/(trade)/records')}>
            <IconifyPage width={22} height={22} />
          </IconButton>
        )}
        renderHeader={() => (
          <CollapsibleStickyHeader>
            <CollapsibleStickyNavBar fixed>
              <TradeHeader
                symbol={symbol}
              />
            </CollapsibleStickyNavBar>

            <CollapsibleStickyContent>
              {/* K-Line Chart - 顶部位置 */}
              <SymbolChartView />

              {/* Account Card */}
              <View className="pt-xl px-xl">
                <AccountCard />
              </View>

              {/* Order Panel */}
              <OrderPanel
                buyPrice="184.00"
                sellPrice="184.00"
                spread={12}
                estimatedMargin="0.00"
                maxLots="0.00"
                onBuy={handleBuy}
                onSell={handleSell}
                defaultSide={defaultSide}
              />

              {/* K-Line Chart - 底部位置 */}
              {/* {chartPosition === 'bottom' && (
                <KLineChart
                  isVisible={isChartVisible}
                  onToggle={handleChartToggle}
                  symbol="SOL-USDC"
                />
              )} */}
            </CollapsibleStickyContent>
          </CollapsibleStickyHeader>
        )}
      >
        <CollapsibleTabScene name="positions" label={`持仓(${MOCK_POSITIONS?.length ?? 0})`}>
          <TradePositions />
        </CollapsibleTabScene>

        <CollapsibleTabScene name="orders" label={`挂单(${MOCK_PENDING_ORDERS?.length ?? 0})`}>
          <CollapsibleScrollView>

            <View><Text>123</Text></View>
          </CollapsibleScrollView>
        </CollapsibleTabScene>
      </CollapsibleTab>


      {/* Order Confirmation Drawer */}
      {/* <OrderConfirmationDrawer
        open={isOrderConfirmDrawerOpen}
        onOpenChange={setIsOrderConfirmDrawerOpen}
        symbol="SOL-USDC"
        direction={pendingOrder?.side === 'buy' ? 'long' : 'short'}
        price="56321.52"
        margin="56321.52"
        contractValue="56321.52"
        onConfirm={handleConfirmOrder}
      /> */}

      {/* Close Position Drawer */}
      {/* {selectedPosition && (
        <ClosePositionDrawer
          open={isClosePositionDrawerOpen}
          onOpenChange={setIsClosePositionDrawerOpen}
          symbol={selectedPosition.symbol}
          direction={selectedPosition.direction}
          quantity={selectedPosition.quantity}
          openPrice={selectedPosition.openPrice.toFixed(2)}
          currentPrice={selectedPosition.markPrice.toFixed(2)}
          profit={selectedPosition.profit.toFixed(2)}
          isProfitable={selectedPosition.profit >= 0}
          onConfirm={handleConfirmClosePosition}
        />
      )} */}

      {/* Stop Profit Loss Drawer */}
      {/* {selectedPosition && (
        <StopProfitLossDrawer
          open={isStopProfitLossDrawerOpen}
          onOpenChange={setIsStopProfitLossDrawerOpen}
          symbol={selectedPosition.symbol}
          direction={selectedPosition.direction}
          openPrice={selectedPosition.openPrice.toFixed(2)}
          markPrice={selectedPosition.markPrice.toFixed(2)}
          onConfirm={handleStopProfitLoss}
        />
      )} */}

    </View>
  )
})

export default Trade
