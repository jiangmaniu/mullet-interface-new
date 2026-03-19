import { Trans } from '@lingui/react/macro'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/components/states/empty-state'
import { AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { parseSymbolLotsVolScale, renderFormatSymbolName } from '@/helpers/symbol'
import { renderFormatLeverage } from '@/helpers/trade'
import { useI18n } from '@/hooks/use-i18n'
import { getOrderStatusEnumOption, getOrderTypeEnumOption, OrderStatusEnum, OrderTypeEnum } from '@/options/trade/order'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { useRootStore } from '@/stores'
import {
  userInfoActiveTradeAccountCurrencyInfoSelector,
  userInfoActiveTradeAccountIdSelector,
} from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { getOrderPage } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'

const PAGE_SIZE = 10

// ============================================================================
// Card Component
// ============================================================================

const OrderCard = observer(({ order }: { order: Order.OrderPageListItem }) => {
  const isBuy = order.buySell === 'BUY'
  const { renderLinguiMsg } = useI18n()

  const lotsVolScale = parseSymbolLotsVolScale(order.conf)

  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))

  const ITEM_OPTIONS: { label: React.ReactNode; content: React.ReactNode }[] = [
    {
      label: (
        <>
          <Trans>挂单价格</Trans>
          {order.status !== OrderStatusEnum.CANCEL ? (
            <>
              /<Trans>成交价格</Trans>
            </>
          ) : null}
        </>
      ),
      content: (
        <>
          {order.type === OrderTypeEnum.MARKET_ORDER ? (
            <Trans>市价</Trans>
          ) : (
            BNumber.toFormatNumber(order.limitPrice, {
              volScale: currentAccountCurrencyInfo?.currencyDecimal,
            })
          )}
          {order.type === OrderTypeEnum.MARKET_ORDER ? (
            <>
              {' / '}
              {BNumber.toFormatNumber(order?.tradePrice, {
                volScale: currentAccountCurrencyInfo?.currencyDecimal,
              })}
            </>
          ) : null}
        </>
      ),
    },
    {
      label: <Trans>数量({renderLinguiMsg(LOTS_UNIT_LABEL)})</Trans>,
      content: BNumber.toFormatNumber(order.orderVolume, { volScale: lotsVolScale }),
    },
    ...(order.status !== OrderStatusEnum.CANCEL
      ? [
          {
            label: <Trans>手续费({currentAccountCurrencyInfo?.currencyUnit})</Trans>,
            content: BNumber.toFormatNumber(order.handlingFees, {
              volScale: currentAccountCurrencyInfo?.currencyDecimal,
            }),
          },

          {
            label: <Trans>订单号</Trans>,
            content: renderFallback(order.id),
          },
          {
            label: <Trans>交易时间</Trans>,
            content: renderFallback(order.finishTime),
          },
        ]
      : []),
  ]

  const formatedLeverage = renderFormatLeverage({
    leverage: order.leverageMultiple,
    symbolInfo: order.conf,
  })
  return (
    <Card className="bg-background-secondary border-brand-default border">
      <CardContent className="gap-medium">
        {/* Header: Symbol, Direction Badge, and Status */}
        <View className="flex-row items-center justify-between">
          <View className="gap-medium flex-1 flex-row items-center">
            <AvatarImage source={getImgSource(order.imgUrl)} className="size-6 rounded-full"></AvatarImage>

            <View className="flex-row items-center gap-2">
              <Text className="text-paragraph-p2 text-content-1">{renderFormatSymbolName(order)}</Text>
              <Badge color={isBuy ? 'rise' : 'fall'}>
                <Text className="text-paragraph-p3">{isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}</Text>
              </Badge>
            </View>

            {formatedLeverage && (
              <View className="px-xs rounded-xs bg-white">
                <Text className="text-paragraph-p3">{renderFallback(formatedLeverage)}</Text>
              </View>
            )}
          </View>

          {order.status && (
            <Badge className="px-medium py-small">
              <Text className="text-paragraph-p3">
                {renderLinguiMsg(
                  getOrderStatusEnumOption({ value: order.status })?.label,
                  order.status ?? <Trans>未知状态</Trans>,
                )}
              </Text>
            </Badge>
          )}
        </View>

        {/* Order Type and Time */}
        <View className="flex-row items-start gap-3">
          <Text className="text-paragraph-p3 text-content-1">
            {renderLinguiMsg(
              getOrderTypeEnumOption({ value: order.type })?.label,
              order.type ?? <Trans>未知类型</Trans>,
            )}
          </Text>
          <Text className="text-paragraph-p3 text-content-4">{renderFallback(order.createTime)}</Text>
        </View>

        {/* Order Details */}
        <View className="gap-2">
          {ITEM_OPTIONS.map((item, key) => {
            return (
              <View key={key} className="flex-row items-center justify-between">
                <Text className="text-paragraph-p3 text-content-4">{item.label}</Text>
                <Text className="text-paragraph-p3 text-content-1">{item.content}</Text>
              </View>
            )
          })}
        </View>
      </CardContent>
    </Card>
  )
})
// ============================================================================
// List Component
// ============================================================================

export const HistoryOrderList = observer(() => {
  const accountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['historyOrders', accountId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getOrderPage({
        current: pageParam,
        size: PAGE_SIZE,
        accountId: accountId!,
        status: 'CANCEL,FAIL,FINISH',
      })
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined
      return lastPage.current < lastPage.pages ? lastPage.current + 1 : undefined
    },
    enabled: !!accountId,
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
  })

  const records = React.useMemo(() => {
    if (!data?.pages) return []
    const all = data.pages.flatMap((page) => page?.records ?? [])
    const seen = new Set<number>()
    return all.filter((item) => {
      if (item.id == null || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [data])

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-xl items-center">
          <ActivityIndicator />
        </View>
      )
    }
    if (!hasNextPage && records.length > 0) {
      return (
        <View className="py-xl items-center">
          <Text className="text-paragraph-p3 text-content-4">
            <Trans>没有更多了</Trans>
          </Text>
        </View>
      )
    }
    return null
  }

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-3xl items-center">
          <ActivityIndicator />
        </View>
      )
    }
    return (
      <View className="items-center py-[60px]">
        <EmptyState message={<Trans>暂无历史委托</Trans>} />
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <OrderCard order={item} />}
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      onRefresh={() => refetch()}
      refreshing={isRefetching && !isFetchingNextPage}
      style={{ paddingHorizontal: 16, paddingTop: 16 }}
    />
  )
})
