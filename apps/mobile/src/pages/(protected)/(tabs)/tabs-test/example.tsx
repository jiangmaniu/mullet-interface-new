import { CollapsibleTabView, TabFlatList } from '@mullet/react-native-tabs'
import React, { useCallback, useState } from 'react'
import { StatusBar, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Route } from '@mullet/react-native-tabs'
import type { FlatListProps } from 'react-native'

import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'

import { AccountCard } from '../trade/_comps/account-card'
import { TradeHeader } from '../trade/_comps/header'
import { OrderPanel } from '../trade/_comps/order-panel'
import { TradePendingOrders } from '../trade/_comps/records/pending-orders'
import { TradePositions } from '../trade/_comps/records/positions'
import { SymbolChartView } from '../trade/_comps/symbol-chart-view'

const StatusBarHeight = StatusBar.currentHeight ?? 0

// TabFlatList 适配器：绑定固定 index
const PositionFlatList = (props: FlatListProps<any>) => <TabFlatList {...props} index={0} />
const OrderFlatList = (props: FlatListProps<any>) => <TabFlatList {...props} index={1} />

export function Example() {
  const insets = useSafeAreaInsets()
  // TradeHeader 固定高度 = 44 + 状态栏
  const fixedHeaderHeight = 44 + (StatusBarHeight || insets.top)

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [routes] = useState<Route[]>([
    { key: 'position', title: '持仓', index: 0 },
    { key: 'order', title: '挂单', index: 1 },
  ])
  const [index, setIndex] = useState(0)
  const animationHeaderPosition = useSharedValue(0)
  const animationHeaderHeight = useSharedValue(0)

  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
  const chartPosition = useRootStore((state) => state.trade.setting.chartPosition)
  const [isChartVisible, setIsChartVisible] = useState(true)
  // TradeHeader 背景透明度：随滚动从透明渐变为 bg-secondary
  const headerBgStyle = useAnimatedStyle(() => {
    'worklet'
    const scrolled = Math.abs(animationHeaderPosition.value)
    return {
      opacity: interpolate(scrolled, [0, 60], [0, 1], Extrapolation.CLAMP),
    }
  })

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      switch (route.key) {
        case 'position':
          return <TradePositions FlatListComponent={PositionFlatList} />
        case 'order':
          return <TradePendingOrders FlatListComponent={OrderFlatList} />
        default:
          return null
      }
    },
    [],
  )

  const onStartRefresh = async () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 300)
  }

  // renderScrollHeader：可折叠区域（图表 + AccountCard + OrderPanel）
  // TradeHeader 不放在这里，通过绝对定位固定在顶部
  const renderScrollHeader = useCallback(
    () => (
      // 顶部留出 fixedHeaderHeight 的占位，防止可折叠内容被 TradeHeader 遮挡
      <View style={{ paddingTop: fixedHeaderHeight }}>
        {chartPosition !== 'bottom' && (
          <SymbolChartView isVisible={isChartVisible} onToggle={setIsChartVisible} />
        )}
        <View className="pt-xl px-xl">
          <AccountCard />
        </View>
        <OrderPanel />
      </View>
    ),
    [chartPosition, fixedHeaderHeight, isChartVisible],
  )

  return (
    <View className="flex-1">
      <CollapsibleTabView
        onStartRefresh={onStartRefresh}
        isRefreshing={isRefreshing}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        lazy
        renderScrollHeader={renderScrollHeader}
        // minHeaderHeight 固定住 TradeHeader 不被折叠
        minHeaderHeight={fixedHeaderHeight}
        animationHeaderPosition={animationHeaderPosition}
        animationHeaderHeight={animationHeaderHeight}
        enableGestureRunOnJS={false}
      />

      {/* TradeHeader 绝对定位，始终固定在顶部，背景随滚动渐变 */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: fixedHeaderHeight,
          zIndex: 100,
        }}
      >
        {/* 背景层：默认透明，滚动 60px 后完全显示 bg-secondary */}
        <Animated.View
          className="bg-secondary"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
            headerBgStyle,
          ]}
        />
        <TradeHeader symbol={activeSymbol} />
      </View>

      {/* K-Line Chart - 固定在底部 */}
      {chartPosition === 'bottom' && (
        <View className="absolute right-0 bottom-0 left-0 z-10">
          <SymbolChartView />
        </View>
      )}
    </View>
  )
}
