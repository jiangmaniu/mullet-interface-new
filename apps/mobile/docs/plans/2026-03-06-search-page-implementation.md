# 搜索页面重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构搜索页面，实现基于真实行情数据的品种搜索功能，支持字符级模糊匹配、权重排序和高亮显示。

**Architecture:** 使用 MobX store 管理品种数据，通过 WebSocket 获取实时行情，实现字符级搜索匹配和权重排序算法，使用 React Compiler 自动优化性能。

**Tech Stack:** React Native, Expo Router, MobX, Lingui, React Compiler

---

## Task 1: 添加页面初始化逻辑

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:157-243`

**Step 1: 导入必要的依赖**

在文件顶部添加导入：

```typescript
import { useEffect } from 'react'
import { useStores } from '@/v1/provider/mobxProvider'
import { useGetCurrentQuoteCallback } from '@/v1/utils/wsUtil'
import { BNumber } from '@mullet/utils/number'
import { parseRiseAndFallInfo } from '@/helpers/market'
```

**Step 2: 在 SearchPage 组件中添加初始化逻辑**

在 `SearchPage` 函数开头添加：

```typescript
const { trade } = useStores()

useEffect(() => {
  // 页面初始化时调用接口更新品种列表
  trade.getSymbolList()
}, [])
```

**Step 3: 验证初始化逻辑**

运行应用，打开搜索页面，检查：
- 控制台无错误
- `trade.symbolListAll` 有数据

**Step 4: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "feat(search): 添加页面初始化逻辑

- 导入必要的依赖
- 调用 getSymbolList 更新品种列表

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 实现热门品种筛选逻辑

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:73-73`

**Step 1: 创建热门品种筛选函数**

在 `HOT_SYMBOL_LIST` 常量下方添加：

```typescript
// 筛选热门品种
function getHotSymbols(symbolListAll: Account.TradeSymbolListItem[]) {
  const hotSymbolsLower = HOT_SYMBOL_LIST.map(s => s.toLowerCase())
  return symbolListAll.filter(item =>
    hotSymbolsLower.some(hot => item.alias?.toLowerCase().includes(hot))
  )
}
```

**Step 2: 验证筛选逻辑**

在浏览器控制台测试：
```javascript
const result = getHotSymbols(trade.symbolListAll)
console.log('热门品种:', result)
```

预期：返回包含 SOL, XAU, BTC, ETH, EURUSD 的品种列表

**Step 3: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "feat(search): 实现热门品种筛选逻辑

- 基于 HOT_SYMBOL_LIST 筛选品种
- 转小写匹配 Alias 字段

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 实现搜索筛选与权重排序

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:164-168`

**Step 1: 添加防抖状态**

在 `SearchPage` 组件中添加：

```typescript
const [debouncedQuery, setDebouncedQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery)
  }, 300)
  return () => clearTimeout(timer)
}, [searchQuery])
```

**Step 2: 创建权重计算函数**

在 `getHotSymbols` 函数下方添加：

```typescript
// 计算匹配权重
function calculateMatchScore(
  item: Account.TradeSymbolListItem,
  searchChars: string[]
): number {
  const searchText = `${item.symbol} ${item.alias} ${item.name}`.toLowerCase()
  return searchChars.filter(char =>
    searchText.includes(char.toLowerCase())
  ).length
}

