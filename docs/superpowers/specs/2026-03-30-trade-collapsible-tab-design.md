# Trade 页面 Collapsible Tab 改造设计文档

## 概述

将 trade 页面的 tabs 交互改造为使用 `@mstfmedeni/collapsible-tab-view` 实现，支持头部折叠、键盘避让、手势处理、懒加载等功能。

**设计原则**：
- 新增组件，不影响原有代码
- 仅替换 trade 页面的业务使用层
- 复用现有样式和工具函数
- 保证性能和用户体验

---

## 需求清单

### 功能需求

1. **头部折叠**：支持头部内容（K线图、账户卡、下单面板）完全折叠隐藏
2. **键盘避让**：键盘弹起时，自动滚动使输入框位于键盘上方，头部完全折叠
3. **手势处理**：根据手势方向判断 - 水平滑动给 K 线图，垂直滚动给页面
4. **Tab 切换**：支持点击和滑动切换 tabs
5. **懒加载**：Tab 内容懒加载，提升性能
6. **下拉刷新**：支持持仓列表和挂单列表下拉刷新
7. **列表扩展**：设计通用接口，支持未来扩展其他列表组件
8. **样式复用**：复用现有 tabs 样式（underline variant）

### 非功能需求

1. **性能**：列表渲染流畅，无卡顿（60fps）
2. **兼容性**：不影响其他页面使用现有组件
3. **可维护性**：代码清晰，易于扩展
4. **稳定性**：手势冲突处理完善，无崩溃

---

## 架构设计

### 整体架构

```
apps/mobile/src/
├── components/ui/
│   ├── collapsible-tab.tsx              # 现有组件（保持不变）
│   └── trade-collapsible-tab.tsx        # 新增：trade 专用组件
│
└── pages/(protected)/(tabs)/trade/
    ├── index.tsx                         # 修改：使用新组件
    └── _comps/
        └── records/
            ├── positions/index.tsx       # 修改：使用新列表组件
            └── pending-orders/index.tsx  # 修改：使用新列表组件
```

### 组件层次结构

```
TradeCollapsibleTab (容器)
├── Header (可折叠头部)
│   ├── TradeHeader (导航栏)
│   ├── SymbolChartView (K线图 - 支持手势)
│   ├── AccountCard (账户卡)
│   └── OrderPanel (下单面板 - 支持键盘避让)
│
└── Tabs (标签页)
    ├── Tab: 持仓 (TradeCollapsibleFlatList)
    └── Tab: 挂单 (TradeCollapsibleFlatList)
```

### 核心组件

1. **TradeCollapsibleTab**：主容器，封装 `@mstfmedeni/collapsible-tab-view`
2. **TradeCollapsibleFlatList**：列表组件，支持下拉刷新和懒加载
3. **TradeCollapsibleScrollView**：滚动视图组件（预留扩展）
4. **TradeCollapsibleHeader**：可折叠头部容器
5. **TradeCollapsibleTabScene**：单个 Tab 场景

---

## 组件 API 设计

### 1. TradeCollapsibleTab（主容器）

```typescript
interface TradeCollapsibleTabProps {
  // 样式相关
  variant?: 'solid' | 'outline' | 'underline' | 'text'
  size?: 'sm' | 'md' | 'lg'
  tabBarClassName?: string

  // 头部相关
  renderHeader: () => React.ReactNode
  headerHeight?: number  // 头部初始高度

  // TabBar 扩展
  renderTabBarRight?: () => React.ReactNode

  // 手势配置
  swipeEnabled?: boolean  // 是否支持滑动切换 tab

  // 子组件
  children: React.ReactNode
}
```

**使用示例**：
```tsx
<TradeCollapsibleTab
  variant="underline"
  size="md"
  renderHeader={() => <TradeHeader />}
  renderTabBarRight={() => <IconButton />}
>
  <TradeCollapsibleTabScene name="positions" label="持仓(2)">
    <TradePositions />
  </TradeCollapsibleTabScene>
</TradeCollapsibleTab>
```

### 2. TradeCollapsibleFlatList（列表组件）

