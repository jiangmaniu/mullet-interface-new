# 自选功能重构设计文档

**日期**: 2026-03-18
**作者**: Claude
**状态**: 待审核
**环境**: 测试环境

## 目录

- [概述](#概述)
- [背景](#背景)
- [设计目标](#设计目标)
- [架构设计](#架构设计)
- [数据结构设计](#数据结构设计)
- [Selectors 设计](#selectors-设计)
- [Actions 设计](#actions-设计)
- [数据迁移方案](#数据迁移方案)
- [使用示例](#使用示例)
- [账户切换订阅](#账户切换订阅)
- [测试计划](#测试计划)
- [风险评估](#风险评估)

---

## 概述

将 MobX store 中的 `favoriteList` 自选功能重构到 Zustand store 的 `market.favorite` 子命名空间，实现多账户支持、性能优化和更好的架构设计。

### 核心改进

- ✅ 存储优化：只存 symbol 字符串，避免数据冗余
- ✅ 性能优化：Set 提供 O(1) 查找性能
- ✅ 多账户支持：Map 结构支持跨账户查询
- ✅ 自动过滤：自动过滤已下架的品种
- ✅ 便捷操作：Actions 自动使用当前账户
- ✅ 自动持久化：Zustand persist 自动保存

---

## 背景

### 当前实现（MobX）

```typescript
// v1/stores/trade.ts
class TradeStore {
  @observable favoriteList = [] as Account.TradeSymbolListItem[]

  // 存储完整对象到 MMKV
  setSymbolFavoriteToLocal(data: Account.TradeSymbolListItem[]) {
    this.favoriteList = data
    STORAGE_SET_CONF_INFO(data, `${this.currentAccountInfo?.id}.favoriteList`)
  }
}
```

### 存在的问题

1. **数据冗余**：存储完整的 `TradeSymbolListItem` 对象，包含价格、配置等易变数据
2. **数据过期**：品种信息更新后，缓存的对象可能过期
3. **手动持久化**：需要手动调用 `STORAGE_SET_CONF_INFO`
4. **架构混乱**：trade store 职责过重
5. **性能问题**：判断是否收藏需要 O(n) 遍历

---

## 设计目标

### 功能目标

1. 支持多账户收藏数据隔离
2. 自动过滤已下架的品种
3. 提供便捷的操作 API
4. 支持跨账户查询（未来需求）

### 性能目标

1. 判断是否收藏：O(1) 时间复杂度
2. 获取收藏列表：O(n) 时间复杂度（n 为收藏数量）
3. 持久化：自动化，无需手动调用

### 架构目标

1. 职责清晰：market 负责行情和收藏，user 负责账户信息
2. 易于维护：独立的子命名空间
3. 易于测试：纯函数 selectors
4. 易于扩展：支持未来功能（如收藏分组）

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    RootStore (Zustand)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   market    │  │     user     │  │     trade      │ │
│  ├─────────────┤  ├──────────────┤  ├────────────────┤ │
│  │ marketMap   │  │ info:        │  │ activeSymbol   │ │
│  │ marketList  │  │  - clientInfo│  │ setting        │ │
│  │             │  │  - accountId │  │ formData       │ │
│  │ favorite: ⭐│  │              │  │                │ │
│  │  - Map      │  └──────────────┘  └────────────────┘ │
│  │  - Actions  │                                        │
│  └─────────────┘                                        │
│                                                           │
└─────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
   ┌──────────┐                        ┌──────────┐
   │   MMKV   │                        │ Selectors│
   │ 持久化层  │                        │  业务层   │
   └──────────┘                        └──────────┘
```

### 数据流向

```
用户操作 → toggleFavorite(symbol)
    ↓
获取 activeTradeAccountId
    ↓
更新 symbolFavoriteMap[accountId]
    ↓
触发 MMKV 持久化（自动）
    ↓
Selector 自动重新计算
    ↓
UI 更新
```

### 文件结构

```
stores/
├── market-slice/
│   ├── index.ts                    # Market slice 主文件
│   ├── favorite-slice.ts           # ⭐ Favorite 子命名空间
│   └── favorite-migration.ts       # 数据迁移
├── user-slice/
│   ├── index.ts
│   ├── auth-slice.ts
│   └── info-slice.ts               # ⭐ 添加 activeTradeAccountId
└── index.ts                        # Root store
```

---

## 数据结构设计

### Market Favorite Slice

```typescript
// market-slice/favorite-slice.ts

export interface FavoriteSliceState {
  /**
   * 多账户收藏数据
   * key: accountId
   * value: symbol 字符串数组
   *
   * 示例: {
   *   'account-123': ['XAUUSD', 'EURUSD', 'BTCUSD'],
   *   'account-456': ['ETHUSD', 'BNBUSD']
   * }
   */
  symbolFavoriteMap: Record<string, string[]>
}

export interface FavoriteSliceActions {
  /**
   * 切换收藏状态（主要操作）
   * @param symbol - 品种代码
   * @param accountId - 可选，不传则使用当前账户
   */
  toggleFavorite: (symbol: string, accountId?: string) => void

  /**
   * 添加收藏
   * @param symbol - 品种代码
   * @param accountId - 可选，不传则使用当前账户
   */
  addFavorite: (symbol: string, accountId?: string) => void

  /**
   * 删除收藏
   * @param symbol - 品种代码
   * @param accountId - 可选，不传则使用当前账户
   */
  removeFavorite: (symbol: string, accountId?: string) => void

  /**
   * 批量设置收藏列表（用于初始化/迁移）
   * @param symbols - 品种代码数组
   * @param accountId - 可选，不传则使用当前账户
   */
  setFavoriteList: (symbols: string[], accountId?: string) => void

  /**
   * 清空收藏列表
   * @param accountId - 可选，不传则使用当前账户
   */
  clearFavoriteList: (accountId?: string) => void

  /**
   * 简单 setter（使用 createSetter 创建）
   */
  setSymbolFavoriteMap: Setter<Record<string, string[]>>
}

export type FavoriteSlice = FavoriteSliceState & FavoriteSliceActions
```

### User Info Slice

```typescript
// user-slice/info-slice.ts

export interface InfoSliceState {
  clientInfo: User.ClientInfo | null

  // ⭐ 新增：当前激活的交易账户 ID
  activeTradeAccountId: string | null
}

export interface InfoSliceActions {
  setInfo: (partial: Partial<InfoSliceState>) => void

  // ⭐ 新增：使用 createSetter 创建
  setActiveTradeAccountId: Setter<string | null>
}
```

### activeTradeAccountId 初始化

**初始化时机**：在调用 `trade.setCurrentAccountInfo` 的地方同步设置

**需要修改的位置**：

1. **trade-account-switch-drawer.tsx** - 账户切换
2. **v1/stores/user.ts** - 登录后自动选择账户

**实现方式**：

```typescript
// 在调用 setCurrentAccountInfo 后立即设置
await trade.setCurrentAccountInfo(account)
useRootStore.getState().user.info.setActiveTradeAccountId(account.id)
```

### 持久化配置

```typescript
// stores/index.ts
persist(
  immer(...),
  {
    name: 'mullet-root-store',
    storage: createJSONStorage(() => mmkvStorage),

    // 排除不需要持久化的字段
    partialize: createPartialize<RootStoreState>(
      'trade.formData',
      'market.fetchMarketListLoading'
    ),

    // ✅ market.favorite.symbolFavoriteMap 会自动持久化
    // ✅ user.info.activeTradeAccountId 会自动持久化
  }
)
```

---

## Selectors 设计

### 命名规范

遵循项目现有模式：`{slice名称}{具体功能}Selector`

```typescript
// 现有项目示例
marketMapSelector              // market.marketMap
userInfoClientInfoSelector     // user.info.clientInfo

// ⭐ 新增 favorite 相关（添加 Market 前缀）
marketCurrentFavoriteSymbolsSelector    // 当前账户的收藏品种
marketCurrentFavoriteSetSelector        // 当前账户的收藏 Set
marketCurrentFavoriteCountSelector      // 当前账户的收藏数量
```

### 基础 Selectors

```typescript
/**
 * 获取当前账户的收藏 symbol 列表（字符串数组）
 * 内部使用，不直接暴露给业务层
 */
const marketCurrentFavoriteSymbolListSelector = (state: RootStoreState): string[] => {
  const accountId = state.user.info.activeTradeAccountId
  if (!accountId) return []
  return state.market.favorite.symbolFavoriteMap[accountId] || []
}

/**
 * 获取当前账户的收藏 Set（用于快速判断）
 * 内部使用，性能优化
 */
export const marketCurrentFavoriteSetSelector = createSelector(
  [marketCurrentFavoriteSymbolListSelector],
  (symbolList): Set<string> => new Set(symbolList)
)

/**
 * ⭐ 核心 Selector：获取当前账户的收藏品种完整信息
 * 业务层主要使用这个
 * 自动过滤掉不存在的品种（如已下架的 BTCUSDC）
 */
export const marketCurrentFavoriteSymbolsSelector = createSelector(
  [
    marketCurrentFavoriteSymbolListSelector,
    (state: RootStoreState) => state.market.marketMap
  ],
  (symbolList, marketMap): Account.TradeSymbolListItem[] => {
    return symbolList
      .map(symbol => marketMap[symbol])
      .filter(Boolean) as Account.TradeSymbolListItem[]
  }
)

/**
 * 判断指定品种是否被当前账户收藏
 * @param symbol - 品种代码
 */
export const createMarketIsFavoriteSelector = (symbol: string) =>
  createSelector(
    [marketCurrentFavoriteSetSelector],
    (favoriteSet): boolean => favoriteSet.has(symbol)
  )

/**
 * 获取当前账户的收藏数量
 */
export const marketCurrentFavoriteCountSelector = createSelector(
  [marketCurrentFavoriteSymbolListSelector],
  (symbolList): number => symbolList.length
)
```

### 灵活查询 Selectors

```typescript
/**
 * 获取指定账户的收藏品种完整信息
 * @param accountId - 账户 ID
 */
export const getMarketFavoriteSymbolsByAccountId = (accountId: string) =>
  createSelector(
    [
      (state: RootStoreState) => state.market.favorite.symbolFavoriteMap[accountId] || [],
      (state: RootStoreState) => state.market.marketMap
    ],
    (symbolList, marketMap): Account.TradeSymbolListItem[] => {
      return symbolList
        .map(symbol => marketMap[symbol])
        .filter(Boolean) as Account.TradeSymbolListItem[]
    }
  )
```

### 性能优化说明

| Selector | 缓存策略 | 性能 |
|----------|---------|------|
| `marketCurrentFavoriteSymbolsSelector` | createSelector 缓存 | ⚡ 高性能 |
| `marketCurrentFavoriteSetSelector` | createSelector 缓存 | ⚡⚡ 极高性能（O(1)查找） |
| `createMarketIsFavoriteSelector` | 每次创建新 selector | ⚠️ 需要缓存使用 |

---

## Actions 设计

### 实现示例

```typescript
export function createMarketFavoriteSlice(
  setRoot: (fn: (state: any) => void) => void,
  getRoot: () => RootStoreState
): FavoriteSlice {
  // 创建 setter 工厂
  const favoriteSetter = createSetter<FavoriteSlice>(
    setRoot,
    (s) => s.market.favorite
  )

  return {
    // 状态
    symbolFavoriteMap: {},

    // 简单 setter（使用 createSetter）
    setSymbolFavoriteMap: favoriteSetter('symbolFavoriteMap'),

    // ⭐ 主要操作：切换收藏
    toggleFavorite: (symbol: string, accountId?: string) => {
      setRoot((state) => {
        const targetAccountId = accountId || state.user.info.activeTradeAccountId
        if (!targetAccountId) return

        const currentList = state.market.favorite.symbolFavoriteMap[targetAccountId] || []
        const index = currentList.indexOf(symbol)

        if (index > -1) {
          // 已存在，删除
          state.market.favorite.symbolFavoriteMap[targetAccountId] =
            currentList.filter(s => s !== symbol)
        } else {
          // 不存在，添加
          state.market.favorite.symbolFavoriteMap[targetAccountId] =
            [...currentList, symbol]
        }
      })
    },

    addFavorite: (symbol: string, accountId?: string) => {
      setRoot((state) => {
        const targetAccountId = accountId || state.user.info.activeTradeAccountId
        if (!targetAccountId) return

        const currentList = state.market.favorite.symbolFavoriteMap[targetAccountId] || []
        if (currentList.includes(symbol)) return

        state.market.favorite.symbolFavoriteMap[targetAccountId] =
          [...currentList, symbol]
      })
    },

    removeFavorite: (symbol: string, accountId?: string) => {
      setRoot((state) => {
        const targetAccountId = accountId || state.user.info.activeTradeAccountId
        if (!targetAccountId) return

        const currentList = state.market.favorite.symbolFavoriteMap[targetAccountId] || []
        state.market.favorite.symbolFavoriteMap[targetAccountId] =
          currentList.filter(s => s !== symbol)
      })
    },

    setFavoriteList: (symbols: string[], accountId?: string) => {
      setRoot((state) => {
        const targetAccountId = accountId || state.user.info.activeTradeAccountId
        if (!targetAccountId) return

        state.market.favorite.symbolFavoriteMap[targetAccountId] = symbols
      })
    },

    clearFavoriteList: (accountId?: string) => {
      setRoot((state) => {
        const targetAccountId = accountId || state.user.info.activeTradeAccountId
        if (!targetAccountId) return

        state.market.favorite.symbolFavoriteMap[targetAccountId] = []
      })
    },
  }
}
```

---

## 数据迁移方案

### 测试环境策略

**当前测试环境不需要实现数据迁移机制**，原因：
- 测试环境没有生产用户数据
- 可以直接清空旧数据重新开始
- 简化开发流程，加快迭代速度

### 生产环境要求

⚠️ **重要**：当上线正式环境时，如果做了 store 格式的调整，**必须实现数据迁移方案**。

参考迁移模板（生产环境使用）：

```typescript
// stores/market-slice/favorite-migration.ts

/**
 * 数据迁移：从 MobX favoriteList 迁移到 Zustand symbolFavoriteMap
 * 版本：v1 → v2
 * 日期：2026-03-18
 *
 * ⚠️ 注意：此迁移逻辑仅供生产环境参考，测试环境不需要
 */
export async function migrateFavoriteData(state: RootStoreState) {
  try {
    const migrationKey = 'favorite-migration-v2-completed'
    const isMigrated = mmkv.getBoolean(migrationKey)

    if (isMigrated) {
      console.log('[Migration] Already migrated')
      return
    }

    // 读取旧数据（MobX 格式）
    const oldConfInfo = await STORAGE_GET_CONF_INFO()
    if (!oldConfInfo) {
      console.log('[Migration] No old data')
      mmkv.set(migrationKey, true)
      return
    }

    // 提取收藏数据
    const newFavoriteMap: Record<string, string[]> = {}

    // 遍历所有账户的配置
    Object.keys(oldConfInfo).forEach(key => {
      // 跳过非账户配置
      if (key === 'currentAccountInfo') return

      const accountData = oldConfInfo[key]
      const favoriteList = accountData?.favoriteList

      if (Array.isArray(favoriteList) && favoriteList.length > 0) {
        // 提取 symbol 字符串
        const symbols = favoriteList
          .filter(item => item?.symbol)
          .map(item => item.symbol)

        if (symbols.length > 0) {
          newFavoriteMap[key] = symbols
        }
      }
    })

    // 写入新格式
    if (Object.keys(newFavoriteMap).length > 0) {
      state.market.favorite.symbolFavoriteMap = newFavoriteMap
      console.log('[Migration] Migrated favorite data:', newFavoriteMap)
    }

    // 迁移 activeTradeAccountId
    if (oldConfInfo.currentAccountInfo?.id) {
      state.user.info.activeTradeAccountId = oldConfInfo.currentAccountInfo.id
      console.log('[Migration] Migrated activeTradeAccountId:', oldConfInfo.currentAccountInfo.id)
    }

    mmkv.set(migrationKey, true)
    console.log('[Migration] Completed successfully')
  } catch (error) {
    console.error('[Migration] Failed:', error)
    // 生产环境：记录错误但不影响启动
  }
}
```

### 生产环境集成

```typescript
// stores/index.ts
const useRootStoreBase = create<RootStoreState>()(
  subscribeWithSelector(
    persist(
      immer((set, get, store) => ({
        trade: createTradeSlice(set, get, store),
        market: createMarketSlice(set, get, store),
        user: createUserSlice(set, get, store),
      })),
      {
        name: 'mullet-root-store',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: createPartialize<RootStoreState>('trade.formData'),
        merge: (persistedState, currentState) => merge({}, currentState, persistedState),

        // ⭐ 生产环境：在 onRehydrateStorage 中执行迁移
        onRehydrateStorage: () => (state) => {
          if (state && __PROD__) {  // 只在生产环境执行
            migrateFavoriteData(state)
          }
        },
      },
    ),
  ),
)
```

### 迁移检查清单

上线生产环境前，确保：

- [ ] 已实现完整的数据迁移逻辑
- [ ] 已测试迁移逻辑（使用生产数据副本）
- [ ] 已添加迁移失败的错误处理
- [ ] 已添加迁移日志和监控
- [ ] 已准备回滚方案
- [ ] 已通知用户可能的数据迁移时间

---

## 使用示例

### 页面组件

```typescript
// pages/(protected)/(tabs)/home/index.tsx
export default function HomePage() {
  // 获取当前账户的收藏列表
  const favoriteSymbols = useRootStore.use.marketCurrentFavoriteSymbolsSelector()
  const { toggleFavorite } = useRootStore.use.market.favorite()

  return (
    <View>
      <Text>我的自选 ({favoriteSymbols.length})</Text>
      {favoriteSymbols.map(symbol => (
        <SymbolItem
          key={symbol.symbol}
          data={symbol}
          onToggleFavorite={() => toggleFavorite(symbol.symbol)}
        />
      ))}
    </View>
  )
}
```

### 列表组件

```typescript
// components/symbol-list.tsx
export function SymbolList({ symbols }: { symbols: Account.TradeSymbolListItem[] }) {
  // 获取收藏 Set（用于快速判断）
  const favoriteSet = useRootStore.use.marketCurrentFavoriteSetSelector()
  const { toggleFavorite } = useRootStore.use.market.favorite()

  return (
    <FlatList
      data={symbols}
      renderItem={({ item }) => (
        <SymbolItem
          data={item}
          isFavorite={favoriteSet.has(item.symbol)}  // O(1) 查找
          onToggleFavorite={() => toggleFavorite(item.symbol)}
        />
      )}
    />
  )
}
```

### 账户切换

```typescript
// components/drawers/trade-account-switch-drawer.tsx
const handleSwitchAccount = async (account: User.AccountItem) => {
  // 1. 设置当前账户 ID（Zustand）
  useRootStore.getState().user.info.setActiveTradeAccountId(account.id)

  // 2. 设置账户信息（MobX - 兼容旧代码）
  await trade.setCurrentAccountInfo(account)

  // 3. 加载品种列表
  await trade.getSymbolList({ accountId: account.id })
}
```

---

## 账户切换订阅

### 设计说明

当 `activeTradeAccountId` 变化时，需要自动重新调用 `fetchTradeSymbolList` 加载新账户的品种列表。

使用 `subscribeWithSelector` 中间件提供的 `subscribe` API 实现响应式订阅，在 `stores/index.ts` 中完成初始化。

### 实现位置

**在 `stores/index.ts` 中，store 创建完毕后初始化订阅**，避免在 slice 内部引用 store 实例导致循环依赖。

```typescript
// stores/index.ts

export const useRootStore = createSelectors(useRootStoreBase)

// ⭐ 订阅 activeTradeAccountId 变化，自动重新加载品种列表
useRootStoreBase.subscribe(
  // selector：选取要订阅的状态片段
  (state) => state.user.info.activeTradeAccountId,
  // listener：状态变化时的回调
  (accountId, prevAccountId) => {
    // 账户切换时重新获取品种列表
    if (accountId && accountId !== prevAccountId) {
      useRootStoreBase.getState().market.fetchTradeSymbolList(accountId)
    }
  }
)
```

### 账户切换数据流向

```text
setActiveTradeAccountId(account.id)
    ↓
subscribeWithSelector 触发订阅回调
    ↓
market.fetchTradeSymbolList(accountId)
    ↓
更新 marketMap 和 marketAllList
    ↓
marketCurrentFavoriteSymbolsSelector 自动重新计算
（过滤掉新账户品种列表中不存在的收藏）
    ↓
UI 更新
```

### 与账户切换的配合

账户切换时只需要设置 `activeTradeAccountId`，品种列表会自动刷新：

```typescript
// components/drawers/trade-account-switch-drawer.tsx
const handleSwitchAccount = async (account: User.AccountItem) => {
  // 1. 设置当前账户 ID（Zustand）
  // ⭐ 触发订阅，自动调用 fetchTradeSymbolList
  useRootStore.getState().user.info.setActiveTradeAccountId(account.id)

  // 2. 设置账户信息（MobX - 兼容旧代码）
  await trade.setCurrentAccountInfo(account)

  // 3. 其他切换操作...
  await trade.setCurrentLiquidationSelectBgaId('CROSS_MARGIN')
  await onSwitchSuccess?.(account)
}
```

---

## 测试计划

### 单元测试

```typescript
describe('Market Favorite Slice', () => {
  it('should toggle favorite', () => {
    const store = createTestStore()
    store.getState().user.info.setActiveTradeAccountId('account-123')

    // 添加收藏
    store.getState().market.favorite.toggleFavorite('XAUUSD')
    expect(store.getState().market.favorite.symbolFavoriteMap['account-123']).toEqual(['XAUUSD'])

    // 删除收藏
    store.getState().market.favorite.toggleFavorite('XAUUSD')
    expect(store.getState().market.favorite.symbolFavoriteMap['account-123']).toEqual([])
  })

  it('should filter non-existent symbols', () => {
    const store = createTestStore()
    store.getState().user.info.setActiveTradeAccountId('account-123')
    store.getState().market.favorite.setFavoriteList(['XAUUSD', 'INVALID_SYMBOL'])

    // marketMap 中只有 XAUUSD
    store.getState().market.setMarket({
      marketMap: { 'XAUUSD': { symbol: 'XAUUSD' } as any }
    })

    const favorites = marketCurrentFavoriteSymbolsSelector(store.getState())
    expect(favorites).toHaveLength(1)
    expect(favorites[0].symbol).toBe('XAUUSD')
  })
})
```

### 集成测试

1. 测试账户切换后收藏数据隔离
2. 测试持久化和恢复
3. 测试数据迁移
4. 测试性能（大量收藏数据）

---

## 风险评估

### 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 数据迁移失败 | 中 | 低 | 测试环境，失败不影响启动 |
| 性能问题 | 低 | 低 | 使用 Set 优化，已验证性能 |
| 兼容性问题 | 中 | 低 | 保留 MobX 代码，逐步迁移 |

### 业务风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 用户收藏丢失 | 高 | 低 | 测试环境，有迁移逻辑 |
| 功能不一致 | 中 | 低 | 完整的测试覆盖 |

---

## 实施计划

### 阶段 1：基础实现（1-2 天）

1. 创建 `favorite-slice.ts`
2. 创建 `favorite-migration.ts`
3. 更新 `info-slice.ts` 添加 `activeTradeAccountId`
4. 集成到 Root Store

### 阶段 2：业务迁移（2-3 天）

1. 更新页面组件使用新的 selectors
2. 更新账户切换逻辑
3. 移除旧的 MobX 代码

### 阶段 3：测试和优化（1-2 天）

1. 单元测试
2. 集成测试
3. 性能测试
4. Bug 修复

---

## 附录

### 相关文件

- `stores/market-slice/favorite-slice.ts` - Favorite 子命名空间
- `stores/market-slice/favorite-migration.ts` - 数据迁移
- `stores/user-slice/info-slice.ts` - User Info Slice
- `v1/stores/trade.ts` - 旧的 MobX 实现（待移除）

### 参考文档

- [Store 设计范式](/.claude/store-pattern.md)
- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [项目 CLAUDE.md](/apps/mobile/.claude/CLAUDE.md)

---

**文档结束**
