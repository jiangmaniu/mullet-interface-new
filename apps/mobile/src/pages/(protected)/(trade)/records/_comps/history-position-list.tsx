import React from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/states/empty-state'
import { renderFallback } from '@mullet/utils/fallback'
import { useStores } from '@/v1/provider/mobxProvider'
import { getBgaOrderPage } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'

const PAGE_SIZE = 10

// ============================================================================
// Card Component
// ============================================================================

function PositionCard({ order }: { order: Order.BgaOrderPageListItem }) {
  const isBuy = order.buySell === 'BUY'

  return (
    <Card className="bg-background-secondary border border-brand-default">
      <CardContent>
        <View className="gap-medium">
          {/* Header: Symbol and Direction Badge */}
          <View className="flex-row items-center gap-medium">
            <Avatar className="size-6">
              <AvatarFallback className="bg-button">
                <Text className="text-paragraph-p3 text-content-1">
                  {order.symbol?.charAt(0) ?? 'S'}
                </Text>
              </AvatarFallback>
            </Avatar>

            <View className="flex-row items-center gap-medium">
              <Text className="text-paragraph-p2 text-content-1">
                {renderFallback(order.alias || order.symbol)}
              </Text>
              <Badge color={isBuy ? 'rise' : 'fall'}>
                <Text className="text-paragraph-p3">
                  {isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}
                </Text>
              </Badge>
            </View>
          </View>

          {/* Position Details */}
          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>浮动盈亏</Trans>
            </Text>
            <Text
              className={`text-paragraph-p3 ${(order.profit ?? 0) >= 0 ? 'text-market-rise' : 'text-market-fall'}`}
            >
              {renderFallback(order.profit)} USDC
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓手数/价格</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {renderFallback(order.orderVolume)} 手/{renderFallback(order.startPrice)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>止盈/止损</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {renderFallback(order.takeProfit)}/{renderFallback(order.stopLoss)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>开仓时间</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {renderFallback(order.createTime)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>持仓单号</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {renderFallback(order.id)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>交易账号</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {renderFallback(order.accountId)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-paragraph-p3 text-content-4">
              <Trans>手续费/库存费</Trans>
            </Text>
            <Text className="text-paragraph-p3 text-content-1">
              {renderFallback(order.handlingFees)} USDC/{renderFallback(order.interestFees)} USDC
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// List Component
// ============================================================================

export const HistoryPositionList = observer(() => {
  const { trade } = useStores()
  const accountId = trade.currentAccountInfo?.id

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['historyPositions', accountId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getBgaOrderPage({
        current: pageParam,
        size: PAGE_SIZE,
        accountId: accountId!,
        status: 'FINISH' as API.BGAStatus,
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
    const all = data.pages.flatMap(page => page?.records ?? [])
    const seen = new Set<string>()
    return all.filter(item => {
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
          <Text className="text-paragraph-p3 text-content-4"><Trans>没有更多了</Trans></Text>
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
      <View className="py-[60px] items-center">
        <EmptyState message={<Trans>暂无历史仓位</Trans>} />
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <PositionCard order={item} />}
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
