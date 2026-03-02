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

const PAGE_SIZE = 10

// ============================================================================
// 辅助函数
// ============================================================================

const INCOME_TYPES: API.MoneyType[] = ['DEPOSIT', 'DEPOSIT_SIMULATE', 'GIFT', 'FOLLOW_PROFIT']

function getMoneyTypeLabel(type?: API.MoneyType) {
  switch (type) {
    case 'DEPOSIT': return '入金'
    case 'DEPOSIT_SIMULATE': return '入金(模拟)'
    case 'WITHDRAWAL': return '出金'
    case 'MARGIN': return '保证金'
    case 'PROFIT': return '盈亏'
    case 'HANDLING_FEES': return '手续费'
    case 'INTEREST_FEES': return '库存费'
    case 'GIFT': return '赠金'
    case 'TRANSFER': return '划转'
    case 'FOLLOW_PROFIT': return '跟单分润'
    case 'ZERO': return '归零'
    case 'BALANCE': return '结余'
    default: return renderFallback(type)
  }
}

// ============================================================================
// Card Component
// ============================================================================

function FundFlowCard({ item }: { item: Account.MoneyRecordsPageListItem }) {
  const isIncome = item.type ? INCOME_TYPES.includes(item.type) : (item.money ?? 0) >= 0

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
                <Text className="text-paragraph-p3">{getMoneyTypeLabel(item.type)}</Text>
              </Badge>
            </View>

            {/* Amount */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>金额</Trans>
              </Text>
              <Text
                className={`text-paragraph-p3 ${isIncome ? 'text-market-rise' : 'text-market-fall'}`}
              >
                {isIncome ? '' : '-'}{renderFallback(item.money)} USDC
              </Text>
            </View>

            {/* Balance */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>余额</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {renderFallback(item.newBalance)} USDC
              </Text>
            </View>

            {/* Before Change */}
            <View className="flex-row items-center justify-between">
              <Text className="text-paragraph-p3 text-content-4">
                <Trans>变动前</Trans>
              </Text>
              <Text className="text-paragraph-p3 text-content-1">
                {renderFallback(item.oldBalance)} USDC
              </Text>
            </View>
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
