# 搜索页面重构设计文档

**日期：** 2026-03-06
**作者：** Claude Opus 4.6
**状态：** 已批准

## 概述

重构搜索页面，实现基于真实行情数据的品种搜索功能，支持字符级模糊匹配、权重排序和高亮显示。

## 需求分析

### 核心需求

1. **数据初始化**：页面初始化时调用接口更新 `trade.symbolListAll` 数据
2. **热门品种筛选**：基于 `HOT_SYMBOL_LIST` 配置，从 `symbolListAll` 中筛选热门品种（转小写匹配 Alias 字段）
3. **行情数据集成**：使用 `useGetCurrentQuoteCallback` 获取实时行情，显示价格和涨跌百分比
4. **智能搜索**：
   - 按空格拆分输入为单个字符
   - OR 逻辑匹配 symbol/alias/name 字段
   - 按匹配字符数量排序（权重高的优先）
5. **高亮显示**：在 symbol/alias/name 中高亮匹配的每个字符
6. **路由跳转**：点击品种跳转到 `/trade/[symbol]` 页面

### 用户体验需求

- 搜索输入防抖（300ms）
- 无搜索词时显示"热门品种"
- 有搜索词时显示"搜索结果"
- 搜索无结果时显示"暂无搜索内容"

## 架构设计

### 组件结构

```
SearchPage
├── 搜索头部
│   ├── Input（搜索输入框）
│   └── 取消按钮
├── 标题区
│   ├── 标题文本（热门品种/搜索结果）
│   └── 视图切换（市场视图/交易视图）
└── 列表区
    ├── SearchAssetRow（市场视图）
    │   ├── Avatar + Symbol/Name
    │   ├── 价格
    │   └── 涨跌百分比
    └── SearchAssetTradeRow（交易视图）
        ├── Avatar + Symbol/Name
        ├── 买价 + 最高价
        └── 卖价 + 最低价
```

### 数据流

```
页面初始化
  ↓
调用 stores.trade.getSymbolList()
  ↓
无搜索词 → 筛选热门品种
  ↓
有搜索词 → 字符拆分 → 匹配筛选 → 权重排序
  ↓
渲染列表（集成行情数据）
  ↓
点击品种 → 跳转 /trade/[symbol]
```

## 核心功能实现

### 1. 搜索筛选与排序

**字符拆分与匹配：**
```typescript
// 按空格拆分输入，过滤空字符
const searchChars = debouncedQuery.trim().split('').filter(c => c.trim())

// 计算匹配权重
const calculateMatchScore = (item: SymbolItem, chars: string[]) => {
  const searchText = `${item.symbol} ${item.alias} ${item.name}`.toLowerCase()
  return chars.filter(char => searchText.includes(char.toLowerCase())).length
}

// 筛选并排序
const filtered = symbolList
  .map(item => ({ item, score: calculateMatchScore(item, searchChars) }))
  .filter(({ score }) => score > 0)
  .sort((a, b) => b.score - a.score)
  .map(({ item }) => item)
```

**搜索示例：**
- 输入：`"BTC E"`
- 拆分：`['B', 'T', 'C', 'E']`
- 匹配结果：
  - BTC-USDC：匹配 3 个字符（B, T, C）→ 权重 3
  - ETH-USDC：匹配 2 个字符（E, T）→ 权重 2
  - SOL-USDC：匹配 0 个字符 → 不显示
- 排序：BTC-USDC > ETH-USDC

### 2. 高亮组件

**HighlightText 组件：**
```typescript
const HighlightText = ({ text, searchChars }: { text: string; searchChars: string[] }) => {
  return (
    <Text>
      {text.split('').map((char, index) => {
        const isMatch = searchChars.some(c => c.toLowerCase() === char.toLowerCase())
        return (
          <Text key={index} className={isMatch ? 'text-brand-default' : ''}>
            {char}
          </Text>
        )
      })}
    </Text>
  )
}
```

### 3. 行情数据集成

**获取实时行情：**
```typescript
const getCurrentQuote = useGetCurrentQuoteCallback()
const symbolMarketInfo = getCurrentQuote(symbolInfo.symbol)

// 格式化显示
const price = BNumber.toFormatNumber(symbolMarketInfo.ask, {
  volScale: symbolInfo.symbolDecimal
})
const percent = BNumber.toFormatPercent(symbolMarketInfo.percent, {
  forceSign: true,
  isRaw: false
})
```

