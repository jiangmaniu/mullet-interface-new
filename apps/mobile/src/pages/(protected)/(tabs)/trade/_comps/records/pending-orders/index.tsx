import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

import { EmptyState } from '@/components/states/empty-state'
import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CollapsibleFlatList } from '@/components/ui/collapsible-tab'
import { IconifyNavArrowRight } from '@/components/ui/icons'
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { parseTradePendingOrderInfo } from '@/pages/(protected)/(trade)/_helpers/pending-order'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { subscribeCurrentAndPositionSymbol } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'

import { PendingCurrentPrice } from '../../common/position-current-price'

// ============ PendingOrderItem ============
interface PendingOrderItemProps {
  order: Order.OrderPageListItem
}

const PendingOrderItem = observer(({ order }: PendingOrderItemProps) => {
  const { renderLinguiMsg } = useI18n()
  const pendingOrderInfo = parseTradePendingOrderInfo(order)
  const { trade } = useStores()
  const activeSymbol = trade.activeSymbolName

  return (
    <View className="py-xl gap-xl">
      {/* Header Row */}
      <View className="px-xl flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            if (!order.symbol || activeSymbol === order.symbol) return

            trade.switchSymbol(order.symbol)
            subscribeCurrentAndPositionSymbol({ cover: true })
          }}
        >
          <View className="flex-1 flex-row items-center gap-[10px]">
            <AvatarImage source={getImgSource(order.imgUrl)} className="size-6 rounded-full"></AvatarImage>

            <Text className="text-important-1 text-content-1">{renderFormatSymbolName(order)}</Text>
            <Badge color={pendingOrderInfo.isBuy ? 'rise' : 'fall'}>
              <Text>{pendingOrderInfo.isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
            </Badge>
            <IconifyNavArrowRight width={16} height={16} className="text-content-1" />
          </View>
        </Pressable>

        <CancelOrderAction order={order} />
      </View>

      {/* Data Row: 数量, 挂单价, 标记价 */}
      <View className="px-xl flex-row justify-between">
        <View className="w-[100px]">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>数量({renderLinguiMsg(LOTS_UNIT_LABEL)})</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {BNumber.toFormatNumber(pendingOrderInfo.orderVolume, { volScale: pendingOrderInfo.lotsVolScale })}
          </Text>
        </View>
        <View className="w-[100px]">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>挂单价</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {BNumber.toFormatNumber(pendingOrderInfo.limitPrice, { volScale: pendingOrderInfo.symbolDecimal })}
          </Text>
        </View>
        <View className="w-[100px] items-end">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>标记价</Trans>
          </Text>
          <PendingCurrentPrice info={pendingOrderInfo} className={'text-paragraph-p3'} />
        </View>
      </View>
    </View>
  )
})

// ============ Main Trade Component ============

export const TradePendingOrders = observer(() => {
  const { trade, user } = useStores()
  const pendingList = trade.pendingList
  const currentAccountInfo = trade.currentAccountInfo
  const pendingListLoading = trade.pendingListLoading

  const [refreshing, setRefreshing] = useState(false)
  useEffect(() => {
    if (!currentAccountInfo.id) return
    trade.getPositionList(true)
  }, [currentAccountInfo.id])

  const onRefresh = async () => {
    if (refreshing) return

    setRefreshing(true)
    await trade.getPendingList()
    // 刷新账户信息
    await user.fetchUserInfo(true)
    setRefreshing(false)
  }

  const renderEmpty = () => {
    if (pendingListLoading) {
      return (
        <View className="py-3xl items-center">
          <ActivityIndicator />
        </View>
      )
    }
    return (
      <View className="items-center py-[60px]">
        <EmptyState message={<Trans>暂无委托记录</Trans>} />
      </View>
    )
  }

  return (
    <>
      <CollapsibleFlatList
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        data={pendingList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item: order }) => <PendingOrderItem order={order} />}
        ItemSeparatorComponent={() => <View className="h-xl" />}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.3}
        refreshing={pendingListLoading}
        onRefresh={() => onRefresh()}
        style={{ paddingTop: 16 }}
      />
    </>
  )
})

const CancelOrderAction = observer(({ order }: { order: Order.OrderPageListItem }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { trade } = useStores()

  const onCancel = async () => {
    setIsLoading(true)
    try {
      await trade.cancelOrder({ id: order.id })
      toast.success(<Trans>取消成功</Trans>)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading ? (
        <Spinning width={16} height={16} />
      ) : (
        <Pressable onPress={onCancel}>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>取消</Trans>
          </Text>
        </Pressable>
      )}
    </>
  )
})
