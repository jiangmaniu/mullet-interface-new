import React from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { Trans } from '@lingui/react/macro'
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import { Text } from '@/components/ui/text'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/states/empty-state'
import { renderFallback } from '@mullet/utils/fallback'
import { useStores } from '@/v1/provider/mobxProvider'
import { getMoneyRecordsPageList } from '@/v1/services/tradeCore/account'
import { BNumber } from '@mullet/utils/number'
import { cn } from '@/lib/utils'
import { formatAddress } from '@mullet/utils/web3'
import { useI18n } from '@/hooks/use-i18n'
import { getTradeFundFlowTypeEnumOption } from '@/options/trade/fund-flow'
import { Account } from '@/v1/services/tradeCore/account/typings'

const PAGE_SIZE = 10

// ============================================================================
// Card Component
// ============================================================================

function FundFlowCard({ item }: { item: Account.MoneyRecordsPageListItem }) {
  const { trade } = useStores()
  const currentAccountInfo = trade.currentAccountInfo
  const { renderLinguiMsg } = useI18n()

  const OPTIONS: { label: React.ReactNode, content: React.ReactNode }[] = [
    {
      label: <Trans>时间</Trans>,
      content: renderFallback(item.createTime)
    },
    {
      label: <Trans>金额</Trans>,
      content: <Text className={cn('text-paragraph-p3', BNumber.from(item.money)?.gt(0) ? 'text-market-rise' : BNumber.from(item.money)?.lt(0) ? 'text-market-fall' : 'text-content-1')}>
        {BNumber.toFormatNumber(item.money, {
          positive: false,
          unit: currentAccountInfo.currencyUnit, volScale: currentAccountInfo.currencyDecimal
        })}
      </Text>
    },
    {
      label: <Trans>余额</Trans>,
      content: <>
        {BNumber.toFormatNumber(item.newBalance, {
          unit: currentAccountInfo.currencyUnit, volScale: currentAccountInfo.currencyDecimal
        })}
      </>
    },
    {
      label: <Trans>变动前</Trans>,
      content: <>
        {BNumber.toFormatNumber(item.oldBalance, {
          unit: currentAccountInfo.currencyUnit, volScale: currentAccountInfo.currencyDecimal
        })}
      </>
    },
    {
      label: <Trans>交易签名</Trans>,
      content: <>{renderFallback(formatAddress(item.signature), { verify: !!item.signature })}</>
    },
  ]
  return (
    <Card className="bg-background-secondary border border-brand-default">
      <CardContent className="p-3">
        <View className="gap-2">
          <View className="gap-2">
            {/* Time and Type Badge */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                {renderFallback(item.createTime)}
              </Text>
              <Badge color="default">
                <Text className="text-paragraph-p3">{renderLinguiMsg(getTradeFundFlowTypeEnumOption({ value: item.type })?.label, item.type ?? <Trans>未知类型</Trans>)}</Text>
              </Badge>
            </View>

            {OPTIONS.map((item, key) => {
              return <View key={key} className="flex-row items-center justify-between">
                <Text className="text-paragraph-p3 text-content-4">
                  {item.label}
                </Text>
                <Text className="text-paragraph-p3 text-content-1">
                  {item.content}
                </Text>
              </View>
            })}
          </View>
        </View>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// List Component
// ============================================================================

export const FundFlowList = observer(() => {
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
    queryKey: ['fundFlow', accountId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getMoneyRecordsPageList({
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
    const all = data.pages.flatMap(page => page?.records ?? [])
    const seen = new Set<number>()
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
        <EmptyState message={<Trans>暂无资金流水</Trans>} />
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <FundFlowCard item={item} />}
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
