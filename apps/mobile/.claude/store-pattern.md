# Zustand Store 架构范式

> 本项目采用 Zustand + Immer + 命名空间切片 + 自动 Selector 的状态管理架构

## 技术栈

- **zustand** ^5.0.8 - 核心状态管理
- **immer** ^11.1.4 - 不可变更新
- **react-native-mmkv** ^4.1.2 - 同步持久化存储

## 目录结构

```
src/stores/
├── _helpers/
│   ├── createSetter.ts          # Setter 工厂（支持函数式更新）
│   ├── createSelectors.ts       # 自动生成 .use.xxx() hooks
│   ├── types.ts                 # ImmerStateCreator + createPartialize
├── trade-slice/
│   ├── index.ts                 # 导出 createTradeSlice + TradeSlice 类型
│   ├── settingSlice.ts          # setting 子命名空间
│   ├── settingSelector.ts       # setting selectors
│   ├── formDataSlice.ts         # formData 子命名空间
│   └── formDataSelector.ts      # formData selectors
├── market/
│   ├── index.ts                 # 导出 createMarketSlice
│   ├── marketSlice.ts           # market 切片实现
│   └── marketSelector.ts        # market selectors
├── user-slice/
│   ├── index.ts                 # 导出 createUserSlice
│   ├── authSlice.ts             # auth 子命名空间
│   └── authSelector.ts          # auth + info selectors
└── index.ts                     # RootStore 入口
```

## 核心概念

### 1. RootStore 统一入口

所有状态通过 `useRootStore` 访问，顶级命名空间为 `trade`、`market`、`user`：

```ts
// stores/index.ts
export const useRootStore = create<RootStoreState>()(
  subscribeWithSelector(
    persist(
      immer((set, get, store) => ({
        trade: createTradeSlice(set, get, store),
        market: createMarketSlice(set, get, store),
        user: createUserSlice(set, get, store),
      })),
      {
        name: 'root-store',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: createPartialize<RootStoreState>('trade.formData'),
      },
    ),
  ),
)
```

### 2. 命名空间切片

每个顶级命名空间（trade/market/user）可包含子命名空间：

```ts
// trade 命名空间结构
{
  trade: {
    activeTradeSymbol: ...,           // 根级状态
    setActiveTradeSymbol: ...,        // 根级 action
    setting: {                        // 子命名空间
      colorScheme: ...,
      setColorScheme: ...,
    },
    formData: {                       // 子命名空间
      limitPrice: ...,
      setFormData: ...,
    }
  }
}
```

### 3. Slice 类型定义规范

每个 slice 文件导出三个类型：

```ts
// xxxSlice.ts
export interface XxxSliceState {
  // 状态字段
}

export interface XxxSliceActions {
  // action 方法
}

export type XxxSlice = XxxSliceState & XxxSliceActions
```

根级 slice 额外导出 `XxxSliceState`：

```ts
// trade-slice/index.ts
export interface TradeSliceState {
  activeTradeSymbol: ...
  setActiveTradeSymbol: ...
}

export type TradeSlice = TradeSliceState & {
  setting: SettingSlice
  formData: FormDataSlice
}
```

### 4. Selector 定义规范

**命名格式：`{完整命名空间路径}{状态字段}Selector`**

命名空间路径必须包含从顶级到目标字段的所有层级：

```ts
// user-slice/authSlice.ts
export const userAuthSelector = (state: RootStoreState) => state.user.auth
export const userAuthAccessTokenSelector = (state: RootStoreState) => state.user.auth.accessToken
export const userAuthLoginInfoSelector = (state: RootStoreState) => state.user.auth.loginInfo
export const userAuthLoginTypeSelector = (state: RootStoreState) => state.user.auth.loginType

// trade-slice/settingSlice.ts
export const tradeSettingSelector = (state: RootStoreState) => state.trade.setting
export const tradeSettingColorSchemeSelector = (state: RootStoreState) => state.trade.setting.colorScheme
export const tradeSettingOrderConfirmationSelector = (state: RootStoreState) => state.trade.setting.orderConfirmation
```

#### 生成式 Selector（参数化 Selector）

**命名格式：`create{完整命名空间路径}{状态字段}Selector`**

生成式 selector 用于根据参数动态查询状态，统一使用 `create` 前缀：

