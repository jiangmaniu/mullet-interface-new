import { Trans } from '@lingui/react/macro'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native'

import { EmptyState } from '@/components/states/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useAccountInfo } from '@/hooks/account/use-account-info'
import { useAccountSynopsis } from '@/hooks/account/use-account-synopsis'
import { useCopyText } from '@/hooks/use-copy-text'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { getMoneyTransferStatusEnumOption, MoneyTransferStatusEnum } from '@/options/deposit/status'
import { dayjs } from '@mullet/utils/dayjs'
import { renderFallback } from '@mullet/utils/fallback'
import { BNumber } from '@mullet/utils/number'
import { formatAddress, formatTxHash } from '@mullet/utils/web3'

import { MoneyTransferTypeEnum, MoneyTransferVO, useMoneyTransferList } from '../_apis/use-money-transfer-list'
import { useBillsScreenContext } from '../index'
import { AccountTypeBadge, BillsCardRow } from './card-row'

const PAGE_SIZE = 20

export const WithdrawalList = observer(({ accountSelector }: { accountSelector: React.ReactNode }) => {
  const { dateRange, selectedAccountId } = useBillsScreenContext()
  const selectedAccount = useAccountInfo(selectedAccountId)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } =
    useMoneyTransferList(
      {
        tradeAccountId: selectedAccount?.id,
        type: MoneyTransferTypeEnum.WITHDRAW,
        startDate: dateRange.startDate ? dayjs(dateRange.startDate).format('YYYY-MM-DD') : undefined,
        endDate: dateRange.endDate ? dayjs(dateRange.endDate).format('YYYY-MM-DD') : undefined,
      },
      PAGE_SIZE,
    )

  const records = React.useMemo(() => {
    if (!data?.pages) return []
    const all = data.pages.flatMap((page) => page?.records ?? [])
    const recordMap = new Map<number, MoneyTransferVO>()
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

  const renderItem = ({ item }: { item: MoneyTransferVO }) => <WithdrawalCard record={item} account={selectedAccount} />

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
        <EmptyState message={<Trans>暂无出金记录</Trans>} />
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

// 提现卡片组件
const WithdrawalCard = observer(
  ({ record, account }: { record: MoneyTransferVO; account: User.AccountItem | undefined }) => {
    const { renderLinguiMsg } = useI18n()

    const synopsis = useAccountSynopsis(account?.synopsis)
    const copyText = useCopyText()
    if (!account) return null

    const statusOption = getMoneyTransferStatusEnumOption({ value: record.status as MoneyTransferStatusEnum })
    const statusColor =
      record.status === MoneyTransferStatusEnum.SUCCESS
        ? 'text-market-rise'
        : record.status === MoneyTransferStatusEnum.FAIL || record.status === MoneyTransferStatusEnum.RETURN
          ? 'text-market-fall'
          : 'text-content-1'
    return (
      <Card>
        <CardContent className="gap-medium">
          <BillsCardRow
            label={<Trans>出金金额</Trans>}
            value={BNumber.toFormatNumber(record.money, {
              positive: false,
              unit: account.currencyUnit,
              volScale: account.currencyDecimal,
            })}
          />
          <BillsCardRow
            label={<Trans>出金状态</Trans>}
            valueComponent={
              <Text className={cn('text-paragraph-p3', statusColor)}>
                {renderLinguiMsg(statusOption?.label, record.status ?? <Trans>未知</Trans>)}
              </Text>
            }
          />

          <BillsCardRow
            label={<Trans>转出账户</Trans>}
            valueComponent={
              <View className="gap-xs flex-row items-center">
                {synopsis.abbr && <AccountTypeBadge type={synopsis.abbr} />}
                <Text className="text-paragraph-p3 text-content-1">{renderFallback(account.id)}</Text>
              </View>
            }
          />

          <BillsCardRow
            label={<Trans>收款地址</Trans>}
            valueComponent={
              <View className="gap-xs flex-row items-center">
                <Pressable
                  onPress={() => {
                    if (record.toAddress) {
                      copyText(record.toAddress)
                    }
                  }}
                >
                  <Text className="text-paragraph-p3 text-content-1">{formatAddress(record.toAddress)}</Text>
                </Pressable>
              </View>
            }
          />

          <BillsCardRow
            label="哈希地址"
            valueComponent={
              <Pressable
                onPress={() => {
                  if (record.signature) {
                    copyText(record.signature)
                  }
                }}
              >
                <Text className="text-paragraph-p3 text-content-1">
                  {renderFallback(formatTxHash(record.signature), { verify: !!record.signature })}
                </Text>
              </Pressable>
            }
          />

          <BillsCardRow
            label={<Trans>时间</Trans>}
            value={renderFallback(dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss'), {
              verify: !!record.createTime,
            })}
          />
        </CardContent>
      </Card>
    )
  },
)