```typescript
interface TradeCollapsibleFlatListProps<T> extends FlatListProps<T> {
  // 继承 FlatList 所有 props

  // 下拉刷新
  refreshing?: boolean
  onRefresh?: () => void

  // 懒加载
  onEndReached?: () => void
  onEndReachedThreshold?: number

  // 性能优化
  keyExtractor: (item: T, index: number) => string
  getItemLayout?: (data: T[] | null, index: number) => {
    length: number
    offset: number
    index: number
  }
}
```

### 3. TradeCollapsibleHeader（可折叠头部）

```typescript
interface TradeCollapsibleHeaderProps {
  children: React.ReactNode

  // 键盘避让配置
  keyboardAvoidEnabled?: boolean
  keyboardAvoidMaxOffset?: number

  // 手势配置
  gestureEnabled?: boolean
  gestureDirection?: 'vertical' | 'horizontal' | 'both'
}
```

**使用示例**：
```tsx
<TradeCollapsibleHeader
  keyboardAvoidEnabled={true}
  keyboardAvoidMaxOffset={topBannerHeight}
  gestureDirection="vertical"
>
  <SymbolChartView />
  <AccountCard />
  <OrderPanel />
</TradeCollapsibleHeader>
```

### 4. TradeCollapsibleTabScene（Tab 场景）

```typescript
interface TradeCollapsibleTabSceneProps {
  name: string
  label: string
  lazy?: boolean  // 懒加载
  children: React.ReactNode
}
```

### 5. 扩展接口（未来支持其他列表组件）

```typescript
// 通用列表组件接口
interface TradeCollapsibleListComponent {
  scrollToTop: () => void
  refresh: () => Promise<void>
}

// 未来可以添加
// - TradeCollapsibleScrollView
// - TradeCollapsibleSectionList
// - TradeCollapsibleMasonryList
```

---

## 手势处理设计

### 手势冲突解决方案

**问题**：WebView K 线图的手势（缩放、平移）与页面滚动手势冲突

**解决方案**：使用 `react-native-gesture-handler` 的手势方向判断

```typescript
// 手势处理逻辑
const gestureHandler = Gesture.Pan()
  .activeOffsetY([-10, 10])      // 垂直移动 >10px 激活页面滚动
  .failOffsetX([-10, 10])        // 水平移动 >10px 失败，交给 WebView
  .simultaneousWithExternalGesture(webViewGesture)
```

**实现细节**：
1. **垂直滑动**：触发页面滚动和头部折叠
2. **水平滑动**：交给 WebView 处理 K 线图平移
3. **双指缩放**：完全交给 WebView 处理
4. **点击**：交给 WebView 处理十字线等交互

**WebView 容器配置**：
```tsx
<View
  onStartShouldSetResponder={() => true}
  onMoveShouldSetResponder={(e) => {
    // 判断手势方向
    const { dx, dy } = e.nativeEvent
    return Math.abs(dx) > Math.abs(dy) // 水平优先
  }}
>
  <WebView />
</View>
```

### 手势优先级

```
优先级从高到低：
1. WebView 内部手势（水平滑动、缩放）
2. Tab 切换手势（水平滑动）
3. 页面滚动手势（垂直滑动）
4. 头部折叠手势（垂直滑动）
```

**冲突处理**：
- 使用 `simultaneousWithExternalGesture` 允许同时识别
- 使用 `activeOffsetX/Y` 和 `failOffsetX/Y` 判断方向
- WebView 区域优先处理水平手势
- 其他区域优先处理垂直手势

---

## 键盘处理设计

### 键盘避让方案

**需求**：键盘弹起时，输入框位于键盘上方，头部完全折叠

**实现方案**：

```typescript
// 1. 监听键盘事件
const keyboardHeight = useSharedValue(0)

useEffect(() => {
  const showListener = Keyboard.addListener('keyboardWillShow', (e) => {
    keyboardHeight.value = e.endCoordinates.height
    // 自动滚动到输入框位置
    scrollToInput()
  })

  const hideListener = Keyboard.addListener('keyboardWillHide', () => {
    keyboardHeight.value = 0
  })

  return () => {
    showListener.remove()
    hideListener.remove()
  }
}, [])

// 2. 计算滚动偏移量
const scrollToInput = () => {
  const inputY = inputRef.current?.measureLayout()
  const targetScrollY = inputY - keyboardHeight.value + headerHeight
  scrollTo(targetScrollY)
}
```

