# 无限滚动列表实现范式

## 核心依赖

- `@tanstack/react-query` 的 `useInfiniteQuery`
- React Native 的 `FlatList`
- `mobx-react-lite` 的 `observer`

## 标准实现模板

```tsx
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { FlatList, ActivityIndicator, View } from 'react-native';
import { observer } from "mobx-react-lite";
import { dayjs } from "@mullet/utils/dayjs";

const PAGE_SIZE = 10;

export const XxxList = observer(({ accountSelector }: { accountSelector: React.ReactNode }) => {
  // 1. 通过 Context 获取筛选条件
  const { selectedAccount, dateRange } = useBillsScreenContext();

  // 2. useInfiniteQuery 配置
  const {
    data, fetchNextPage, hasNextPage,
    isFetchingNextPage, isLoading, refetch, isRefetching,
  } = useInfiniteQuery({
    // queryKey 包含所有筛选条件，条件变化时自动 refetch
    queryKey: ['recordKey', selectedAccount?.id, dateRange.startDate?.getTime(), dateRange.endDate?.getTime()],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getMoneyRecordsPageList({
        current: pageParam,
        size: PAGE_SIZE,
        type: 'TRANSFER',
        accountId: selectedAccount?.id,
        startTime: dateRange.startDate ? dayjs(dateRange.startDate).format('YYYY-MM-DD 00:00:00') : undefined,
        endTime: dateRange.endDate ? dayjs(dateRange.endDate).format('YYYY-MM-DD 23:59:59') : undefined,
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      return lastPage.current < lastPage.pages ? lastPage.current + 1 : undefined;
    },
    enabled: !!selectedAccount?.id,
    // 保留旧数据，queryKey 变化时先展示旧数据再后台刷新
    placeholderData: keepPreviousData,
    // 组件重新挂载时始终后台刷新最新数据
    refetchOnMount: 'always',
  });

  // 3. 合并所有页数据并去重
  const records = React.useMemo(() => {
    if (!data?.pages) return [];
    const all = data.pages.flatMap(page => page?.records ?? []);
    const seen = new Set<number>();
    return all.filter(item => {
      if (item.id == null || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  // 4. 触底加载
  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  // 5. FlatList 渲染
  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      data={records}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <XxxCard record={item} />}
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
  );
});
```

## 关键要点

1. **queryKey** 必须包含所有影响请求的参数（accountId、dateRange 等），条件变化时自动 refetch
2. **getNextPageParam** 使用后端返回的 `current` 和 `pages` 判断分页
3. **数据去重**：`useMemo` 合并所有页后按 `id` 去重
4. **FlatList 三态**：加载中(`ActivityIndicator`)、空状态(`EmptyState`)、底部(没有更多了)
5. **下拉刷新**：`onRefresh` + `refreshing`
6. **enabled 守卫**：必要参数未就绪时不触发请求
7. **数据保鲜策略**：
   - `placeholderData: keepPreviousData` — queryKey 变化时保留旧数据展示，后台静默刷新后无缝替换，避免中间出现空白/loading
   - `refetchOnMount: 'always'` — 每次组件重新挂载（如页面返回）都后台刷新最新数据，同时缓存的旧数据立即展示
8. **ListHeaderComponent 间距**：`ListHeaderComponent` 需要底部 `pb-xl` 间距，与列表第一项保持 `gap-xl` 的视觉间隔

## 分页接口约定

```ts
// 请求参数
type PageParam = { current: number; size: number }  // current 从 1 开始

// 返回结构
type PageResult<T> = {
  total: number;    // 总记录数
  size: number;     // 每页数量
  pages: number;    // 总页数
  current: number;  // 当前页
  records: T[];     // 列表数据
}
```

## Context 穿透筛选条件

父页面通过 Context 向 Tab 内子列表传递账户和日期筛选：

```tsx
interface BillsScreenContextProps {
  selectedAccount: User.AccountItem;
  setSelectedAccount: (account: User.AccountItem) => void;
  dateRange: DateRange;
}
const BillsScreenContext = createContext<BillsScreenContextProps>({} as BillsScreenContextProps);
export function useBillsScreenContext() { return useContext(BillsScreenContext); }
```

## 常用工具函数

- `BNumber.toFormatNumber(value, { unit, volScale })` — 格式化数字金额
- `renderFallback(value)` — 空值时显示 `-`
- `getAccountSynopsisByLng(synopsis)` — 获取账户类型缩写
- `<EmptyState message={...} />` — 空状态组件
## 参考实现

- `apps/mobile/src/pages/(protected)/(assets)/bills/_comps/transfer-list.tsx`