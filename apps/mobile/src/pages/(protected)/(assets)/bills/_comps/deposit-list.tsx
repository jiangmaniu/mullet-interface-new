import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { format } from 'date-fns'
import { dayjs } from '@mullet/utils/dayjs'

import { EmptyState } from '@/components/states/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { DepositEventTypeEnum } from '@/options/deposit/event'
import { DepositStatusEnum, getDepositStatusEnumOption } from '@/options/deposit/status'
import { getAccountSynopsisByLng } from '@/v1/utils/business'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatTxHash } from '@mullet/utils/web3'

import { FundFlowHistoryItem, useFundFlowHistory } from '../_apis/use-fund-flow-history'
import { useBillsScreenContext } from '../index'
import { AccountTypeBadge, BillsCardRow } from './card-row'

const PAGE_SIZE = 20

export const DepositList = observer(({ accountSelector }: { accountSelector: React.ReactNode }) => {
  const { dateRange } = useBillsScreenContext()

  // 格式化时间为 API 需要的格式
  const formatDateTime = (date: Date | null) => {
    if (!date) return undefined
    return format(date, 'yyyy-MM-dd HH:mm:ss')
  }

  const { selectedAccount } = useBillsScreenContext()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useFundFlowHistory(
    {
      accountId: selectedAccount.id,
      eventType: DepositEventTypeEnum.DEPOSIT_COMPLETED,
      startTime: formatDateTime(dateRange.startDate),
      endTime: formatDateTime(dateRange.endDate),
    },
    PAGE_SIZE,
  )

  // 合并所有页数据并去重
  const records = React.useMemo(() => {
    if (!data?.pages) return []
    const all = data.pages.flatMap((page) => page.data ?? [])
    // 使用 Map 去重，保留最新的记录（后面的覆盖前面的）
    const recordMap = new Map<number, FundFlowHistoryItem>()
    all.forEach((item) => {
      if (item.id != null) {
        recordMap.set(item.id, item)
      }
    })
    return Array.from(recordMap.values())
  }, [data])

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const renderItem = ({ item }: { item: FundFlowHistoryItem }) => (
    <DepositCard record={item} account={selectedAccount} />
  )

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
        <EmptyState message={<Trans>暂无入金记录</Trans>} />
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

// 充值卡片组件
const DepositCard = observer(({ record, account }: { record: FundFlowHistoryItem; account: User.AccountItem }) => {
  const { renderLinguiMsg } = useI18n()

  const synopsis = getAccountSynopsisByLng(account.synopsis)
  return (
    <Card>
      <CardContent className="gap-medium">
        <BillsCardRow
          label={<Trans>充值金额</Trans>}
          value={BNumber.toFormatNumber(record.amount, {
            unit: account.currencyUnit,
            volScale: account.currencyDecimal,
          })}
        />

        <BillsCardRow
          label={<Trans>充值状态</Trans>}
          valueComponent={
            <Text
              className={cn(
                'text-paragraph-p3',
                record.depositStatus === DepositStatusEnum.COMPLETED
                  ? 'text-market-rise'
                  : record.depositStatus === DepositStatusEnum.FAILED
                    ? 'text-market-fall'
                    : 'text-content-1',
              )}
            >
              {renderLinguiMsg(
                getDepositStatusEnumOption({ value: record.depositStatus })?.label,
                record.depositStatus ?? <Trans>未知状态</Trans>,
              )}
            </Text>
          }
        />

        <BillsCardRow
          label={<Trans>取现账户</Trans>}
          valueComponent={
            <View className="gap-xs flex-row items-center">
              {synopsis.abbr && <AccountTypeBadge type={synopsis.abbr} />}
              <Text className="text-paragraph-p3 text-content-1">{renderFallback(account.id)}</Text>
            </View>
          }
        />

        <BillsCardRow label={<Trans>链</Trans>} value={renderFallback(record.chain)} />
        <BillsCardRow
          label={<Trans>操作前余额</Trans>}
          value={BNumber.toFormatNumber(record.balanceBefore, {
            unit: account.currencyUnit,
            volScale: account.currencyDecimal,
          })}
        />
        <BillsCardRow
          label={<Trans>操作后余额</Trans>}
          value={BNumber.toFormatNumber(record.balanceAfter, {
            unit: account.currencyUnit,
            volScale: account.currencyDecimal,
          })}
        />
        {record.txHash && <BillsCardRow label={<Trans>交易哈希</Trans>} value={`${formatTxHash(record.txHash)}`} />}
        <BillsCardRow
          label={<Trans>时间</Trans>}
          value={renderFallback(dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss'), { verify: !!record.createdAt })}
        />
      </CardContent>
    </Card>
  )
})
