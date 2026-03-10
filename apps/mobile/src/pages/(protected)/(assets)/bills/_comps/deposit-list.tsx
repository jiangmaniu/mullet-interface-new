import { observer } from "mobx-react-lite"
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Trans } from '@lingui/react/macro';
import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { BillsCardRow } from "./card-row";
import { useBillsScreenContext } from "../index";
import { useFundFlowHistory, FundFlowHistoryItem } from "../_apis/use-fund-flow-history";
import { EmptyState } from "@/components/states/empty-state";
import { renderFallback } from "@mullet/utils/fallback";
import { useStores } from "@/v1/provider/mobxProvider";
import { DepositEventTypeEnum, getDepositEventTypeEnumOption } from "@/options/deposit/event";
import { useI18n } from "@/hooks/use-i18n";
import { format } from 'date-fns';

const PAGE_SIZE = 50;

export const DepositList = observer(({
  accountSelector,
}: {
  accountSelector: React.ReactNode;
}) => {
  const { dateRange } = useBillsScreenContext();
  const { user } = useStores();

  // 格式化时间为 API 需要的格式
  const formatDateTime = (date: Date | null) => {
    if (!date) return undefined;
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useFundFlowHistory(
    {
      userId: String(user.currentUser.id!),
      eventType: DepositEventTypeEnum.DEPOSIT_COMPLETED,
      startTime: formatDateTime(dateRange.startDate),
      endTime: formatDateTime(dateRange.endDate),
    },
    PAGE_SIZE
  );

  // 合并所有页数据并去重
  const records = React.useMemo(() => {
    if (!data?.pages) return [];
    const all = data.pages.flatMap(page => page?.data ?? []);
    // 使用 Map 去重，保留最新的记录（后面的覆盖前面的）
    const recordMap = new Map<number, FundFlowHistoryItem>();
    all.forEach(item => {
      if (item.id != null) {
        recordMap.set(item.id, item);
      }
    });
    return Array.from(recordMap.values());
  }, [data]);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: FundFlowHistoryItem }) => (
    <DepositCard record={item} />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-xl items-center">
          <ActivityIndicator />
        </View>
      );
    }
    if (!hasNextPage && records.length > 0) {
      return (
        <View className="py-xl items-center">
          <Text className="text-paragraph-p3 text-content-4"><Trans>没有更多了</Trans></Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-3xl items-center">
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View className="py-[60px] items-center">
        <EmptyState message={<Trans>暂无入金记录</Trans>} />
      </View>
    );
  };

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={
        <View className="pt-xl pb-xl">
          {accountSelector}
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      onRefresh={() => refetch()}
      refreshing={isRefetching && !isFetchingNextPage}
      style={{ paddingHorizontal: 16 }}
    />
  );
})

// 充值卡片组件
const DepositCard = observer(({ record }: { record: FundFlowHistoryItem }) => {
  const { renderLinguiMsg } = useI18n();

  return (
    <Card>
      <CardContent className="gap-medium">
        <BillsCardRow
          label={<Trans>事件类型</Trans>}
          value={renderLinguiMsg(getDepositEventTypeEnumOption({ value: record.eventType })?.label, <Trans>未知类型</Trans>)}
        />
        <BillsCardRow
          label={<Trans>入金金额</Trans>}
          value={record.amount ? `${record.amount} ${record.token ?? 'USDC'}` : '-'}
        />
        <BillsCardRow
          label={<Trans>链</Trans>}
          value={renderFallback(record.chain)}
        />
        <BillsCardRow
          label={<Trans>操作前余额</Trans>}
          value={record.balanceBefore ? `${record.balanceBefore} USDC` : '-'}
        />
        <BillsCardRow
          label={<Trans>操作后余额</Trans>}
          value={record.balanceAfter ? `${record.balanceAfter} USDC` : '-'}
        />
        {record.txHash && (
          <BillsCardRow
            label={<Trans>交易哈希</Trans>}
            value={`${record.txHash.slice(0, 6)}...${record.txHash.slice(-4)}`}
          />
        )}
        <BillsCardRow
          label={<Trans>时间</Trans>}
          value={renderFallback(record.createdAt)}
        />
      </CardContent>
    </Card>
  );
})

