# 自选功能重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 MobX trade store 中的 favoriteList 自选功能迁移到 Zustand market slice 的 favorite 子命名空间，支持多账户隔离、O(1) 查找性能和自动持久化。

**Architecture:** 在 `market.favorite` 独立子命名空间中使用 `Record<accountId, string[]>` 存储收藏数据，通过 `user.info.activeTradeAccountId` 关联当前账户，借助 `createSelector` 在 selector 层组合出业务所需的完整 TradeSymbolListItem 列表并自动过滤下架品种；账户切换通过 `subscribeWithSelector` 订阅 `activeTradeAccountId` 变化自动触发品种列表刷新。

**Tech Stack:** Zustand + immer + persist + subscribeWithSelector, reselect (createSelector), React Native MMKV, TypeScript

---

## 文件结构

| 操作     | 路径                                                                 | 说明                                   |
| -------- | -------------------------------------------------------------------- | -------------------------------------- |
| **新建** | `apps/mobile/src/stores/market-slice/favorite-slice.ts`              | FavoriteSlice 状态、actions、selectors |
| **修改** | `apps/mobile/src/stores/market-slice/index.ts`                       | 集成 favorite 子命名空间               |
| **修改** | `apps/mobile/src/stores/user-slice/infoSlice.ts`                     | 新增 activeTradeAccountId              |
| **修改** | `apps/mobile/src/stores/index.ts`                                    | 更新 partialize + 添加订阅             |
| **修改** | `apps/mobile/src/components/drawers/trade-account-switch-drawer.tsx` | 同步设置 activeTradeAccountId          |
| **修改** | `apps/mobile/src/v1/stores/user.ts`                                  | 同步设置 activeTradeAccountId          |
| **修改** | 业务页面（见 Task 5）                                                | 替换旧的 favoriteList 调用             |

---

## Task 1：infoSlice 新增 activeTradeAccountId

**Files:**

- Modify: `apps/mobile/src/stores/user-slice/infoSlice.ts`

- [ ] **Step 1: 修改 infoSlice 新增字段和 setter**

  打开 [infoSlice.ts](apps/mobile/src/stores/user-slice/infoSlice.ts)，替换为：

  ```typescript
  import type { Setter } from '../_helpers/createSetter'
  import type { RootStoreState } from '../index'

  import { createSetter } from '../_helpers/createSetter'

  export interface InfoSliceState {
    clientInfo: User.ClientInfo | null
    /** 当前激活的交易账户 ID */
    activeTradeAccountId: string | null
  }

  export interface InfoSliceActions {
    setInfo: (partial: Partial<InfoSliceState>) => void
    setActiveTradeAccountId: Setter<string | null>
  }

  /** info 命名空间（状态 + actions 扁平化） */
  export type InfoSlice = InfoSliceState & InfoSliceActions

  export function createUserInfoSlice(setRoot: (fn: (state: any) => void) => void): InfoSlice {
    const infoSetter = createSetter<InfoSlice>(setRoot, (s) => s.user.info)

    return {
      clientInfo: null,
      activeTradeAccountId: null,

      setInfo: (partial) =>
        setRoot((state) => {
          Object.assign(state.user.info, partial)
        }),

      setActiveTradeAccountId: infoSetter('activeTradeAccountId'),
    }
  }

  // ============ Selectors ============

  export const userInfoSelector = (state: RootStoreState) => state.user.info
  export const userInfoClientInfoSelector = (state: RootStoreState) => state.user.info.clientInfo
  export const userInfoActiveTradeAccountIdSelector = (state: RootStoreState) => state.user.info.activeTradeAccountId
  ```

- [ ] **Step 2: 验证 TypeScript 编译无报错**

  ```bash
  cd apps/mobile && npx tsc --noEmit 2>&1 | grep infoSlice
  ```

  预期：无报错输出

- [ ] **Step 3: Commit**

  ```bash
  git add apps/mobile/src/stores/user-slice/infoSlice.ts
  git commit -m "feat(store): add activeTradeAccountId to user info slice"
  ```

---

## Task 2：新建 favorite-slice.ts

**Files:**

- Create: `apps/mobile/src/stores/market-slice/favorite-slice.ts`

