import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { IconButton } from '@/components/ui/button'
import {
  CollapsibleScrollView,
  CollapsibleStickyContent,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'
import {
  IconifyNavArrowDown,
  IconifyNavArrowRight,
  IconifyPage,
  IconNavArrowDown,
  IconNavArrowSuperior,
} from '@/components/ui/icons'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Text } from '@/components/ui/text'
import { useAppState } from '@/hooks/use-app-state'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { useStores } from '@/v1/provider/mobxProvider'

import { AccountCard } from './_comps/account-card'
import { TradeHeader } from './_comps/header'
import { OrderPanel } from './_comps/order-panel'
import { TradePendingOrders } from './_comps/records/pending-orders'
import { TradePositions } from './_comps/records/positions'
import { SymbolChartView } from './_comps/symbol-chart-view'

const Trade = observer(() => {
  // Get URL params
  const { side } = useLocalSearchParams<{ side?: 'buy' | 'sell' }>()
  const defaultSide = side === 'sell' ? 'sell' : 'buy'

  // Router
  const router = useRouter()

  const { trade, user } = useStores()
  const symbol = trade.activeSymbolName

  // Safe Area Insets
  const insets = useSafeAreaInsets()

  // Trade Settings
  const { orderConfirmation, closeConfirmation, chartPosition } = useTradeSettingsStore()

  // State
  const [isOrderConfirmDrawerOpen, setIsOrderConfirmDrawerOpen] = useState(false)
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

  const pendingList = trade.pendingList
  const positionList = trade.positionList

  // 刷新持仓和挂单列表
  const initData = () => {
    trade.getPositionList(true)
    trade.getPendingList()

    // 刷新账户信息
    user.fetchUserInfo(true)
  }

  useEffect(() => {
    if (!trade.currentAccountInfo.id) return
    initData()
  }, [trade.currentAccountInfo.id])

  useAppState(() => {
    // 页面回到前台刷新持仓列表
    initData()
  })

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
              <TradeHeader symbol={symbol} />
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
        <CollapsibleTabScene name="positions" label={`持仓(${positionList?.length ?? 0})`}>
          <TradePositions />
        </CollapsibleTabScene>

        <CollapsibleTabScene name="orders" label={`挂单(${pendingList?.length ?? 0})`}>
          <TradePendingOrders />
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
