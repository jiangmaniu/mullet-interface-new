# Trade Tab 页面重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除 `CollapsibleTab`，改为页面级滚动 + TabBar 吸顶 + `<Activity>` 列表缓存 + Context 统一下拉刷新。

**Architecture:** `TradeHeader` 固定顶部普通流，下方 `flex:1` 区域用 `KeyboardAwareScrollView` 承载所有滚动内容；TabBar 通过 `stickyHeaderIndices` 吸顶；两个列表用 React 19 `<Activity>` 同时挂载，按 `activeTab` 切换显隐；`TradeRefreshContext` 提供 `registerRefresh`，任意层级子组件可注册异步刷新函数，下拉时 `Promise.all` 并行执行。

**Tech Stack:** React 19.2 `<Activity>`，`react-native-keyboard-aware-scroll-view`，`tabBarVariants/tabItemVariants/tabTextVariants`（来自 `collapsible-tab.tsx`），Zustand，TypeScript

---

## 文件结构

| 路径 | 操作 | 说明 |
|---|---|---|
| `apps/mobile/src/pages/(protected)/(tabs)/trade/_context/trade-refresh-context.tsx` | 新建 | Context + hook 定义 |
| `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/trade-tab-bar.tsx` | 新建 | 独立 TabBar 组件 |
| `apps/mobile/src/pages/(protected)/(tabs)/trade/index.tsx` | 修改 | 整页重构 |
| `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/records/positions/index.tsx` | 修改 | 注册刷新 + scrollEnabled={false} |
| `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/records/pending-orders/index.tsx` | 修改 | 注册刷新 + scrollEnabled={false} |

---

## Task 1: 新建 TradeRefreshContext

**Files:**
- Create: `apps/mobile/src/pages/(protected)/(tabs)/trade/_context/trade-refresh-context.tsx`

- [ ] **Step 1: 创建 Context 文件**

```tsx
import { createContext, useContext } from 'react'

type TradeRefreshContextType = {
  registerRefresh: (fn: () => Promise<void>) => () => void
}

export const TradeRefreshContext = createContext<TradeRefreshContextType>({
  // 默认空实现，防止在 Provider 外使用时报错
  registerRefresh: () => () => {},
})

export function useTradeRefresh() {
  return useContext(TradeRefreshContext)
}
```

- [ ] **Step 2: 确认文件创建成功**

```bash
ls apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/_context/
```

期望输出：`trade-refresh-context.tsx`

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/_context/trade-refresh-context.tsx
git commit -m "feat(trade): add TradeRefreshContext for unified pull-to-refresh"
```

---

## Task 2: 新建 TradeTabBar 组件

**Files:**
- Create: `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/trade-tab-bar.tsx`

该组件复用 `collapsible-tab.tsx` 导出的 `tabBarVariants / tabItemVariants / tabTextVariants`，不依赖 `react-native-collapsible-tab-view`。

- [ ] **Step 1: 创建 TradeTabBar 文件**

```tsx
import { Pressable, View } from 'react-native'
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated'

import { IconButton } from '@/components/ui/button'
import { tabBarVariants, tabItemVariants, tabTextVariants } from '@/components/ui/collapsible-tab'
import { IconifyPage } from '@/components/ui/icons'
import { useThemeColors } from '@/hooks/use-theme-colors'
import { cn } from '@/lib/utils'

export type TradeTab = 'positions' | 'orders'

interface TradeTabBarProps {
  activeTab: TradeTab
  onTabChange: (tab: TradeTab) => void
  positionCount: number
  orderCount: number
  onRecordsPress: () => void
  onLayout?: (height: number) => void
}

interface TabItemProps {
  label: string
  isActive: boolean
  onPress: () => void
}

const TabItem = ({ label, isActive, onPress }: TabItemProps) => {
  const { textColorContent1, textColorContent4 } = useThemeColors()
  // 用 sharedValue 驱动文字颜色透明度，与 collapsible-tab.tsx 保持一致
  const activeValue = useSharedValue(isActive ? 0 : 1)
  activeValue.value = isActive ? 0 : 1

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(activeValue.value, [0, 1], [1, 0.45]),
  }))

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        tabItemVariants({ variant: 'underline', size: 'md', selected: false }),
        'flex-1',
        isActive && 'border-b-2 border-brand-primary',
      )}
    >
      <Animated.Text
        className={cn(tabTextVariants({ variant: 'underline', size: 'md', selected: false }))}
        style={[{ color: textColorContent1 }, animatedStyle]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  )
}