- [ ] **Step 1: 创建文件**

  新建 `apps/mobile/src/stores/market-slice/favorite-slice.ts`：

  ```typescript
  import { createSelector } from 'reselect'
  import type { Setter } from '../_helpers/createSetter'
  import type { RootStoreState } from '../index'

  import { Account } from '@/services/tradeCore/account/typings'

  import { createSetter } from '../_helpers/createSetter'

  // ============ 状态 & Actions 类型 ============

  export interface FavoriteSliceState {
    /**
     * 多账户收藏数据
     * key: accountId, value: symbol 字符串数组
     * 示例: { 'account-123': ['XAUUSD', 'EURUSD'] }
     */
    symbolFavoriteMap: Record<string, string[]>
  }

  export interface FavoriteSliceActions {
    /** 切换收藏状态（主要操作） */
    toggleFavorite: (symbol: string, accountId?: string) => void
    /** 添加收藏 */
    addFavorite: (symbol: string, accountId?: string) => void
    /** 删除收藏 */
    removeFavorite: (symbol: string, accountId?: string) => void
    /** 批量设置收藏列表（初始化/迁移用） */
    setFavoriteList: (symbols: string[], accountId?: string) => void
    /** 清空收藏列表 */
    clearFavoriteList: (accountId?: string) => void
    /** 直接 setter（createSetter 生成） */
    setSymbolFavoriteMap: Setter<Record<string, string[]>>
  }

  export type FavoriteSlice = FavoriteSliceState & FavoriteSliceActions

  // ============ 工厂函数 ============

  export function createMarketFavoriteSlice(
    setRoot: (fn: (state: any) => void) => void,
    getRoot: () => RootStoreState,
  ): FavoriteSlice {
    const favoriteSetter = createSetter<FavoriteSlice>(setRoot, (s) => s.market.favorite)

    /** 获取目标账户 ID，优先使用传入的，否则取当前激活账户 */
    const resolveAccountId = (state: any, accountId?: string): string | null =>
      accountId ?? state.user.info.activeTradeAccountId ?? null

    return {
      symbolFavoriteMap: {},

      setSymbolFavoriteMap: favoriteSetter('symbolFavoriteMap'),

      toggleFavorite: (symbol, accountId) => {
        setRoot((state) => {
          const id = resolveAccountId(state, accountId)
          if (!id) return
          const list = state.market.favorite.symbolFavoriteMap[id] || []
          state.market.favorite.symbolFavoriteMap[id] = list.includes(symbol)
            ? list.filter((s: string) => s !== symbol)
            : [...list, symbol]
        })
      },

      addFavorite: (symbol, accountId) => {
        setRoot((state) => {
          const id = resolveAccountId(state, accountId)
          if (!id) return
          const list = state.market.favorite.symbolFavoriteMap[id] || []
          if (list.includes(symbol)) return
          state.market.favorite.symbolFavoriteMap[id] = [...list, symbol]
        })
      },

      removeFavorite: (symbol, accountId) => {
        setRoot((state) => {
          const id = resolveAccountId(state, accountId)
          if (!id) return
          const list = state.market.favorite.symbolFavoriteMap[id] || []
          state.market.favorite.symbolFavoriteMap[id] = list.filter((s: string) => s !== symbol)
        })
      },

      setFavoriteList: (symbols, accountId) => {
        setRoot((state) => {
          const id = resolveAccountId(state, accountId)
          if (!id) return
          state.market.favorite.symbolFavoriteMap[id] = symbols
        })
      },

      clearFavoriteList: (accountId) => {
        setRoot((state) => {
          const id = resolveAccountId(state, accountId)
          if (!id) return
          state.market.favorite.symbolFavoriteMap[id] = []
        })
      },
    }
  }

  // ============ Selectors ============

  /** 内部：当前账户的收藏 symbol 字符串列表 */
  const marketCurrentFavoriteSymbolListSelector = (state: RootStoreState): string[] => {
    const accountId = state.user.info.activeTradeAccountId
    if (!accountId) return []
    return state.market.favorite.symbolFavoriteMap[accountId] || []
  }

  /** 当前账户的收藏 Set（O(1) 查找） */
  export const marketCurrentFavoriteSetSelector = createSelector(
    [marketCurrentFavoriteSymbolListSelector],
    (symbolList): Set<string> => new Set(symbolList),
  )

  /**
   * 当前账户的收藏品种完整信息列表
   * 自动过滤 marketMap 中不存在的品种（已下架）
   */
  export const marketCurrentFavoriteSymbolsSelector = createSelector(
    [marketCurrentFavoriteSymbolListSelector, (state: RootStoreState) => state.market.marketMap],
    (symbolList, marketMap): Account.TradeSymbolListItem[] =>
      symbolList.map((symbol) => marketMap[symbol]).filter(Boolean) as Account.TradeSymbolListItem[],
  )

  /** 当前账户的收藏数量 */
  export const marketCurrentFavoriteCountSelector = createSelector(
    [marketCurrentFavoriteSymbolListSelector],
    (symbolList): number => symbolList.length,
  )

  /**
   * 工厂：判断指定品种是否被当前账户收藏
   * 使用时需配合 useMemo 缓存：
   * const selector = useMemo(() => createMarketIsFavoriteSelector(symbol), [symbol])
   */
  export const createMarketIsFavoriteSelector = (symbol: string) =>
    createSelector([marketCurrentFavoriteSetSelector], (favoriteSet): boolean => favoriteSet.has(symbol))

  /**
   * 获取指定账户的收藏品种完整信息
   * @param accountId - 目标账户 ID
   */
  export const getMarketFavoriteSymbolsByAccountId = (accountId: string) =>
    createSelector(
      [
        (state: RootStoreState) => state.market.favorite.symbolFavoriteMap[accountId] || [],
        (state: RootStoreState) => state.market.marketMap,
      ],
      (symbolList, marketMap): Account.TradeSymbolListItem[] =>
        symbolList.map((symbol: string) => marketMap[symbol]).filter(Boolean) as Account.TradeSymbolListItem[],
    )
  ```