```ts
// market-slice/index.ts

/** 生成式 selector - 根据 symbol 查找对应的 symbolInfo */
export const createSymbolInfoSelector = (symbol: string) => (state: RootStoreState) =>
  state.market.symbolInfoMap[symbol] || null

// 使用示例
const symbolInfo = useRootStore(createSymbolInfoSelector('BTCUSD'))
```

**生成式 selector 的特点：**

1. 接受参数并返回一个 selector 函数
2. 统一使用 `create` 前缀命名
3. 适用于需要根据动态参数查询状态的场景
4. 返回值应该有合理的默认值（如 `null`、`undefined` 或空数组）

**常见使用场景：**

```ts
// 根据 ID 查找实体
export const createOrderByIdSelector = (orderId: string) => (state: RootStoreState) =>
  state.trade.orders.find(order => order.id === orderId)

// 根据条件过滤列表
export const createFilteredOrdersSelector = (status: OrderStatus) => (state: RootStoreState) =>
  state.trade.orders.filter(order => order.status === status)

// 从 Map 中查找
export const createSymbolInfoSelector = (symbol: string) => (state: RootStoreState) =>
  state.market.symbolInfoMap[symbol] || null
```

#### 强制规则

1. **使用状态前必须先创建对应的 selector**
2. **Action 方法不需要 selector**，直接通过 `useRootStore.getState().xxx.action()` 调用
3. **Selector 定义位置**：
   - 简单 selector（数量少、复杂度低）→ 直接在 slice 文件末尾定义
   - 复杂 selector（数量多、有计算逻辑）→ 独立 `xxxSelector.ts` 文件

#### 示例：在 slice 文件中定义 selector

```ts
// settingSlice.ts
export function createTradeSettingSlice(...) {
  return {
    colorScheme: 'green-up',
    setColorScheme: (scheme) => { ... },
  }
}

// ============ Selectors ============

export const tradeSettingSelector = (state: RootStoreState) => state.trade.setting
export const tradeSettingColorSchemeSelector = (state: RootStoreState) => state.trade.setting.colorScheme
```

### 5. Selector 使用方式

**方式 1：直接传入 selector（推荐）**

```ts
// 组件中使用
const accessToken = useRootStore(userAccessTokenSelector)
const colorScheme = useRootStore(tradeColorSchemeSelector)
```

**方式 2：getState() + selector**

```ts
// 非组件中使用（如 utils、services）
const accessToken = userAccessTokenSelector(useRootStore.getState())
const loginInfo = userLoginInfoSelector(useRootStore.getState())
```

**方式 3：内联 selector**

```ts
const setting = useRootStore((s) => s.trade.setting)
```

### 6. createSetter 工厂

支持直接设值和函数式更新：

```ts
// _helpers/createSetter.ts
export const createSetter = <T>(set, getSlice) => <K extends keyof T>(key: K): Setter<T[K]> =>
  (value) => {
    set((state) => {
      const slice = getSlice(state)
      slice[key] = typeof value === 'function'
        ? value(slice[key])
        : value
    })
  }

// 使用
const tradeSetter = createSetter<TradeSlice>(set, (s) => s.trade)
setActiveTradeSymbol: tradeSetter('activeTradeSymbol')

// 调用
setActiveTradeSymbol(newSymbol)                    // 直接设值
setActiveTradeSymbol((prev) => prev ?? default)    // 函数式更新
```

### 7. 持久化配置

使用 `createPartialize` 排除不需要持久化的字段：

```ts
partialize: createPartialize<RootStoreState>(
  'trade.formData',                    // 表单数据不持久化
  'market.fetchMarketListLoading',     // loading 状态不持久化
)
```

支持链式 key 路径，完整 TS 类型提示。

### 8. 中间件顺序

```
subscribeWithSelector → persist → immer
```

类型定义：

```ts
export type ImmerStateCreator<TState, TSlice = TState> = StateCreator<
  TState,
  [['zustand/subscribeWithSelector', never], ['zustand/persist', unknown], ['zustand/immer', never]],
  [],
  TSlice
>
```

## 实战示例

### 创建新的 slice