export function TradeTabBar({
  activeTab,
  onTabChange,
  positionCount,
  orderCount,
  onRecordsPress,
  onLayout,
}: TradeTabBarProps) {
  return (
    <View
      className={cn(tabBarVariants({ variant: 'underline', size: 'md' }), 'px-xl bg-secondary')}
      onLayout={onLayout ? (e) => onLayout(e.nativeEvent.layout.height) : undefined}
    >
      <TabItem
        label={`持仓(${positionCount})`}
        isActive={activeTab === 'positions'}
        onPress={() => onTabChange('positions')}
      />
      <TabItem
        label={`挂单(${orderCount})`}
        isActive={activeTab === 'orders'}
        onPress={() => onTabChange('orders')}
      />
      <IconButton onPress={onRecordsPress}>
        <IconifyPage width={22} height={22} />
      </IconButton>
    </View>
  )
}
```

> 注意：TabBar 需要 `bg-secondary` 背景色，否则吸顶时会透明露出下方内容。

- [ ] **Step 2: 确认文件创建成功**

```bash
ls apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/_comps/trade-tab-bar.tsx
```

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/_comps/trade-tab-bar.tsx
git commit -m "feat(trade): add TradeTabBar component with sticky support"
```

---

## Task 3: 改造 TradePositions

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/records/positions/index.tsx`

移除内部 `refreshing` state 和 `onRefresh`，通过 `useTradeRefresh` 注册刷新函数，FlatList 加 `scrollEnabled={false}`。

- [ ] **Step 1: 修改文件顶部 import，新增 useTradeRefresh**

在现有 import 列表中新增：

```tsx
import { useTradeRefresh } from '../../_context/trade-refresh-context'
```

- [ ] **Step 2: 替换 TradePositions 组件实现**

将 `TradePositions` 组件（第 44-97 行）替换为：

```tsx
export const TradePositions = () => {
  const positionIdList = useRootStore(useShallow(tradePositionIdListSelector))
  const currentAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const { registerRefresh } = useTradeRefresh()

  // 初始加载
  useEffect(() => {
    if (!currentAccountId) return
    useRootStore
      .getState()
      .trade.position.fetch()
      .catch(() => {})
  }, [currentAccountId])

  // 注册下拉刷新回调，组件卸载时自动注销
  useEffect(() => {
    return registerRefresh(async () => {
      await useRootStore.getState().trade.position.fetch()
    })
  }, [registerRefresh])

  const renderEmpty = () => (
    <View className="items-center py-[60px]">
      <EmptyState message={<Trans>暂无仓位记录</Trans>} />
    </View>
  )

  return (
    <FlatList
      className="flex-1"
      scrollEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      data={positionIdList}
      keyExtractor={(id) => id}
      renderItem={({ item: id }) => <PositionItemById id={id} />}
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListEmptyComponent={renderEmpty}
      style={{ paddingTop: 16 }}
    />
  )
}
```

> 移除了 `refreshing` state、`refetch` 函数、`onRefresh`、`onEndReachedThreshold`，`ActivityIndicator` loading 态也随之移除（下拉 loading 由外层 RefreshControl 统一显示）。同时移除顶部 `useState` import 中的 `useState`（如果 `useState` 只用于 `refreshing`）。

- [ ] **Step 3: 清理不再使用的 import**

检查并移除以下不再使用的 import：
- `useState`（如无其他用途）
- `ActivityIndicator`（已无 loading 态）
- `CollapsibleFlatList`（改用普通 `FlatList`）

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/_comps/records/positions/index.tsx
git commit -m "refactor(trade): TradePositions use context refresh, scrollEnabled=false"
```

---