- [ ] **Step 2: 检查 reselect 是否已安装**

  ```bash
  cd apps/mobile && cat package.json | grep reselect
  ```

  若未安装：

  ```bash
  cd apps/mobile && npx expo install reselect
  ```

- [ ] **Step 3: 验证 TypeScript 编译无报错**

  ```bash
  cd apps/mobile && npx tsc --noEmit 2>&1 | grep favorite-slice
  ```

  预期：无报错输出

- [ ] **Step 4: Commit**

  ```bash
  git add apps/mobile/src/stores/market-slice/favorite-slice.ts
  git commit -m "feat(store): add market favorite slice with selectors and actions"
  ```

---

## Task 3：集成 favorite 到 market-slice

**Files:**

- Modify: `apps/mobile/src/stores/market-slice/index.ts`

- [ ] **Step 1: 更新 market-slice/index.ts**

  打开 [market-slice/index.ts](apps/mobile/src/stores/market-slice/index.ts)，在现有内容基础上做如下修改：

  **新增导入：**

  ```typescript
  import type { FavoriteSlice } from './favorite-slice'

  import { createMarketFavoriteSlice } from './favorite-slice'

  // 同时 re-export selectors 供外部使用
  export * from './favorite-slice'
  ```

  **扩展 MarketSliceState（新增 favorite 字段）：**

  ```typescript
  export interface MarketSliceState {
    fetchMarketListLoading: boolean
    marketMap: Record<string, Account.TradeSymbolListItem>
    marketAllList: Account.TradeSymbolListItem[]
    /** 收藏子命名空间 */
    favorite: FavoriteSlice
  }
  ```

  **在 createMarketSlice 工厂函数中初始化 favorite：**

  ```typescript
  export const createMarketSlice: ImmerStateCreator<RootStoreState, MarketSlice> = (set, get) => ({
    fetchMarketListLoading: false,
    marketMap: {},
    marketAllList: [],

    // ⭐ 新增：收藏子命名空间
    favorite: createMarketFavoriteSlice(set, get),

    setMarket: (partial) =>
      set((state) => {
        Object.assign(state.market, partial)
      }),

    fetchTradeSymbolList: async (accountId: string) => {
      // ... 现有实现保持不变
    },
  })
  ```

- [ ] **Step 2: 验证 TypeScript 编译**

  ```bash
  cd apps/mobile && npx tsc --noEmit 2>&1 | grep -E "market-slice|favorite"
  ```

  预期：无报错输出

- [ ] **Step 3: Commit**

  ```bash
  git add apps/mobile/src/stores/market-slice/index.ts
  git commit -m "feat(store): integrate favorite sub-namespace into market slice"
  ```

---

## Task 4：更新 Root Store — partialize + 订阅

**Files:**

- Modify: `apps/mobile/src/stores/index.ts`

- [ ] **Step 1: 更新 partialize 排除 loading 字段**

  打开 [stores/index.ts](apps/mobile/src/stores/index.ts)，将 `partialize` 改为：

  ```typescript
  partialize: createPartialize<RootStoreState>(
    'trade.formData',
    'market.fetchMarketListLoading',  // loading 状态不持久化
  ),
  ```

  > `market.favorite.symbolFavoriteMap` 和 `user.info.activeTradeAccountId` 会自动持久化，无需额外配置。