**关键点**：
- 使用 `KeyboardAvoidingView` 配合 `maxOffset={headerHeight}`
- 输入框获得焦点时，自动滚动使其位于键盘上方
- 头部完全折叠，最大化输入区域空间
- 键盘收起时，恢复原始滚动位置

---

## 样式复用设计

### 复用现有样式变量

```typescript
// 从现有组件导入样式
import {
  tabBarVariants,
  tabItemVariants,
  tabTextVariants
} from '@/components/ui/collapsible-tab'

// 在新组件中使用
const TradeCollapsibleTab = ({ variant, size, ... }) => {
  const tabBarClass = tabBarVariants({ variant, size })
  const tabItemClass = tabItemVariants({ variant, size, selected })

  return (
    <Tabs.Container
      tabBarStyle={useResolveClassNames(tabBarClass)}
      // ...
    />
  )
}
```

### 样式映射

- `variant`: 'underline' → 底部指示器样式
- `size`: 'md' → 高度 40px，padding 适配
- `tabBarClassName`: 自定义样式扩展（如 `px-xl`）

### 主题适配

```typescript
const {
  colorBrandPrimary,      // 指示器颜色
  textColorContent1,      // 激活文字颜色
  textColorContent4,      // 未激活文字颜色
  backgroundColorSecondary // 背景色
} = useThemeColors()
```

---

## 性能优化设计

### 列表性能优化

```typescript
// 1. 按 ID 精准订阅（已有模式）
const PositionItemById = ({ id }: { id: string }) => {
  const position = useRootStore(createPositionItemSelector(id))
  return position ? <PositionItem position={position} /> : null
}

// 2. React.memo 优化
const PositionItem = React.memo(({ position }) => {
  // ...
}, (prev, next) => {
  // 自定义比较逻辑
  return prev.position.id === next.position.id &&
         prev.position.pnl === next.position.pnl
})

// 3. getItemLayout 优化（如果高度固定）
const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
})

// 4. keyExtractor 稳定性
keyExtractor={(id) => id}  // 使用 ID 而非 index
```

### 渲染性能优化

```typescript
// 1. 使用 useDerivedValue 缓存计算
const scrollProgress = useDerivedValue(() => {
  return scrollY.value / headerHeight
})

// 2. 减少 useAnimatedStyle 调用
const headerStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: -scrollY.value }],
  opacity: 1 - scrollProgress.value
}))

// 3. 懒加载 Tab 内容
<TradeCollapsibleTabScene name="positions" lazy={true}>
  <TradePositions />
</TradeCollapsibleTabScene>
```

### 手势性能优化

```typescript
// 1. 使用 worklet 标记
const panGesture = Gesture.Pan()
  .onUpdate((e) => {
    'worklet'  // 在 UI 线程执行
    scrollY.value = e.translationY
  })

// 2. 减少桥接调用
const scrollTo = useCallback((offset) => {
  'worklet'
  scrollY.value = withSpring(offset, {
    damping: 20,
    stiffness: 90,
  })
}, [])
```

### 内存优化

```typescript
// 1. 清理监听器
useEffect(() => {
  const listener = Keyboard.addListener('keyboardWillShow', handler)
  return () => listener.remove()
}, [])

// 2. 取消动画
useEffect(() => {
  return () => {
    cancelAnimation(scrollY)
  }
}, [])

// 3. 限制列表渲染数量
<TradeCollapsibleFlatList
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## 数据流设计

### 整体数据流

```
用户操作 → 手势识别 → 滚动控制 → 头部折叠 → 列表更新
                ↓
         键盘事件 → 自动滚动 → 输入框可见
                ↓
         Tab 切换 → 懒加载 → 列表渲染
                ↓
         下拉刷新 → 数据获取 → 状态更新
```

### 状态管理

```typescript
// 1. 滚动状态（Reanimated Shared Value）
const scrollY = useSharedValue(0)
const headerHeight = useSharedValue(0)

// 2. 键盘状态
const [keyboardVisible, setKeyboardVisible] = useState(false)
const [keyboardHeight, setKeyboardHeight] = useState(0)

// 3. Tab 状态
const [activeTab, setActiveTab] = useState('positions')

