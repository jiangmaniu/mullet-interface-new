import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'

import { EmptyState } from '@/components/states/empty-state'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useAccountInfo } from '@/hooks/account/use-account-info'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { dayjs } from '@mullet/utils/dayjs'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress } from '@mullet/utils/web3'

import { MoneyTransferVO, useMoneyTransferList } from '../_apis/use-money-transfer-list'
import { useBillsScreenContext } from '../index'
import { BillsCardRow } from './card-row'

const PAGE_SIZE = 10

export const TransferList = observer(({ accountSelector }: { accountSelector: React.ReactNode }) => {
  const { selectedAccountId, dateRange } = useBillsScreenContext()
  const selectedAccount = useAccountInfo(selectedAccountId)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } =
    useMoneyTransferList(
      {
        tradeAccountId: selectedAccount?.id,
        startDate: dateRange.startDate ? dayjs(dateRange.startDate).format('YYYY-MM-DD') : undefined,
        endDate: dateRange.endDate ? dayjs(dateRange.endDate).format('YYYY-MM-DD') : undefined,
      },
      PAGE_SIZE,
    )

  // 将所有页的记录合并并去重
  const records = React.useMemo(() => {
    if (!data?.pages) return []
    const all = data.pages.flatMap((page) => page?.records ?? [])
    // 按 id 去重
    const seen = new Set<number>()
    return all.filter((item) => {
      if (item.id == null || seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
  }, [data])

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const renderItem = ({ item }: { item: MoneyTransferVO }) => <TransferCard record={item} />

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
        <EmptyState message={<Trans>暂无划转记录</Trans>} />
      </View>
    )
  }

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={<View className="pt-xl pb-xl">{accountSelector}</View>}
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      onRefresh={() => refetch()}
      refreshing={isRefetching && !isFetchingNextPage}
      style={{ paddingHorizontal: 16 }}
    />
  )
})

// 划转卡片组件
const TransferCard = observer(({ record }: { record: MoneyTransferVO }) => {
  const { selectedAccountId } = useBillsScreenContext()
  const selectedAccount = useAccountInfo(selectedAccountId)

  const fromAccount = useAccountInfo(record?.tradeAccountId)
  const toAccount = useAccountInfo(record?.toAccountId)

  const fromSynopsis = useAccountSynopsis(fromAccount?.synopsis)
  const toSynopsis = useAccountSynopsis(toAccount?.synopsis)

  return (
    <Card>
      <CardContent className="gap-medium">
        <BillsCardRow
          label={<Trans>划转金额</Trans>}
          value={BNumber.toFormatNumber(record.money, {
            unit: selectedAccount?.currencyUnit,
            volScale: selectedAccount?.currencyDecimal,
          })}
        />
        <BillsCardRow
          label={<Trans>转出账户</Trans>}
          valueComponent={
            <View className="flex-row gap-1">
              <Badge color="default">
                <Text>{fromSynopsis?.abbr}</Text>
              </Badge>
              <Text className="text-paragraph-p3 text-content-1">{renderFallback(record?.tradeAccountId)}</Text>
            </View>
          }
        />
        <BillsCardRow label={<Trans>转出地址</Trans>} value={formatAddress(record?.address)} />
        <BillsCardRow
          label={<Trans>转入账户</Trans>}
          valueComponent={
            <View className="flex-row gap-1">
              <Badge color="default">
                <Text>{toSynopsis?.abbr}</Text>
              </Badge>
              <Text className="text-paragraph-p3 text-content-1">{renderFallback(record?.toAccountId)}</Text>
            </View>
          }
        />
        <BillsCardRow label={<Trans>转入地址</Trans>} value={formatAddress(record?.toAddress)} />
        <BillsCardRow label={<Trans>哈希地址</Trans>} value={formatAddress(record?.signature)} />
        <BillsCardRow label={<Trans>时间</Trans>} value={renderFallback(record?.createTime)} />
      </CardContent>
    </Card>
  )
})
