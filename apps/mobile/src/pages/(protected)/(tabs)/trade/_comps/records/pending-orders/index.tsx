import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/states/empty-state'
import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CollapsibleFlatList } from '@/components/ui/collapsible-tab'
import { IconifyChatBubbleXmark, IconifyNavArrowRight } from '@/components/ui/icons'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Spinning } from '@/components/ui/spinning'
import { Text } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'
import { renderFormatSymbolName } from '@/helpers/symbol'
import { useI18n } from '@/hooks/use-i18n'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { parseTradePendingOrderInfo } from '@/pages/(protected)/(trade)/_helpers/pending-order'
import { useTradeSwitchActiveSymbol } from '@/pages/(protected)/(trade)/_hooks/use-trade-switch-symbol'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import {
  createOrderItemSelector,
  tradeOrderIdListSelector,
  tradeOrderLoadingSelector,
} from '@/stores/trade-slice/order-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { useStores } from '@/v1/provider/mobxProvider'
import { cancelOrder } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import trade from '@/v1/stores/trade'
import { BNumber } from '@mullet/utils/number'

import { PendingCurrentPrice } from '../../common/position-current-price'

// ============ 列表容器：只订阅 idList ============

export const TradePendingOrders = () => {
  const { user } = useStores()
  const orderIdList = useRootStore(useShallow(tradeOrderIdListSelector))
  const pendingListLoading = useRootStore(tradeOrderLoadingSelector)
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  useEffect(() => {
    if (!activeTradeAccountId) return
    useRootStore.getState().trade.order.fetch()
  }, [activeTradeAccountId])

  const onRefresh = async () => {
    await useRootStore.getState().trade.order.fetch()
    await user.fetchUserInfo(true)
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
    <CollapsibleFlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={orderIdList}
      keyExtractor={(id) => id}
      renderItem={({ item: id }) => <PendingOrderItemById id={id} />}
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListEmptyComponent={renderEmpty}
      onEndReachedThreshold={0.3}
      refreshing={pendingListLoading}
      onRefresh={() => onRefresh()}
      style={{ paddingTop: 16 }}
    />
  )
}

// ============ 按 ID 精准订阅的 Item 包装 ============

const PendingOrderItemById = ({ id }: { id: string }) => {
  const order = useRootStore(createOrderItemSelector(id))
  if (!order) return null
  return <PendingOrderItem order={order} />
}

// ============ PendingOrderItem ============

const PendingOrderItem = ({ order }: { order: Order.OrderPageListItem }) => {
  const { renderLinguiMsg } = useI18n()
  const pendingOrderInfo = parseTradePendingOrderInfo(order)
  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
  const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()

  return (
    <View className="py-xl gap-xl">
      {/* Header Row */}
      <View className="px-xl flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            if (!order.symbol || activeSymbol === order.symbol) return
            switchTradeActiveSymbol(order.symbol)
          }}
        >
          <View className="flex-1 flex-row items-center gap-[10px]">
            <AvatarImage source={getImgSource(order.imgUrl)} className="size-6 rounded-full"></AvatarImage>

            <Text className="text-important-1 text-content-1">{renderFormatSymbolName(order)}</Text>
            <Badge color={pendingOrderInfo?.isBuy ? 'rise' : 'fall'}>
              <Text>{pendingOrderInfo?.isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
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
            {BNumber.toFormatNumber(pendingOrderInfo?.orderVolume, { volScale: pendingOrderInfo?.lotsVolScale })}
          </Text>
        </View>
        <View className="w-[100px]">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>挂单价</Trans>
          </Text>
          <Text className="text-paragraph-p3 text-content-1">
            {BNumber.toFormatNumber(pendingOrderInfo?.limitPrice, { volScale: pendingOrderInfo?.symbolDecimal })}
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
}

// ============ 取消挂单 ============

const CancelOrderAction = ({ order }: { order: Order.OrderPageListItem }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const onCancel = async () => {
    setIsLoading(true)
    try {
      const { success } = await cancelOrder({ id: order.id })
      if (success) {
        await Promise.all([trade.getPendingList(), useRootStore.getState().trade.order.fetch()])
        setShowConfirm(false)
        toast.success(<Trans>取消成功</Trans>)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading ? (
        <Spinning width={16} height={16} />
      ) : (
        <Pressable onPress={() => setShowConfirm(true)}>
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>取消</Trans>
          </Text>
        </Pressable>
      )}

      <Modal visible={showConfirm} onClose={() => setShowConfirm(false)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              <Trans>取消挂单</Trans>
            </ModalTitle>
          </ModalHeader>

          <View className="gap-medium items-center">
            <IconifyChatBubbleXmark width={32} height={32} className="text-content-1" />
            <Text className="text-paragraph-p2 text-content-1 text-center">
              <Trans>确定要取消挂单吗？</Trans>
            </Text>
          </View>

          <ModalFooter>
            <Button className="flex-1" size="lg" onPress={() => setShowConfirm(false)}>
              <Text>
                <Trans>取消</Trans>
              </Text>
            </Button>
            <Button className="flex-1" size="lg" color="primary" loading={isLoading} onPress={onCancel}>
              <Text>
                <Trans>确定</Trans>
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
