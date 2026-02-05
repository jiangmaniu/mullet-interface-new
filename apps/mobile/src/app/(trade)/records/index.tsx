import { useMemo } from 'react'
import { View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { useRouter } from 'expo-router'
import { Route } from 'react-native-tab-view'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SwipeableTabs } from '@/components/ui/tabs'
import { HistoricalOrdersUnfilled } from './_comps/historical-orders-unfilled'
import { HistoricalOrdersFilled } from './_comps/historical-orders-filled'
import { HistoricalPositions } from './_comps/historical-positions'
import { FundFlow } from './_comps/fund-flow'

export default function TradeRecordsScreen() {
  const routes = useMemo<Route[]>(() => [
    { key: 'orders-unfilled', title: '历史委托' },
    { key: 'orders-filled', title: '成交记录' },
    { key: 'positions', title: '历史仓位' },
    { key: 'fund-flow', title: '资金流水' },
  ], [])

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key) {
      case 'orders-unfilled':
        return <HistoricalOrdersUnfilled />
      case 'orders-filled':
        return <HistoricalOrdersFilled />
      case 'positions':
        return <HistoricalPositions />
      case 'fund-flow':
        return <FundFlow />
      default:
        return null
    }
  }

  return (
    <View className="flex-1">
      <ScreenHeader
        content={<Trans>交易记录</Trans>}
      />

      <View className="flex-1">
        <SwipeableTabs
          routes={routes}
          renderScene={renderScene}
          variant="underline"
          size="md"
          tabBarClassName="border-b border-brand-default px-xl"
        />
      </View>
    </View>
  );
}