// 4. 列表数据（Zustand Store）
const positionIdList = useRootStore(useShallow(tradePositionIdListSelector))
const orderIdList = useRootStore(useShallow(tradeOrderIdListSelector))
```

---

## 错误处理设计

### 手势冲突处理

```typescript
// 降级策略
const gestureHandler = Gesture.Pan()
  .onError((error) => {
    console.warn('Gesture error:', error)
    // 回退到默认滚动行为
  })
```

### 键盘避让失败处理

```typescript
// 回退到固定偏移量
const scrollToInput = () => {
  try {
    const inputY = inputRef.current?.measureLayout()
    const targetScrollY = inputY - keyboardHeight + headerHeight
    scrollTo(targetScrollY)
  } catch (error) {
    // 回退：使用固定偏移量
    scrollTo(headerHeight)
  }
}
```

### 列表渲染错误处理

```typescript
// ErrorBoundary 包裹
<ErrorBoundary fallback={<ErrorView />}>
  <TradeCollapsibleFlatList />
</ErrorBoundary>
```

### 数据获取失败处理

```typescript
const onRefresh = async () => {
  try {
    setRefreshing(true)
    await fetchData()
  } catch (error) {
    toast.error('刷新失败，请重试')
  } finally {
    setRefreshing(false)
  }
}
```

---

## 实施计划概要

### 阶段 1：基础组件开发
1. 安装 `@mstfmedeni/collapsible-tab-view` 依赖
2. 创建 `trade-collapsible-tab.tsx` 组件
3. 实现基础 Tab 容器和列表组件
4. 复用现有样式变量

### 阶段 2：手势和键盘处理
1. 实现手势方向判断逻辑
2. 集成键盘避让功能
3. 处理 WebView 手势冲突
4. 测试各种手势场景

### 阶段 3：性能优化
1. 实现列表性能优化（memo、getItemLayout）
2. 优化动画性能（worklet、useDerivedValue）
3. 实现懒加载和下拉刷新
4. 内存优化和清理

### 阶段 4：集成和测试
1. 修改 trade 页面使用新组件
2. 修改持仓和挂单列表组件
3. 完整功能测试
4. 性能测试和优化

### 阶段 5：文档和收尾
1. 编写组件使用文档
2. 代码审查和优化
3. 提交 PR 和合并

---

## 技术栈

- **核心库**：`@mstfmedeni/collapsible-tab-view`
- **手势处理**：`react-native-gesture-handler`
- **动画**：`react-native-reanimated`
- **状态管理**：Zustand
- **样式**：NativeWind (Tailwind CSS)
- **列表组件**：React Native FlatList

---

## 风险和缓解措施

### 风险 1：手势冲突复杂

**缓解措施**：
- 使用成熟的手势库（react-native-gesture-handler）
- 充分测试各种手势场景
- 提供降级方案

### 风险 2：性能问题

**缓解措施**：
- 使用 React.memo 和精准订阅
- 使用 Reanimated worklet 在 UI 线程执行
- 限制列表渲染数量
- 性能监控和优化

### 风险 3：键盘避让不准确

**缓解措施**：
- 使用 KeyboardAvoidingView
- 提供固定偏移量回退方案
- 充分测试不同设备和键盘

### 风险 4：库兼容性问题

**缓解措施**：
- 选择活跃维护的库
- 充分测试兼容性
- 保留现有组件作为回退方案

---

## 成功标准

1. **功能完整性**：所有需求功能正常工作
2. **性能指标**：列表滚动 60fps，无卡顿
3. **兼容性**：不影响其他页面，现有组件正常工作
4. **用户体验**：手势流畅，键盘避让准确
5. **代码质量**：代码清晰，易于维护和扩展

---

## 附录

### 参考资料

- [@mstfmedeni/collapsible-tab-view 文档](https://www.npmjs.com/package/@mstfmedeni/collapsible-tab-view)
- [react-native-gesture-handler 文档](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-reanimated 文档](https://docs.swmansion.com/react-native-reanimated/)

### 相关文件

- `apps/mobile/src/components/ui/collapsible-tab.tsx` - 现有组件
- `apps/mobile/src/pages/(protected)/(tabs)/trade/index.tsx` - Trade 页面
- `apps/mobile/src/components/ui/keyboard-avoid-view.tsx` - 键盘避让组件

---

**文档版本**：1.0
**创建日期**：2026-03-30
**最后更新**：2026-03-30
