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

2. **函数式更新避免竞态**
   ```ts
   setActiveTradeSymbol((prev) => prev ?? defaultSymbol)  // ✅ 基于最新值更新
   ```

3. **persist 只持久化必要数据**
   ```ts
   partialize: createPartialize<RootStoreState>(
     'trade.formData',           // 临时表单数据
     'market.fetchMarketListLoading',  // loading 状态
   )
   ```

4. **子命名空间扁平化状态和 actions**
   ```ts
   export type SettingSlice = SettingSliceState & SettingSliceActions  // ✅ 扁平化
   ```

### ❌ Don't

1. **不要在组件中使用 getState()**
   ```ts
   const token = useRootStore.getState().user.auth.accessToken  // ❌ 不会响应变化
   const token = useRootStore(userAccessTokenSelector)          // ✅ 响应式
   ```

2. **不要手动 mmkv.set()**
   ```ts
   mmkv.set('key', value)  // ❌ persist 已自动处理
   ```

3. **不要在 selector 中使用 `_hasHydrated`**
   ```ts
   // ❌ MMKV 是同步的，不需要 hydration 状态
   const isHydrated = useRootStore((s) => s.user._hasHydrated)
   ```

4. **不要创建嵌套的命名空间对象**
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