```ts
// stores/cart/cartSlice.ts
export interface CartSliceState {
  items: CartItem[]
  total: number
}

export interface CartSliceActions {
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

export type CartSlice = CartSliceState & CartSliceActions

export function createCartSlice(
  setRoot: (fn: (state: any) => void) => void,
  getRoot: () => any,
): CartSlice {
  return {
    items: [],
    total: 0,

    addItem: (item) =>
      setRoot((state) => {
        state.cart.items.push(item)
        state.cart.total += item.price
      }),

    removeItem: (id) =>
      setRoot((state) => {
        const index = state.cart.items.findIndex((i) => i.id === id)
        if (index !== -1) {
          state.cart.total -= state.cart.items[index].price
          state.cart.items.splice(index, 1)
        }
      }),

    clear: () =>
      setRoot((state) => {
        state.cart.items = []
        state.cart.total = 0
      }),
  }
}
```

### 创建 selector

```ts
// stores/cart/cartSelector.ts
import type { RootStoreState } from '../index'

export const cartSelector = (state: RootStoreState) => state.cart
export const cartItemsSelector = (state: RootStoreState) => state.cart.items
export const cartTotalSelector = (state: RootStoreState) => state.cart.total
export const cartItemCountSelector = (state: RootStoreState) => state.cart.items.length
```

### 注册到 RootStore

```ts
// stores/index.ts
import { createCartSlice, type CartSlice } from './cart'

export type RootStoreState = {
  trade: TradeSlice
  market: MarketSlice
  user: UserSlice
  cart: CartSlice  // 新增
}

const useRootStoreBase = create<RootStoreState>()(
  subscribeWithSelector(
    persist(
      immer((set, get, store) => ({
        trade: createTradeSlice(set, get, store),
        market: createMarketSlice(set, get, store),
        user: createUserSlice(set, get, store),
        cart: createCartSlice(set, get, store),  // 新增
      })),
      {
        name: 'root-store',
        storage: createJSONStorage(() => mmkvStorage),
        partialize: createPartialize<RootStoreState>(
          'trade.formData',
          'cart',  // cart 不持久化
        ),
      },
    ),
  ),
)
```

### 组件中使用

```tsx
import { useRootStore } from '@/stores'
import { cartItemsSelector, cartTotalSelector } from '@/stores/cart/cartSelector'

function CartPage() {
  const items = useRootStore(cartItemsSelector)
  const total = useRootStore(cartTotalSelector)
  const addItem = useRootStore((s) => s.cart.addItem)
  const clear = useRootStore((s) => s.cart.clear)

  return (
    <View>
      <Text>Total: ${total}</Text>
      {items.map((item) => (
        <CartItem key={item.id} {...item} />
      ))}
      <Button onPress={clear}>Clear Cart</Button>
    </View>
  )
}
```

### 非组件中使用

```ts
// services/checkout.ts
import { useRootStore } from '@/stores'
import { cartItemsSelector, userAccessTokenSelector } from '@/stores'

export async function checkout() {
  const items = cartItemsSelector(useRootStore.getState())
  const token = userAccessTokenSelector(useRootStore.getState())

  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items }),
  })

  if (response.ok) {
    useRootStore.getState().cart.clear()
  }
}
```

## 最佳实践

### ✅ Do

1. **使用 selector 避免不必要的重渲染**

   ```ts
   const colorScheme = useRootStore(tradeColorSchemeSelector)  // ✅ 只在 colorScheme 变化时重渲染
   ```

2. **【强制】selector 返回对象时必须使用 `useShallow`**

   Zustand 默认用 `===` 比较返回值，对象每次都是新引用，会导致无限重渲染。返回对象（包括数组）时必须包裹 `useShallow`：

   ```ts
   import { useShallow } from 'zustand/react/shallow'

   // ❌ 禁止：返回对象，每次渲染都是新引用，触发无限重渲染
   const formData = useRootStore(tradeFormDataSelector)

   // ✅ 强制：useShallow 做浅比较，只有字段值变化才重渲染
   const formData = useRootStore(useShallow(tradeFormDataSelector))

   // ✅ 内联 selector 同理
   const { limitPrice, volume } = useRootStore(
     useShallow((s) => ({ limitPrice: s.trade.formData.limitPrice, volume: s.trade.formData.volume }))
   )
   ```

   **判断标准：** selector 返回值类型是 `object`、`array`、或包含多个字段的结构体，必须加 `useShallow`。返回原始值（`string`、`number`、`boolean`）不需要。