- [ ] **Step 2: 在 store 导出后添加订阅**

  在 `export const useRootStore = createSelectors(useRootStoreBase)` **之后**追加：

  ```typescript
  // 订阅 activeTradeAccountId 变化，自动刷新品种列表
  useRootStoreBase.subscribe(
    (state) => state.user.info.activeTradeAccountId,
    (accountId, prevAccountId) => {
      if (accountId && accountId !== prevAccountId) {
        useRootStoreBase.getState().market.fetchTradeSymbolList(accountId)
      }
    },
  )
  ```

- [ ] **Step 3: 验证 TypeScript 编译**

  ```bash
  cd apps/mobile && npx tsc --noEmit 2>&1 | grep "stores/index"
  ```

  预期：无报错输出

- [ ] **Step 4: Commit**

  ```bash
  git add apps/mobile/src/stores/index.ts
  git commit -m "feat(store): add activeTradeAccountId subscription to auto-refresh symbol list"
  ```

---

## Task 5：同步设置 activeTradeAccountId

**Files:**

- Modify: `apps/mobile/src/components/drawers/trade-account-switch-drawer.tsx`
- Modify: `apps/mobile/src/v1/stores/user.ts`

- [ ] **Step 1: 修改 trade-account-switch-drawer.tsx**

  打开 [trade-account-switch-drawer.tsx](apps/mobile/src/components/drawers/trade-account-switch-drawer.tsx)，在 `handleSwitch` 中，`trade.setCurrentAccountInfo(account)` 调用**之后**同步设置：

  ```typescript
  import { useRootStore } from '@/stores'

  // handleSwitch 函数内：
  await Promise.resolve(trade.setCurrentAccountInfo(account))
  // ⭐ 同步设置 activeTradeAccountId（触发订阅自动刷新品种列表）
  useRootStore.getState().user.info.setActiveTradeAccountId(account.id)
  ```

  完整 `handleSwitch` 函数：

  ```typescript
  const handleSwitch = async (account: User.AccountItem) => {
    if (account.id !== selectedAccountId) {
      await Promise.resolve(ws.resetData())
    }
    // 切换账户 重新更新查询品种列表
    await Promise.resolve(trade.getSymbolList({ accountId: account.id }))
    await Promise.resolve(trade.setCurrentAccountInfo(account))
    // ⭐ 同步设置 Zustand activeTradeAccountId
    useRootStore.getState().user.info.setActiveTradeAccountId(account.id)
    await Promise.resolve(trade.setCurrentLiquidationSelectBgaId('CROSS_MARGIN'))
    await Promise.resolve(onSwitchSuccess?.(account))
  }
  ```

- [ ] **Step 2: 修改 v1/stores/user.ts**

  打开 [v1/stores/user.ts](apps/mobile/src/v1/stores/user.ts)，在所有 `stores.trade.setCurrentAccountInfo(...)` 调用**之后**同步设置：

  ```typescript
  import { useRootStore } from '@/stores'

  // 在 setCurrentAccountInfo 调用之后追加（两处都要加）：
  useRootStore.getState().user.info.setActiveTradeAccountId(account.id)
  ```

  修改后的两处代码：

  ```typescript
  // 处 1：本地不存在账号，自动选择第一个
  stores.trade.setCurrentAccountInfo(currentUser.accountList?.[0] as User.AccountItem)
  useRootStore.getState().user.info.setActiveTradeAccountId(currentUser.accountList?.[0]?.id ?? null)

  // 处 2：本地存在账号，更新账号信息
  const matchedAccount = currentUser.accountList?.find((item) => item.id === localAccountId) as User.AccountItem
  stores.trade.setCurrentAccountInfo(matchedAccount)
  useRootStore.getState().user.info.setActiveTradeAccountId(matchedAccount?.id ?? null)
  ```

- [ ] **Step 3: 验证 TypeScript 编译**

  ```bash
  cd apps/mobile && npx tsc --noEmit 2>&1 | grep -E "trade-account-switch|user\.ts"
  ```

  预期：无报错输出

- [ ] **Step 4: Commit**

  ```bash
  git add apps/mobile/src/components/drawers/trade-account-switch-drawer.tsx \
    apps/mobile/src/v1/stores/user.ts
  git commit -m "feat(store): sync activeTradeAccountId when setCurrentAccountInfo is called"
  ```

