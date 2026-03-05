import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
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
import { useStores } from '@/v1/provider/mobxProvider'

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
  const symbol = trade.activeSymbolName

  // Safe Area Insets
  const insets = useSafeAreaInsets()

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
              <OrderPanel />

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
    </View>
  )
})

export default Trade