### 4. 布局调整

**SearchAssetRow 布局变更：**
- **原布局：** `[Avatar + Symbol/Name] [AreaChart] [Price + Percent]`
- **新布局：** `[Avatar + Symbol/Name] [Price] [Percent]`
- 移除 AreaChart 组件
- 价格显示在原 AreaChart 位置

## 性能优化

### React Compiler 自动优化

项目已启用 `reactCompiler: true`，无需手动使用 `useMemo`、`useCallback`、`memo`。编译器自动优化：
- 自动 memoization 计算结果
- 自动缓存函数引用
- 自动优化组件重渲染

### 防抖优化

```typescript
const [debouncedQuery, setDebouncedQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery)
  }, 300)
  return () => clearTimeout(timer)
}, [searchQuery])
```

## 用户体验优化

### 标题动态切换
- 无搜索词：显示 `<Trans>热门品种</Trans>`
- 有搜索词：显示 `<Trans>搜索结果</Trans>`

### 空状态处理
```typescript
{filteredSymbols.length === 0 && (
  <View className="py-[96px]">
    <EmptyState message={<Trans>暂无搜索内容</Trans>} />
  </View>
)}
```

### 路由跳转
```typescript
const handleSelect = (symbol: string) => {
  trade.switchSymbol(symbol)
  router.push(`/trade/${symbol}`)
}
```

## 技术栈

- **React Native**：UI 框架
- **Expo Router**：路由管理
- **MobX**：状态管理（trade store）
- **Lingui**：国际化
- **React Compiler**：自动性能优化

## 实施计划

### 阶段 1：数据层改造
1. 添加页面初始化逻辑，调用 `getSymbolList()`
2. 实现热门品种筛选函数
3. 集成 `useGetCurrentQuoteCallback` 获取行情数据

### 阶段 2：搜索功能实现
1. 实现字符拆分与匹配逻辑
2. 实现权重计算与排序
3. 添加防抖优化

### 阶段 3：UI 组件改造
1. 创建 HighlightText 组件
2. 重构 SearchAssetRow 布局（移除 AreaChart）
3. 重构 SearchAssetTradeRow 布局
4. 更新标题动态切换逻辑

### 阶段 4：路由与交互
1. 实现点击跳转到 `/trade/[symbol]`
2. 添加空状态处理
3. 测试完整交互流程

## 风险与注意事项

### 潜在风险
1. **性能风险**：大量品种列表（>500）时，字符级匹配可能影响性能
   - **缓解措施**：React Compiler 自动优化 + 防抖
2. **行情数据延迟**：WebSocket 行情可能有延迟
   - **缓解措施**：显示加载状态，避免闪烁

### 注意事项
1. HOT_SYMBOL_LIST 需要转小写匹配 Alias 字段
2. 高亮逻辑需要处理大小写不敏感
3. 路由跳转前需要调用 `trade.switchSymbol()` 更新状态

## 验收标准

- [ ] 页面初始化时成功调用接口更新品种列表
- [ ] 无搜索词时正确显示热门品种
- [ ] 搜索功能按字符匹配，权重排序正确
- [ ] symbol/alias/name 字段匹配的字符正确高亮
- [ ] 价格和涨跌百分比显示正确（基于实时行情）
- [ ] 点击品种正确跳转到 `/trade/[symbol]`
- [ ] 搜索无结果时显示"暂无搜索内容"
- [ ] 搜索输入有 300ms 防抖
- [ ] 标题在"热门品种"和"搜索结果"之间正确切换

## 附录

### HOT_SYMBOL_LIST 配置
```typescript
const HOT_SYMBOL_LIST = ['SOL', 'XAU', 'BTC', 'ETH', 'EURUSD']
```

### 相关文件
- `/apps/mobile/src/pages/(protected)/(home)/search.tsx` - 搜索页面
- `/apps/mobile/src/v1/stores/trade.ts` - 交易状态管理
- `/apps/mobile/src/v1/utils/wsUtil.ts` - WebSocket 工具函数
- `/apps/mobile/src/pages/(protected)/(tabs)/home/index.tsx` - 首页参考实现
