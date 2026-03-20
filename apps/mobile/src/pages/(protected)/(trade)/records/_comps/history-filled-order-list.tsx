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
import { cn } from '@/lib/utils'
import { getOrderCompletionTypeEnumOption } from '@/options/trade/order'
import { useRootStore } from '@/stores'
import {
  userInfoActiveTradeAccountCurrencyInfoSelector,
  userInfoActiveTradeAccountIdSelector,
} from '@/stores/user-slice/infoSlice'
import { getImgSource } from '@/utils/img'
import { getTradeRecordsPage } from '@/v1/services/tradeCore/order'
import { Order } from '@/v1/services/tradeCore/order/typings'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

const PAGE_SIZE = 10

// ============================================================================
// Card Component
// ============================================================================

const FilledOrderCard = observer(({ order }: { order: Order.TradeRecordsPageListItem }) => {
  const isBuy = order.buySell === 'BUY'
  const { renderLinguiMsg } = useI18n()
  const currentAccountCurrencyInfo = useRootStore(useShallow(userInfoActiveTradeAccountCurrencyInfoSelector))

  const lotVolScale = parseSymbolLotsVolScale(order.conf)

  const OPTIONS: { label: React.ReactNode; content: React.ReactNode }[] = [
    {
      label: <Trans>盈亏</Trans>,
      content: (
        <Text
          className={cn(
            'text-paragraph-p3',
            BNumber.from(order.profit)?.gt(0)
              ? 'text-market-rise'
              : BNumber.from(order.profit)?.lt(0)
                ? 'text-market-fall'
                : 'text-content-1',
          )}
        >
          {BNumber.toFormatNumber(order.profit, {
            forceSign: true,
            positive: false,
            volScale: currentAccountCurrencyInfo?.currencyDecimal,
          })}
        </Text>
      ),
    },
    {
      label: <Trans>开仓价格/成交价格</Trans>,
      content: (
        <>
          {BNumber.toFormatNumber(order?.startPrice, {
            volScale: order?.symbolDecimal,
          })}
          {' / '}
          {BNumber.toFormatNumber(order?.tradePrice, {
            volScale: order?.symbolDecimal,
          })}
        </>
      ),
    },
    {
      label: <Trans>数量(手)</Trans>,
      content: <>{BNumber.toFormatNumber(order.tradingVolume, { volScale: lotVolScale })}</>,
    },
    // {
    //   label: <Trans>保证金类型</Trans>,
    //   content: (
    //     <>
    //       {renderLinguiMsg(
    //         getOrderMarginTypeEnumOption({ value: order.marginType })?.label,
    //         order.marginType ?? <Trans>未知类型</Trans>,
    //       )}
    //     </>
    //   ),
    // },
    {
      label: <Trans>交易类型</Trans>,
      content: (
        <>
          {renderLinguiMsg(
            getOrderCompletionTypeEnumOption({ value: order.inOut })?.label,
            order.inOut ?? <Trans>未知类型</Trans>,
          )}
        </>
      ),
    },
    {
      label: <Trans>订单号</Trans>,
      content: <>{renderFallback(order.id)}</>,
    },
    {
      label: <Trans>交易签名</Trans>,
      content: <>{renderFallback(formatAddress(order.signature), { verify: !!order.signature })}</>,
    },
  ]

  const formatedLeverage = renderFormatLeverage({
    symbolInfo: order.conf,
  })

  return (
    <Card className="bg-background-secondary border-brand-default border">
      <CardContent className="gap-xs">
        {/* Header */}
        <View className="gap-xs">
          <View className="flex-row items-center gap-2">
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

          <View className="flex-row items-start gap-3">
            <Text className="text-paragraph-p3 text-content-4">{renderFallback(order.createTime)}</Text>
          </View>
        </View>

        {/* Order Details */}
        <View className="gap-medium">
          {OPTIONS.map((item, key) => {
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

export const HistoryFilledOrderList = observer(() => {
  const accountId = useRootStore(userInfoActiveTradeAccountIdSelector)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['tradeRecords', accountId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getTradeRecordsPage({
        current: pageParam,
        size: PAGE_SIZE,
        accountId: accountId!,
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
        <EmptyState message={<Trans>暂无成交记录</Trans>} />
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <FilledOrderCard order={item} />}
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