## Task 4: 改造 TradePendingOrders

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/records/pending-orders/index.tsx`

与 Task 3 同理。

- [ ] **Step 1: 新增 useTradeRefresh import**

```tsx
import { useTradeRefresh } from '../../_context/trade-refresh-context'
```

- [ ] **Step 2: 替换 TradePendingOrders 组件实现**

将 `TradePendingOrders` 组件（第 36-87 行）替换为：

```tsx
export const TradePendingOrders = () => {
  const { user } = useStores()
  const orderIdList = useRootStore(useShallow(tradeOrderIdListSelector))
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const { registerRefresh } = useTradeRefresh()

  // 初始加载
  useEffect(() => {
    if (!activeTradeAccountId) return
    useRootStore.getState().trade.order.fetch()
  }, [activeTradeAccountId])

  // 注册下拉刷新回调，组件卸载时自动注销
  useEffect(() => {
    return registerRefresh(async () => {
      await Promise.all([
        user.fetchUserInfo(true),
        useRootStore.getState().user.info.fetchLoginClientInfo(),
        useRootStore.getState().trade.order.fetch(),
      ])
    })
  }, [registerRefresh, user])

  const renderEmpty = () => (
    <View className="items-center py-[60px]">
      <EmptyState message={<Trans>暂无委托记录</Trans>} />
    </View>
  )

  return (
    <FlatList
      className="flex-1"
      scrollEnabled={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      data={orderIdList}
      keyExtractor={(id) => id}
      renderItem={({ item: id }) => <PendingOrderItemById id={id} />}
      ItemSeparatorComponent={() => <View className="h-xl" />}
      ListEmptyComponent={renderEmpty}
      style={{ paddingTop: 16 }}
    />
  )
}
```

- [ ] **Step 3: 清理不再使用的 import**

检查并移除：
- `useState`（如无其他用途）
- `ActivityIndicator`
- `CollapsibleFlatList`

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/_comps/records/pending-orders/index.tsx
git commit -m "refactor(trade): TradePendingOrders use context refresh, scrollEnabled=false"
```

---

## Task 5: 重构 trade/index.tsx

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/trade/index.tsx`

这是核心改动，整页重构。

- [ ] **Step 1: 将 index.tsx 完整替换为以下内容**

```tsx
import { Activity } from 'react'
import { Dimensions, RefreshControl, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useAppState } from '@/hooks/use-app-state'
import { useI18n } from '@/hooks/use-i18n'
import { useRootStore } from '@/stores'
import { tradeActiveTradeSymbolSelector } from '@/stores/trade-slice'
import { tradeOrderCountSelector } from '@/stores/trade-slice/order-slice'
import { tradePositionCountSelector } from '@/stores/trade-slice/position-slice'
import { userInfoActiveTradeAccountIdSelector } from '@/stores/user-slice/infoSlice'
import { useStores } from '@/v1/provider/mobxProvider'

import { AccountCard } from './_comps/account-card'
import { TradeHeader } from './_comps/header'
import { OrderPanel } from './_comps/order-panel'
import { TradePendingOrders } from './_comps/records/pending-orders'
import { TradePositions } from './_comps/records/positions'
import { SymbolChartView } from './_comps/symbol-chart-view'
import { TradeTab, TradeTabBar } from './_comps/trade-tab-bar'
import { TradeRefreshContext } from './_context/trade-refresh-context'

const { height: screenHeight } = Dimensions.get('window')

const Trade = () => {
  const router = useRouter()
  const { user } = useStores()
  const activeSymbol = useRootStore(tradeActiveTradeSymbolSelector)
  const activeTradeAccountId = useRootStore(userInfoActiveTradeAccountIdSelector)
  const positionCount = useRootStore(tradePositionCountSelector)
  const orderCount = useRootStore(tradeOrderCountSelector)
  const chartPosition = useRootStore((state) => state.trade.setting.chartPosition)

  const [activeTab, setActiveTab] = useState<TradeTab>('positions')
  const [isChartVisible, setIsChartVisible] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 测量固定元素高度，用于计算列表区 minHeight
  const [tradeHeaderHeight, setTradeHeaderHeight] = useState(0)
  const [tabBarHeight, setTabBarHeight] = useState(0)

  // 下拉刷新函数注册表
  const refreshFnsRef = useRef<Array<() => Promise<void>>>([])

  const registerRefresh = useCallback((fn: () => Promise<void>) => {
    refreshFnsRef.current.push(fn)
    return () => {
      refreshFnsRef.current = refreshFnsRef.current.filter((f) => f !== fn)
    }
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all(refreshFnsRef.current.map((fn) => fn()))
    } finally {
      setRefreshing(false)
    }
  }

  const initData = async () => {
    await Promise.all([useRootStore.getState().user.info.fetchLoginClientInfo(), user.fetchUserInfo(true)])
    await Promise.all([useRootStore.getState().trade.position.fetch(), useRootStore.getState().trade.order.fetch()])
  }

  useEffect(() => {
    if (!activeTradeAccountId) return
    initData()
  }, [activeTradeAccountId])

  useAppState({
    onForeground: () => {
      initData()
    },
  })

  // 列表区最小高度 = 屏幕高度 - TradeHeader 高度 - TabBar 高度
  // 保证列表区始终撑满剩余屏幕，不受 SymbolChartView 显隐等动态内容影响
  const listMinHeight = screenHeight - tradeHeaderHeight - tabBarHeight

  return (
    <TradeRefreshContext.Provider value={{ registerRefresh }}>
      <View className="flex-1">
        {/* TradeHeader 普通流，固定顶部，不参与 ScrollView 滚动 */}
        <View onLayout={(e) => setTradeHeaderHeight(e.nativeEvent.layout.height)}>
          <TradeHeader symbol={activeSymbol} />
        </View>

        {/* 滚动区域 */}
        <View className="flex-1">
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={20}
            enableOnAndroid
            stickyHeaderIndices={[1]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {/* 索引 0：内容区（随页面滚动） */}
            <View>
              {chartPosition !== 'bottom' && (
                <SymbolChartView isVisible={isChartVisible} onToggle={setIsChartVisible} />
              )}
              <View className="pt-xl px-xl">
                <AccountCard />
              </View>
              <OrderPanel />
            </View>

            {/* 索引 1：TabBar 吸顶 */}
            <TradeTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              positionCount={positionCount}
              orderCount={orderCount}
              onRecordsPress={() => router.push('/(trade)/records')}
              onLayout={setTabBarHeight}
            />

            {/* 索引 2：列表区，minHeight 保证撑满剩余屏幕 */}
            <View style={{ minHeight: listMinHeight }}>
              <Activity mode={activeTab === 'positions' ? 'visible' : 'hidden'}>
                <TradePositions />
              </Activity>
              <Activity mode={activeTab === 'orders' ? 'visible' : 'hidden'}>
                <TradePendingOrders />
              </Activity>
            </View>
          </KeyboardAwareScrollView>
        </View>

        {/* K 线图底部固定模式 */}
        {chartPosition === 'bottom' && (
          <View className="absolute right-0 bottom-0 left-0 z-10">
            <SymbolChartView />
          </View>
        )}
      </View>
    </TradeRefreshContext.Provider>
  )
}

export default Trade
```

- [ ] **Step 2: 确认 TypeScript 无报错**

```bash
cd apps/mobile && npx tsc --noEmit 2>&1 | grep -A3 "trade/index"
```

期望：无输出（无报错）

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/index.tsx
git commit -m "refactor(trade): replace CollapsibleTab with KeyboardAwareScrollView + Activity"
```

---

## Task 6: 验证整体

- [ ] **Step 1: 全量 TypeScript 检查**

```bash
cd apps/mobile && npx tsc --noEmit 2>&1 | grep -E "error TS|trade/"
```

期望：无报错

- [ ] **Step 2: 检查 collapsible-tab-view 依赖是否残留**

```bash
grep -r "collapsible-tab-view\|CollapsibleTab\|CollapsibleTabScene\|CollapsibleFlatList\|CollapsibleStickyHeader\|CollapsibleStickyContent\|CollapsibleStickyNavBar" \
  apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/ --include="*.tsx"
```

期望：无输出（trade 目录下已无该依赖）

- [ ] **Step 3: 检查 Activity import 正确**

```bash
grep "from 'react'" apps/mobile/src/pages/\(protected\)/\(tabs\)/trade/index.tsx
```

期望包含：`import { Activity } from 'react'`

- [ ] **Step 4: 最终 Commit**

```bash
git add -A
git commit -m "chore(trade): verify refactor complete, no collapsible-tab-view dependency in trade page"
```