// 搜索并排序品种
function searchAndSortSymbols(
  symbolListAll: Account.TradeSymbolListItem[],
  searchQuery: string
) {
  const searchChars = searchQuery.trim().split('').filter(c => c.trim())

  if (searchChars.length === 0) {
    return getHotSymbols(symbolListAll)
  }

  return symbolListAll
    .map(item => ({ item, score: calculateMatchScore(item, searchChars) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}
```

**Step 3: 更新 filteredSymbols 逻辑**

替换现有的 `filteredSymbols` 计算：

```typescript
const filteredSymbols = searchAndSortSymbols(trade.symbolListAll, debouncedQuery)
const searchChars = debouncedQuery.trim().split('').filter(c => c.trim())
```

**Step 4: 验证搜索逻辑**

测试场景：
1. 无输入 → 显示热门品种
2. 输入 "BTC" → BTC-USDC 排在前面
3. 输入 "BTC E" → BTC-USDC 和 ETH-USDC 都显示，按权重排序

**Step 5: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "feat(search): 实现搜索筛选与权重排序

- 添加 300ms 防抖优化
- 实现字符级匹配算法
- 按匹配数量排序结果

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: 创建高亮文本组件

**Files:**
- Create: `apps/mobile/src/pages/(protected)/(home)/_comps/highlight-text.tsx`

**Step 1: 创建 HighlightText 组件**

```typescript
import { Text } from '@/components/ui/text'

interface HighlightTextProps {
  text: string
  searchChars: string[]
  className?: string
}

export function HighlightText({ text, searchChars, className }: HighlightTextProps) {
  if (!searchChars.length) {
    return <Text className={className}>{text}</Text>
  }

  return (
    <Text className={className}>
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

**Step 2: 在 search.tsx 中导入组件**

```typescript
import { HighlightText } from './_comps/highlight-text'
```

**Step 3: 验证组件渲染**

在浏览器中测试：
- 输入 "BTC" → "BTC-USDC" 中的 B, T, C 应该高亮
- 输入 "sol" → "SOL-USDC" 中的 S, O, L 应该高亮（不区分大小写）

**Step 4: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/_comps/highlight-text.tsx apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "feat(search): 创建高亮文本组件

- 实现字符级高亮逻辑
- 支持大小写不敏感匹配

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: 重构 SearchAssetRow 组件

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:88-120`

**Step 1: 更新组件接口**

```typescript
function SearchAssetRow({
  symbol,
  searchChars,
  onSelect
}: {
  symbol: Account.TradeSymbolListItem
  searchChars: string[]
  onSelect: () => void
}) {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbol.symbol)
  const percentChangeInfo = parseRiseAndFallInfo(symbolMarketInfo.percent)

  return (
    <Pressable onPress={onSelect} className="p-xl gap-xl flex-row items-center">
      <View className="gap-medium flex-1 flex-row items-center">
        <Avatar className="size-6 flex-shrink-0">
          <AvatarFallback className="bg-brand-default">
            <Text className="text-content-1">{symbol.symbol[0]}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <HighlightText
            text={symbol.symbol}
            searchChars={searchChars}
            className="text-paragraph-p2 text-content-1"
          />
          <HighlightText
            text={symbol.name || symbol.alias || ''}
            searchChars={searchChars}
            className="text-paragraph-p3 text-content-4"
          />
        </View>
      </View>

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="flex-1">
          <Text className="text-paragraph-p1 text-content-1">
            {BNumber.toFormatNumber(symbolMarketInfo.ask, { volScale: symbol.symbolDecimal })}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text
            className={cn(
              'text-paragraph-p2',
              percentChangeInfo.isRise
                ? 'text-market-rise'
                : percentChangeInfo.isFall
                  ? 'text-market-fall'
                  : 'text-content-1'
            )}
          >
            {BNumber.toFormatPercent(symbolMarketInfo.percent, { forceSign: true, isRaw: false })}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
```

**Step 2: 更新组件调用**

在渲染列表时传入 `searchChars`：

```typescript
<SearchAssetRow
  key={item.symbol}
  symbol={item}
  searchChars={searchChars}
  onSelect={handleSelect}
/>
```

**Step 3: 验证布局和数据**

检查：
- Avatar 显示正确
- Symbol 和 Name 高亮正确
- 价格显示正确（基于实时行情）
- 涨跌百分比颜色正确

**Step 4: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "refactor(search): 重构 SearchAssetRow 组件

- 移除 AreaChart，使用价格替代
- 集成实时行情数据
- 添加高亮显示

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: 重构 SearchAssetTradeRow 组件

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:123-154`

**Step 1: 更新组件实现**

```typescript
function SearchAssetTradeRow({
  symbol,
  searchChars,
  onSelect
}: {
  symbol: Account.TradeSymbolListItem
  searchChars: string[]
  onSelect: () => void
}) {
  const getCurrentQuote = useGetCurrentQuoteCallback()
  const symbolMarketInfo = getCurrentQuote(symbol.symbol)

  return (
    <Pressable onPress={onSelect} className="p-xl gap-xl flex-row items-center">
      <View className="gap-medium flex-1 flex-row items-center">
        <Avatar className="size-6 flex-shrink-0">
          <AvatarFallback className="bg-brand-default">
            <Text className="text-content-1">{symbol.symbol[0]}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <HighlightText
            text={symbol.symbol}
            searchChars={searchChars}
            className="text-paragraph-p2 text-content-1"
          />
          <HighlightText
            text={symbol.name || symbol.alias || ''}
            searchChars={searchChars}
            className="text-paragraph-p3 text-content-4"
          />
        </View>
      </View>

      <View className="gap-xl w-[192px] flex-shrink-0 flex-row">
        <View className="gap-xs flex-1">
          <View className="bg-market-rise/15 border-market-rise rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-rise">
              {BNumber.toFormatNumber(symbolMarketInfo.bid, { volScale: symbol.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-paragraph-p3 text-content-4">
            最高 {BNumber.toFormatNumber(symbolMarketInfo.high, { volScale: symbol.symbolDecimal })}
          </Text>
        </View>
        <View className="gap-xs flex-1">
          <View className="bg-market-fall/15 border-market-fall rounded-small h-[24px] flex-col items-center justify-center border">
            <Text className="text-paragraph-p2 text-market-fall">
              {BNumber.toFormatNumber(symbolMarketInfo.ask, { volScale: symbol.symbolDecimal })}
            </Text>
          </View>
          <Text className="text-content-4 text-paragraph-p3 text-right">
            最低 {BNumber.toFormatNumber(symbolMarketInfo.low, { volScale: symbol.symbolDecimal })}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
```

**Step 2: 更新组件调用**

```typescript
<SearchAssetTradeRow
  key={item.symbol}
  symbol={item}
  searchChars={searchChars}
  onSelect={handleSelect}
/>
```

**Step 3: 验证交易视图**

检查：
- 买价/卖价显示正确
- 最高价/最低价显示正确
- 高亮显示正确

**Step 4: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "refactor(search): 重构 SearchAssetTradeRow 组件

- 集成实时行情数据
- 添加高亮显示
- 优化布局

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 更新标题和路由逻辑

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:199-222`

**Step 1: 更新标题动态切换**

```typescript
<View className="p-xl flex-row items-center justify-between">
  <Text className="text-important-1 text-content-1">
    {searchChars.length > 0 ? <Trans>搜索结果</Trans> : <Trans>热门品种</Trans>}
  </Text>
  <Tabs value={viewMode} onValueChange={setViewMode} className="flex-shrink-0">
    {/* ... 现有代码 ... */}
  </Tabs>
</View>
```

**Step 2: 更新路由跳转逻辑**

```typescript
const handleSelect = () => {
  // 注意：这里需要传入具体的 symbol
  // 在实际调用时需要修改
  router.push(`/trade/${symbol}`)
}
```

修改为：

在组件顶层添加 hook：

```typescript
// 在 SearchPage 组件顶层
const { switchTradeActiveSymbol } = useTradeSwitchActiveSymbol()
```

修改 handleSelect 函数：

```typescript
const handleSelect = (symbol: string) => {
  switchTradeActiveSymbol(symbol)
  router.push(`/trade/${symbol}`)
}
```

更新组件调用：

```typescript
{filteredSymbols.map((item) =>
  viewMode === 'trade' ? (
    <SearchAssetTradeRow
      key={item.symbol}
      symbol={item}
      searchChars={searchChars}
      onSelect={() => handleSelect(item.symbol)}
    />
  ) : (
    <SearchAssetRow
      key={item.symbol}
      symbol={item}
      searchChars={searchChars}
      onSelect={() => handleSelect(item.symbol)}
    />
  )
)}
```

**Step 3: 更新空状态文案**

```typescript
{filteredSymbols.length === 0 ? (
  <View className="py-[96px]">
    <EmptyState
      message={<Trans>暂无搜索内容</Trans>}
      iconWidth={107}
      iconHeight={76}
      className="gap-2xl"
    />
  </View>
) : (
  {/* ... 列表渲染 ... */}
)}
```

**Step 4: 验证功能**

测试：
1. 无搜索词 → 标题显示"热门品种"
2. 有搜索词 → 标题显示"搜索结果"
3. 搜索无结果 → 显示"暂无搜索内容"
4. 点击品种 → 正确跳转到 `/trade/[symbol]`

**Step 5: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "feat(search): 更新标题和路由逻辑

- 标题动态切换（热门品种/搜索结果）
- 修复路由跳转逻辑
- 更新空状态文案

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: 清理和优化

**Files:**
- Modify: `apps/mobile/src/pages/(protected)/(home)/search.tsx:1-243`

**Step 1: 移除未使用的代码**

删除：
- `generateMockData` 函数
- `SYMBOLS` mock 数据
- `AreaChart` 相关导入

**Step 2: 优化导入顺序**

按照项目规范排序：
1. React/React Native
2. 第三方库
3. 项目内部模块（`@/`）
4. 相对路径导入

**Step 3: 添加代码注释**

在关键函数添加中文注释：

```typescript
// 筛选热门品种
function getHotSymbols(symbolListAll: Account.TradeSymbolListItem[]) {
  // ...
}

// 计算匹配权重
function calculateMatchScore(/* ... */) {
  // ...
}

// 搜索并排序品种
function searchAndSortSymbols(/* ... */) {
  // ...
}
```

**Step 4: 验证完整功能**

完整测试流程：
1. 打开搜索页面 → 显示热门品种
2. 输入 "BTC" → 显示 BTC 相关品种，高亮正确
3. 输入 "xyz" → 显示"暂无搜索内容"
4. 切换视图模式 → 两种视图都正常
5. 点击品种 → 跳转正确

**Step 5: Commit**

```bash
git add apps/mobile/src/pages/(protected)/(home)/search.tsx
git commit -m "refactor(search): 清理和优化代码

- 移除未使用的 mock 数据
- 优化导入顺序
- 添加代码注释

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 验收清单

完成后验证以下功能：

- [ ] 页面初始化时成功调用接口更新品种列表
- [ ] 无搜索词时正确显示热门品种
- [ ] 搜索功能按字符匹配，权重排序正确
- [ ] symbol/alias/name 字段匹配的字符正确高亮
- [ ] 价格和涨跌百分比显示正确（基于实时行情）
- [ ] 点击品种正确跳转到 `/trade/[symbol]`
- [ ] 搜索无结果时显示"暂无搜索内容"
- [ ] 搜索输入有 300ms 防抖
- [ ] 标题在"热门品种"和"搜索结果"之间正确切换
- [ ] 两种视图模式（市场/交易）都正常工作

---

## 相关技能

- @superpowers:test-driven-development - TDD 开发流程
- @superpowers:verification-before-completion - 完成前验证
- @superpowers:systematic-debugging - 系统化调试
