import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { useAppState } from '@/hooks/use-app-state'
import { useI18n } from '@/hooks/use-i18n'
import { useTradeSettingsStore } from '@/stores/trade-settings'
import { useStores } from '@/v1/provider/mobxProvider'
import { msg } from '@lingui/core/macro'

import { AccountCard } from './_comps/account-card'
import { TradeHeader } from './_comps/header'
import { OrderPanel } from './_comps/order-panel'
import { TradePendingOrders } from './_comps/records/pending-orders'
import { TradePositions } from './_comps/records/positions'
import { SymbolChartView } from './_comps/symbol-chart-view'

const Trade = observer(() => {
  // Router
  const router = useRouter()
  const { trade, user } = useStores()
  const { renderLinguiMsg } = useI18n()
  const symbol = trade.activeSymbolName

  // Safe Area Insets
  const insets = useSafeAreaInsets()

  const pendingList = trade.pendingList
  const positionList = trade.positionList

  const chartPosition = useTradeSettingsStore((state) => state.chartPosition)

  // 图表展开/隐藏状态
  const [isChartVisible, setIsChartVisible] = useState(true)

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

  // // 动态计算 minHeaderHeight
  // // 基础高度：44 + insets.top
  // // 图表在顶部时：需要加上图表高度（展开：233px，隐藏：40px）
  // const minHeaderHeight = (() => {
  //   const baseHeight = 44 + insets.top
  //   if (chartPosition === 'bottom') {
  //     return baseHeight
  //   }
  //   // 图表在顶部
  //   return baseHeight + (isChartVisible ? 233 : 40)
  // })()

  return (
    <View className="flex-1">
      <CollapsibleTab
        variant="underline"
        size="md"
        tabBarClassName="px-xl"
        // minHeaderHeight={minHeaderHeight}
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
              {/* {chartPosition !== 'bottom' && ( */}
              <SymbolChartView isVisible={isChartVisible} onToggle={setIsChartVisible} />
              {/* )} */}

              {/* Account Card */}
              <View className="pt-xl px-xl">
                <AccountCard />
              </View>

              {/* Order Panel - 底部图表模式下需要为图表预留空间 */}
              <OrderPanel chartPosition={chartPosition} />
            </CollapsibleStickyContent>
          </CollapsibleStickyHeader>
        )}
      >
        <CollapsibleTabScene name="positions" label={renderLinguiMsg(msg`持仓(${positionList?.length ?? 0})`)}>
          <TradePositions />
        </CollapsibleTabScene>

        <CollapsibleTabScene name="orders" label={renderLinguiMsg(msg`挂单(${pendingList?.length ?? 0})`)}>
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
})

export default Trade
