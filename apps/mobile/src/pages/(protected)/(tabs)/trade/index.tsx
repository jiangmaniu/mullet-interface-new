import React, { Activity, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, RefreshControl, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useRouter } from 'expo-router'

import { useAppState } from '@/hooks/use-app-state'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import { tradeOrderCountSelector } from '@/stores/trade-slice/order-slice'
import { tradePositionCountSelector } from '@/stores/trade-slice/position-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { useStores } from '@/v1/provider/mobxProvider'

import { AccountCard } from './_comps/account-card'
import { TradeHeader } from './_comps/header'
import { OrderPanel } from './_comps/order-panel'
import { TradePendingOrders } from './_comps/records/pending-orders'
import { TradePositions } from './_comps/records/positions'
import { SymbolChartView } from './_comps/symbol-chart-view'
import { TradeTab, TradeTabBar } from './_comps/trade-tab-bar'
import { TradeRefreshContext } from './_context/trade-refresh-context'

const { height: screenHeight } = Dimensions.get('window')

const Trade = () => {
  const router = useRouter()
  const { user } = useStores()
  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const positionCount = useRootStore(tradePositionCountSelector)
  const orderCount = useRootStore(tradeOrderCountSelector)
  const chartPosition = useRootStore((state) => state.trade.setting.chartPosition)

  const [activeTab, setActiveTab] = useState<TradeTab>('positions')
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 图表交互时禁用外层 ScrollView 滚动，防止手势被拦截
  // 用 ref + setNativeProps，避免 setState 触发 re-render 打断原生触摸序列
  const scrollViewRef = useRef<any>(null)
  const scrollViewInnerRef = useCallback((ref: any) => { scrollViewRef.current = ref }, [])

  // 测量固定元素高度，用于计算列表区 minHeight
  const [tradeHeaderHeight, setTradeHeaderHeight] = useState(0)
  const [tabBarHeight, setTabBarHeight] = useState(0)

  // 下拉刷新函数注册表
  const refreshFnsRef = useRef<(() => Promise<void>)[]>([])

  const registerRefresh = useCallback((fn: () => Promise<void>) => {
    refreshFnsRef.current.push(fn)
    return () => {
      refreshFnsRef.current = refreshFnsRef.current.filter((f) => f !== fn)
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all(refreshFnsRef.current.map((fn) => fn()))
    } finally {
      setRefreshing(false)
    }
  }

  const initData = async () => {
    await Promise.all([useRootStore.getState().user.info.fetchLoginClientInfo(), user.fetchUserInfo(true)])
    await Promise.all([useRootStore.getState().trade.position.fetch(), useRootStore.getState().trade.order.fetch()])
  }

  useEffect(() => {
    if (!activeTradeAccountId) return
    initData()
  }, [activeTradeAccountId])

  useAppState({
    onForeground: () => {
      initData()
    },
  })

  // 列表区最小高度 = 屏幕高度 - TradeHeader 高度 - TabBar 高度
  const listMinHeight = screenHeight - tradeHeaderHeight - tabBarHeight

  return (
    <TradeRefreshContext.Provider value={{ registerRefresh }}>
      <View className="flex-1">
        {/* TradeHeader 普通流，固定顶部，不参与 ScrollView 滚动 */}
        <View onLayout={(e) => setTradeHeaderHeight(e.nativeEvent.layout.height)}>
          <TradeHeader symbol={activeSymbol} />
        </View>

        {/* 滚动区域 */}
        <View className="flex-1">
          <KeyboardAwareScrollView
            innerRef={scrollViewInnerRef}
            keyboardShouldPersistTaps="always"
            // stickyHeaderIndices={[1]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {/* 索引 0：内容区（随页面滚动） */}
            <View>
              {chartPosition !== 'bottom' && (
                <SymbolChartView
                  isVisible={isChartVisible}
                  onToggle={setIsChartVisible}
                  onInteractionStart={() => scrollViewRef.current?.setNativeProps?.({ scrollEnabled: false })}
                  onInteractionEnd={() => scrollViewRef.current?.setNativeProps?.({ scrollEnabled: true })}
                  onInteractionCancel={() => scrollViewRef.current?.setNativeProps?.({ scrollEnabled: true })}
                />
              )}
              <View className="pt-xl px-xl">
                <AccountCard />
              </View>
              <OrderPanel />
            </View>

            {/* 索引 1：TabBar 吸顶 */}
            <View
              style={{ zIndex: 100, elevation: 100 }}
              onLayout={(e) => setTabBarHeight(e.nativeEvent.layout.height)}
            >
              <TradeTabBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                positionCount={positionCount}
                orderCount={orderCount}
                onRecordsPress={() => router.push('/(trade)/records')}
              />
            </View>

            {/* 索引 2：列表区，用 Activity 保持两个列表挂载 */}
            <View
              style={{
                minHeight: listMinHeight,
              }}
            >
              <Activity mode={activeTab === 'positions' ? 'visible' : 'hidden'}>
                <TradePositions />
              </Activity>
              <Activity mode={activeTab === 'orders' ? 'visible' : 'hidden'}>
                <TradePendingOrders />
              </Activity>
            </View>
          </KeyboardAwareScrollView>
        </View>

        {/* K 线图底部固定模式 */}
        {chartPosition === 'bottom' && (
          <View className="absolute right-0 bottom-0 left-0 z-10">
            <SymbolChartView />
          </View>
        )}
      </View>
    </TradeRefreshContext.Provider>
  )
}

export default Trade
