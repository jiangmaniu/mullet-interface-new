# Trade Tab 页面重构设计文档

**日期**：2026-03-30
**涉及文件**：`apps/mobile/src/pages/(protected)/(tabs)/trade/`

---

## 目标

移除 `CollapsibleTab`（`react-native-collapsible-tab-view`），改为：

1. `TradeHeader` 固定顶部，其余内容页面级滚动
2. TabBar 独立，样式复用 `collapsible-tab.tsx` 内置 variants，滚动时吸顶
3. 两个列表（持仓/挂单）用 React 19 `<Activity>` 保留渲染缓存，基于 `activeTab` 控制显隐
4. 下拉刷新统一由页面控制，子组件通过 `TradeRefreshContext` 注册刷新函数

---

## 布局结构

```
<View style="flex:1">
  │
  ├── <TradeHeader />                         ← 普通流，固定在顶部，不参与滚动，含 SafeAreaView
  │
  └── <View style="flex:1">                   ← 撑满剩余空间
        <KeyboardAwareScrollView              ← 页面级滚动 + 键盘处理 + 下拉刷新
          refreshControl={<RefreshControl />}
          stickyHeaderIndices={[1]}           ← TabBar 吸顶（索引 1）
        >
          {/* 索引 0：Header 内容区（随页面滚动） */}
          <View>
            <SymbolChartView />
            <AccountCard />
            <OrderPanel />                    ← 含 input，键盘弹起时 ScrollView 自动滚到聚焦处
          </View>

          {/* 索引 1：TabBar（吸顶目标） */}
          <TradeTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            positionCount={positionCount}
            orderCount={orderCount}
            onRecordsPress={...}
          />

          {/* 索引 2：列表区 */}
          {/* minHeight = screenHeight - tradeHeaderHeight - tabBarHeight */}
          {/* 保证列表区始终撑满剩余屏幕，不受 SymbolChartView 显隐等动态内容影响 */}
          {/* tradeHeaderHeight / tabBarHeight 均通过 onLayout 测量 */}
          <View style={{ minHeight: screenHeight - tradeHeaderHeight - tabBarHeight }}>
            <Activity mode={activeTab === 'positions' ? 'visible' : 'hidden'}>
              <TradePositions />              ← FlatList scrollEnabled={false}
            </Activity>
            <Activity mode={activeTab === 'orders' ? 'visible' : 'hidden'}>
              <TradePendingOrders />          ← FlatList scrollEnabled={false}
            </Activity>
          </View>
        </KeyboardAwareScrollView>
      </View>
```

---

## TradeRefreshContext

统一管理下拉刷新，支持任意层级子组件注册刷新函数。

```ts
// _context/trade-refresh-context.tsx

type TradeRefreshContextType = {
  registerRefresh: (fn: () => Promise<void>) => () => void
}

export const TradeRefreshContext = createContext<TradeRefreshContextType>({
  registerRefresh: () => () => {},
})

export function useTradeRefresh() {
  return useContext(TradeRefreshContext)
}
```

**Trade 页面提供 Provider：**

```ts
const refreshFnsRef = useRef<Array<() => Promise<void>>>([])
const [refreshing, setRefreshing] = useState(false)

const registerRefresh = useCallback((fn: () => Promise<void>) => {
  refreshFnsRef.current.push(fn)
  // 返回注销函数，组件卸载时自动移除
  return () => {
    refreshFnsRef.current = refreshFnsRef.current.filter(f => f !== fn)
  }
}, [])

const handleRefresh = async () => {
  setRefreshing(true)
  try {
    await Promise.all(refreshFnsRef.current.map(fn => fn()))
  } finally {
    setRefreshing(false)
  }
}

// JSX
<TradeRefreshContext.Provider value={{ registerRefresh }}>
  {/* ... */}
</TradeRefreshContext.Provider>
```

**子组件注册：**

```ts
// TradePositions
const { registerRefresh } = useTradeRefresh()

useEffect(() => {
  return registerRefresh(async () => {
    await useRootStore.getState().trade.position.fetch()
  })
}, [])
```

---

## TradeTabBar 组件

抽取为独立组件，复用 `collapsible-tab.tsx` 导出的 variants。

```tsx
// _comps/trade-tab-bar.tsx

import { tabBarVariants, tabItemVariants, tabTextVariants } from '@/components/ui/collapsible-tab'

interface TradeTabBarProps {
  activeTab: 'positions' | 'orders'
  onTabChange: (tab: 'positions' | 'orders') => void
  positionCount: number
  orderCount: number
  onRecordsPress: () => void
}
```

- variant: `underline`，size: `md`
- 指示器：`border-b-2 border-brand-primary`，通过 `activeTab` 条件控制
- 右侧历史按钮 `IconifyPage` 保持不变

---

## 列表组件改动

### TradePositions

- 移除内部 `refreshing` state 和 `onRefresh` 处理
- `FlatList` 加 `scrollEnabled={false}`
- `useEffect` 中通过 `useTradeRefresh().registerRefresh` 注册 fetch 函数
- 初始加载逻辑保持不变（`useEffect` 监听 `currentAccountId`）

### TradePendingOrders

- 同上

---

## 键盘处理

使用已安装的 `react-native-keyboard-aware-scroll-view`：

- `KeyboardAwareScrollView` 监听键盘事件，自动将聚焦的 TextInput 滚动到键盘上方
- 不再需要 `KeyboardAvoidView` 的 `translateY` 方案
- `extraScrollHeight` 设为适当值（如 `20`）保证 input 和键盘之间有间距

---

## 改动文件清单

| 文件 | 类型 | 改动说明 |
|---|---|---|
| `trade/index.tsx` | 修改 | 全量重构，移除 CollapsibleTab，引入新布局 |
| `trade/_context/trade-refresh-context.tsx` | 新建 | TradeRefreshContext 定义 |
| `trade/_comps/trade-tab-bar.tsx` | 新建 | 独立 TabBar 组件 |
| `trade/_comps/records/positions/index.tsx` | 修改 | 注册刷新、FlatList scrollEnabled={false} |
| `trade/_comps/records/pending-orders/index.tsx` | 修改 | 同上 |

---

## 不改动

- `collapsible-tab.tsx`：只读取其导出的 variants，不修改
- `KeyboardAvoidView`：不再使用，但不删除（其他页面可能用到）
- `TradeHeader`：不需要 `absolute`，普通流布局，内部逻辑不变
- `SymbolChartView`、`AccountCard`、`OrderPanel`：内部逻辑不变