3. **【强制】selector 只返回业务中实际用到的字段，禁止订阅多余数据**

   每个 `useRootStore(selector)` 调用只应返回当前组件/hook 实际使用的最小数据集，避免因无关字段变化触发重渲染：

   ```ts
   // ❌ 禁止：订阅整个 formData，任何字段变化都触发重渲染
   const formData = useRootStore(useShallow(tradeFormDataSelector))
   // 实际只用了 limitPrice

   // ✅ 强制：只订阅用到的字段
   const limitPrice = useRootStore(tradeFormDataLimitPriceSelector)
   ```

   **判断标准：** 检查组件 JSX 和逻辑中实际引用了哪些字段，selector 只返回这些字段。

4. **【强制】常用状态的 selector 必须定义为静态函数，抽取到对应 store 文件中**

   禁止在组件内内联定义会被复用的 selector，应统一抽取到对应的 `xxxSelector.ts` 或 slice 文件末尾：

   ```ts
   // ❌ 禁止：在组件内内联定义 selector（无法复用，每次渲染创建新函数引用）
   const price = useRootStore((s) => s.trade.formData.limitPrice)

   // ✅ 强制：在 store 文件中定义静态 selector，组件直接引用
   // trade-slice/formDataSelector.ts
   export const tradeFormDataLimitPriceSelector = (state: RootStoreState) =>
     state.trade.formData.limitPrice

   // 组件中
   import { tradeFormDataLimitPriceSelector } from '@/stores/trade-slice/formDataSelector'
   const limitPrice = useRootStore(tradeFormDataLimitPriceSelector)
   ```

   **例外：** 仅在单个组件内使用且逻辑复杂的派生计算，可内联但需加注释说明原因。

5. **函数式更新避免竞态**

   ```ts
   setActiveTradeSymbol((prev) => prev ?? defaultSymbol)  // ✅ 基于最新值更新
   ```

6. **persist 只持久化必要数据**

   ```ts
   partialize: createPartialize<RootStoreState>(
     'trade.formData',           // 临时表单数据
     'market.fetchMarketListLoading',  // loading 状态
   )
   ```

7. **子命名空间扁平化状态和 actions**

   ```ts
   export type SettingSlice = SettingSliceState & SettingSliceActions  // ✅ 扁平化
   ```

### ❌ Don't

1. **不要在组件中使用 getState()**
   ```ts
   const token = useRootStore.getState().user.auth.accessToken  // ❌ 不会响应变化
   const token = useRootStore(userAccessTokenSelector)          // ✅ 响应式
   ```

2. **【强制】在 callback/事件处理器/异步函数中，禁止通过订阅方式获取仅用于逻辑计算的数据**
   ```ts
   // ❌ 错误：在 hook 层级订阅整个 map，任何 symbol 变化都触发重渲染
   const symbolInfoMap = useRootStore(symbolInfoMapSelector)
   const handleRequest = useCallback((symbol: string) => {
     const item = symbolInfoMap[symbol]  // 仅在回调内使用，不参与渲染
   }, [symbolInfoMap])

   // ✅ 正确：在 callback 内部按需读取快照，零订阅零重渲染
   const handleRequest = useCallback((symbol: string) => {
     const item = createSymbolInfoSelector(symbol)(useRootStore.getState())
   }, [])
   ```
   **判断标准：** 如果数据只在方法内部使用、不直接参与 JSX 渲染，必须用 `getState()` 读取快照，严禁在 hook 层级订阅。

3. **不要手动 mmkv.set()**

   ```ts
   mmkv.set('key', value)  // ❌ persist 已自动处理
   ```

4. **不要在 selector 中使用 `_hasHydrated`**
   ```ts
   // ❌ MMKV 是同步的，不需要 hydration 状态
   const isHydrated = useRootStore((s) => s.user._hasHydrated)
   ```

5. **不要创建嵌套的命名空间对象**
   ```ts
   // ❌ 双重嵌套
   export type MarketSlice = { market: MarketSliceState } & MarketSliceActions

   // ✅ 扁平化
   export type MarketSlice = MarketSliceState & MarketSliceActions
   ```

## 迁移指南

从旧 store 迁移到新架构：

```ts
// 旧代码
import { useLoginAuthStore } from '@/stores/login-auth'
const token = useLoginAuthStore((s) => s.accessToken)
useLoginAuthStore.getState().logout()

// 新代码
import { useRootStore } from '@/stores'
import { userAccessTokenSelector } from '@/stores/user-slice'
const token = useRootStore(userAccessTokenSelector)
useRootStore.getState().user.auth.logout()
```

## 参考资源

- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [Immer 官方文档](https://immerjs.github.io/immer/)
- [MMKV 官方文档](https://github.com/mrousavy/react-native-mmkv)
