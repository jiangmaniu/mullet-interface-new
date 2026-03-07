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
import { BNumber } from "@mullet/utils/number";
import { renderFallback } from "@mullet/utils/fallback";
import { useStores } from "@/v1/provider/mobxProvider";

const PAGE_SIZE = 20;

export const DepositList = observer(({
  accountSelector,
}: {
  accountSelector: React.ReactNode;
}) => {
  const { selectedAccount } = useBillsScreenContext();
  const { user } = useStores();

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
      tradeAccountId: selectedAccount?.id,
      type: 'deposit',
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
  const { selectedAccount } = useBillsScreenContext();

  return (
    <Card>
      <CardContent className="gap-medium">
        <BillsCardRow
          label={<Trans>入金金额</Trans>}
          value={`${BNumber.toFormatNumber(record.amount, { unit: selectedAccount?.currencyUnit, volScale: selectedAccount?.currencyDecimal })}`}
        />
        <BillsCardRow
          label={<Trans>入金状态</Trans>}
          value={renderFallback(record.status)}
        />
        <BillsCardRow
          label={<Trans>收款账户</Trans>}
          value={renderFallback(record.tradeAccountId)}
        />
        <BillsCardRow
          label={<Trans>时间</Trans>}
          value={renderFallback(record.createTime)}
        />
        {record.remark && (
          <BillsCardRow
            label={<Trans>备注</Trans>}
            value={record.remark}
          />
        )}
      </CardContent>
    </Card>
  );
})

