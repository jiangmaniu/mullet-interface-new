import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

import { IconButton } from '@/components/ui/button'
import {
  CollapsibleStickyContent,
  CollapsibleStickyHeader,
  CollapsibleStickyNavBar,
  CollapsibleTab,
  CollapsibleTabScene,
} from '@/components/ui/collapsible-tab'
import { IconifyPage } from '@/components/ui/icons'
import { KeyboardAvoidView } from '@/components/ui/keyboard-avoid-view'
import { useAppState } from '@/hooks/use-app-state'
import { useI18n } from '@/hooks/use-i18n'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import { tradeOrderCountSelector } from '@/stores/trade-slice/order-slice'
import { tradePositionCountSelector } from '@/stores/trade-slice/position-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { useStores } from '@/v1/provider/mobxProvider'
import { msg } from '@lingui/core/macro'

import { AccountCard } from './_comps/account-card'
import { TradeHeader } from './_comps/header'
import { OrderPanel } from './_comps/order-panel'
import { TradePendingOrders } from './_comps/records/pending-orders'
import { TradePositions } from './_comps/records/positions'
import { SymbolChartView } from './_comps/symbol-chart-view'

const Trade = () => {
  const router = useRouter()
  const { user } = useStores()
  const { renderLinguiMsg } = useI18n()
  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  // 只订阅数量（原始值），不订阅完整列表
  const positionCount = useRootStore(tradePositionCountSelector)
  const orderCount = useRootStore(tradeOrderCountSelector)

  const chartPosition = useRootStore((state) => state.trade.setting.chartPosition)

  const [isChartVisible, setIsChartVisible] = useState(true)

  // 图表+账户卡的高度，作为键盘避让的最大偏移量
  const [topBannerHeight, setTopBannerHeight] = useState(0)

  const initData = () => {
    useRootStore.getState().trade.position.fetch()
    useRootStore.getState().trade.order.fetch()
    useRootStore.getState().user.info.fetchLoginClientInfo()
    user.fetchUserInfo(true)
  }

  useEffect(() => {
    if (!activeTradeAccountId) return
    initData()
  }, [activeTradeAccountId])

  useAppState(() => {
    // 回到前台时，重新获取数据
    initData()
  })

  return (
    <View className="flex-1">
      <CollapsibleTab
        variant="underline"
        size="md"
        tabBarClassName="px-xl"
        renderTabBarRight={() => (
          <IconButton onPress={() => router.push('/(trade)/records')}>
            <IconifyPage width={22} height={22} />
          </IconButton>
        )}
        renderHeader={() => (
          <CollapsibleStickyHeader>
            <CollapsibleStickyNavBar fixed>
              <TradeHeader symbol={activeSymbol} />
            </CollapsibleStickyNavBar>

            <CollapsibleStickyContent>
              <KeyboardAvoidView maxOffset={topBannerHeight}>
                <View onLayout={(e) => setTopBannerHeight(e.nativeEvent.layout.height)}>
                  {/* K-Line Chart - 顶部位置 */}
                  {chartPosition !== 'bottom' && (
                    <SymbolChartView isVisible={isChartVisible} onToggle={setIsChartVisible} />
                  )}

                  {/* Account Card */}
                  <View className="pt-xl px-xl">
                    <AccountCard />
                  </View>
                </View>

                {/* Order Panel */}
                <OrderPanel />
              </KeyboardAvoidView>
            </CollapsibleStickyContent>
          </CollapsibleStickyHeader>
        )}
      >
        <CollapsibleTabScene name="positions" label={`${renderLinguiMsg(msg`持仓`)}(${positionCount})`}>
          <TradePositions />
        </CollapsibleTabScene>

        <CollapsibleTabScene name="orders" label={`${renderLinguiMsg(msg`挂单`)}(${orderCount})`}>
          <TradePendingOrders />
        </CollapsibleTabScene>
      </CollapsibleTab>

      {/* K-Line Chart - 固定在提交按钮上方 */}
      {chartPosition === 'bottom' && (
        <View className="absolute right-0 bottom-0 left-0 z-10">
          <SymbolChartView />
        </View>
      )}
    </View>
  )
}

export default Trade
