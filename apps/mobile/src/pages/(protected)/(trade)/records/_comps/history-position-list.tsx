import React from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvatarImage } from '@/components/ui/avatar'
import { EmptyState } from '@/components/states/empty-state'
import { renderFallback } from '@mullet/utils/fallback'
import { useStores } from '@/v1/provider/mobxProvider'
import { getBgaOrderPage } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { getImgSource } from '@/utils/img'
import { parseSymbolLotsVolScale, renderFormatSymbolName } from '@/helpers/symbol'
import { cn } from '@/lib/utils'
import { BNumber } from '@mullet/utils/number'
import { useI18n } from '@/hooks/use-i18n'
import { getOrderMarginTypeEnumOption } from '@/options/trade/order'
import { LOTS_UNIT_LABEL } from '@/options/trade/unit'
import { TradePositionStatusEnum } from '@/options/trade/position'

const PAGE_SIZE = 10

// ============================================================================
// Card Component
// ============================================================================

const PositionCard = observer(({ order }: { order: Order.BgaOrderPageListItem }) => {
  const isBuy = order.buySell === 'BUY'
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo
  const lotVolScale = parseSymbolLotsVolScale(order.conf)
  const { renderLinguiMsg } = useI18n()

  const OPTIONS: { label: React.ReactNode; content: React.ReactNode }[] = [
    {
      label: <Trans>盈亏</Trans>,
      content: <Text className={cn(BNumber.from(order.profit)?.gt(0) ? 'text-market-rise' : BNumber.from(order.profit)?.lt(0) ? 'text-market-fall' : 'text-content-1')}>{BNumber.toFormatNumber(order.profit, { forceSign: true, positive: false, volScale: currentAccountInfo.currencyDecimal, unit: currentAccountInfo.currencyUnit })}</Text>
    },
    {
      label: <Trans>开仓手数/价格</Trans>,
      content: <>
        {BNumber.toFormatNumber(order?.orderVolume, {
          volScale: lotVolScale,
          unit: renderLinguiMsg(LOTS_UNIT_LABEL)
        })}
        {' / '}
        {BNumber.toFormatNumber(order?.startPrice, {
          volScale: order?.symbolDecimal
        })}
      </>
    },
    {
      label: <Trans>止盈/止损</Trans>,
      content: <>{BNumber.toFormatNumber(order.takeProfit, { volScale: order.symbolDecimal })}/{BNumber.toFormatNumber(order.stopLoss, { volScale: order.symbolDecimal })}</>
    },
    {
      label: <Trans>保证金类型</Trans>,
      content: <>{renderLinguiMsg(getOrderMarginTypeEnumOption({ value: order.marginType })?.label, order.marginType ?? <Trans>未知类型</Trans>)}</>
    },
    {
      label: <Trans>开仓时间</Trans>,
      content: <>{renderFallback(order.createTime)}</>
    },
    {
      label: <Trans>持仓单号</Trans>,
      content: <>{renderFallback(order.id)}</>
    },
    {
      label: <Trans>交易账号</Trans>,
      content: <>
        {renderFallback(order.tradeAccountId)}
      </>
    },
    {
      label: <Trans>地址</Trans>,
      content: <>{renderFallback()}</>
    },
    {
      label: <Trans>手续费/库存费</Trans>,
      content: <>
        {BNumber.toFormatNumber(order.handlingFees, { unit: currentAccountInfo.currencyUnit, positive: false, volScale: currentAccountInfo.currencyDecimal })}
        {' / '}
        {BNumber.toFormatNumber(order.interestFees, { unit: currentAccountInfo.currencyUnit, positive: false, volScale: currentAccountInfo.currencyDecimal })}
      </>
    }
  ]
  return (
    <Card className="bg-background-secondary border border-brand-default">
      <CardContent>
        <View className="gap-medium">
          {/* Header: Symbol and Direction Badge */}
          <View className="flex-row items-center gap-medium">
            <AvatarImage source={getImgSource(order.imgUrl)} className="size-6 rounded-full">
            </AvatarImage>

            <View className="flex-row items-center gap-medium">
              <Text className="text-paragraph-p2 text-content-1">
                {renderFormatSymbolName(order)}
              </Text>
              <Badge color={isBuy ? 'rise' : 'fall'}>
                <Text className="text-paragraph-p3">
                  {isBuy ? <Trans>做多</Trans> : <Trans>做空</Trans>}
                </Text>
              </Badge>
            </View>
          </View>

          {/* Position Details */}
          {
            OPTIONS.map((item, key) => {
              return <View key={key} className="flex-row items-center justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  {item.label}
                </Text>
                <Text className="text-paragraph-p3 text-content-1">
                  {item.content}
                </Text>
              </View>
            })
          }
        </View>
      </CardContent>
    </Card>
  )
})

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
        status: TradePositionStatusEnum.FINISH,
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
