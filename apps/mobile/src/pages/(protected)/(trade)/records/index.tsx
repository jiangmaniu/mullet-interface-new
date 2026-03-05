import { View } from 'react-native'
import { Trans, useLingui } from '@lingui/react/macro'
import { Route } from 'react-native-tab-view'
import { useLocalSearchParams } from 'expo-router'
import { ScreenHeader } from '@/components/ui/screen-header'
import { SwipeableTabs } from '@/components/ui/tabs'
import { HistoryOrderList } from './_comps/history-order-list'
import { HistoryFilledOrderList } from './_comps/history-filled-order-list'
import { HistoryPositionList } from './_comps/history-position-list'
import { FundFlowList } from './_comps/fund-flow-list'
import { msg } from '@lingui/core/macro'

// ============================================================================
// Main Screen
// ============================================================================

enum RecordTabKeyEnum {
  HISTORY_PENDING_ORDERS = 'history-pending-orders',
  HISTORY_FILLED_ORDERS = 'history-filled-orders',
  HISTORY_POSITIONS = 'history-positions',
  FUNDING_FLOW = 'funding-flow',
}
export default function TradeRecordsScreen() {
  const { i18n } = useLingui()
  const params = useLocalSearchParams<{ tab?: string }>()

  const routes: Route[] = [
    { key: RecordTabKeyEnum.HISTORY_PENDING_ORDERS, title: i18n._(msg`历史委托`) },
    { key: RecordTabKeyEnum.HISTORY_FILLED_ORDERS, title: i18n._(msg`成交记录`) },
    { key: RecordTabKeyEnum.HISTORY_POSITIONS, title: i18n._(msg`历史仓位`) },
    { key: RecordTabKeyEnum.FUNDING_FLOW, title: i18n._(msg`资金流水`) },
  ]

  // 根据 URL 参数确定初始 tab 索引
  const getInitialIndex = () => {
    if (!params.tab) return 0
    const index = routes.findIndex((route) => route.key === params.tab)
    return index >= 0 ? index : 0
  }

  const renderScene = ({ route }: { route: Route }) => {
    switch (route.key) {
      case RecordTabKeyEnum.HISTORY_PENDING_ORDERS:
        return <HistoryOrderList />
      case RecordTabKeyEnum.HISTORY_FILLED_ORDERS:
        return <HistoryFilledOrderList />
      case RecordTabKeyEnum.HISTORY_POSITIONS:
        return <HistoryPositionList />
      case RecordTabKeyEnum.FUNDING_FLOW:
        return <FundFlowList />
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
          tabFlex
          tabBarClassName="border-b border-brand-default px-xl"
          initialIndex={getInitialIndex()}
        />
      </View>
    </View>
  );
}