---

## Task 6：更新业务页面使用新 Selectors

使用旧的 `favoriteList` 的文件有 5 个，逐一替换。

**Files:**

- Modify: `apps/mobile/src/pages/(protected)/(tabs)/home/index.tsx`
- Modify: `apps/mobile/src/pages/(protected)/(trade)/[symbol]/index.tsx`
- Modify: `apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/header/index.tsx`
- Modify: `apps/mobile/src/components/drawers/symbol-select-drawer.tsx`
- Modify: `apps/mobile/src/v1/stores/trade.ts`（保留旧代码，仅备注）

- [ ] **Step 1: 查看各文件中 favoriteList 的用法**

  ```bash
  grep -n "favoriteList\|isFavoriteSymbol\|toggleSymbolFavorite" \
    apps/mobile/src/pages/\(protected\)/\(tabs\)/home/index.tsx \
    "apps/mobile/src/pages/(protected)/(trade)/[symbol]/index.tsx" \
    "apps/mobile/src/pages/(protected)/(tabs)/trade/_comps/header/index.tsx" \
    apps/mobile/src/components/drawers/symbol-select-drawer.tsx
  ```

- [ ] **Step 2: 替换每个文件中的收藏逻辑**

  **通用替换模式：**

  ```typescript
  // ❌ 旧：MobX
  const { trade } = useStores()
  const isFavorite = trade.favoriteList.some((item) => item.symbol === symbol)
  const handleToggle = () => trade.toggleSymbolFavorite(symbol)

  // ✅ 新：Zustand
  import { useRootStore } from '@/stores'
  import { marketCurrentFavoriteSetSelector, marketCurrentFavoriteSymbolsSelector } from '@/stores/market-slice'

  // 获取收藏列表（完整信息）
  const favoriteSymbols = useRootStore(marketCurrentFavoriteSymbolsSelector)

  // 判断是否收藏（使用 Set，O(1)）
  const favoriteSet = useRootStore(marketCurrentFavoriteSetSelector)
  const isFavorite = favoriteSet.has(symbol)

  // 切换收藏
  const { toggleFavorite } = useRootStore.getState().market.favorite
  const handleToggle = () => toggleFavorite(symbol)
  ```

- [ ] **Step 3: 逐文件修改并验证**

  每个文件修改后运行：

  ```bash
  cd apps/mobile && npx tsc --noEmit 2>&1 | grep "<文件名>"
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add apps/mobile/src/pages apps/mobile/src/components/drawers/symbol-select-drawer.tsx
  git commit -m "refactor(pages): replace MobX favoriteList with Zustand market favorite selectors"
  ```

---

## Task 7：手动集成验证

不需要写单元测试，通过手动操作验证以下场景：

- [ ] **验证 1：收藏/取消收藏**
  1. 打开 App，进入品种列表
  2. 点击收藏按钮 → 品种出现在自选列表
  3. 再次点击 → 品种从自选列表消失

- [ ] **验证 2：账户切换隔离**
  1. 账户 A 收藏 XAUUSD
  2. 切换到账户 B → 自选列表为空（或 B 自己的收藏）
  3. 切换回账户 A → XAUUSD 仍在收藏

- [ ] **验证 3：持久化**
  1. 收藏几个品种
  2. 重启 App
  3. 自选列表数据仍然存在

- [ ] **验证 4：下架品种自动过滤**
  1. 通过 `useRootStore.getState().market.favorite.addFavorite('INVALID_SYMBOL')` 手动添加无效品种
  2. 观察自选列表不显示该品种（被过滤）

- [ ] **验证 5：账户切换触发品种列表刷新**
  1. 切换账户
  2. 观察品种列表自动更新（无需手动刷新）

- [ ] **Commit**

  ```bash
  git add -A
  git commit -m "chore: complete favorite refactor integration verification"
  ```

---

## 注意事项

1. **reselect 版本**：确认 `createSelector` 来自 `reselect`，如项目已有其他 selector 库则沿用。
2. **immer 兼容**：`setRoot` 内部使用 immer 草稿，直接赋值即可，无需手动 spread。
3. **循环依赖**：订阅逻辑必须在 `stores/index.ts` 中 store 创建完毕后添加，不能在 slice 内部引用 store 实例。
4. **旧 MobX 代码**：`v1/stores/trade.ts` 中的 `favoriteList` 相关代码可在业务全量迁移后删除，本次暂保留。

---

_计划生成于 2026-03-18_
