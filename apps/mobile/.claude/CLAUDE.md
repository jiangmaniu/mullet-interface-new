# Claude Code 项目规范

## 文件组织

### 模块导出

- 不需要创建聚合的 `index.ts` 文件
- 直接从具体文件导入，如 `import { useBackendLogin } from './_hooks/use-backend-login'`

### 目录命名

- 私有目录使用 `_` 前缀，如 `_hooks`、`_comps`、`_utils`
- 这些目录不会被 Expo Router 识别为路由

### Hooks 组织

- 页面级 hooks 放在页面目录下的 `_hooks` 文件夹
- 全局 hooks 放在 `src/hooks` 目录
- 命名格式：`use-xxx.ts`（kebab-case）

## 代码风格

### 导入顺序

1. React/React Native
2. 第三方库
3. 项目内部模块（使用 `@/` 别名）
4. 相对路径导入

### 环境变量

- 使用 `EXPO_ENV_CONFIG` 从 `@/constants/expo` 获取
- 不要直接使用 `process.env`

### 请求

- 使用 `@/utils/request` 进行 API 请求
- 不使用 axios，已重构为 fetch

## 登录流程

### Web3 钱包登录

1. 连接钱包（AppKit）
2. 验证授权（签名 + Privy + 后端登录合并为一步）

### Hooks

- `useWalletAuth` - 钱包签名和 Privy 登录
- `useBackendLogin` - 后端登录，可复用于邮箱登录

### 注意事项

## ⚠️ 强制规范：Zustand useShallow（极其重要，必须执行）

**selector 返回对象或数组时，必须用 `useShallow` 包裹，否则每次渲染都是新引用，导致无限重渲染。**

```ts
import { useShallow } from 'zustand/react/shallow'

// ❌ 禁止：对象 selector 不加 useShallow
const formData = useRootStore(tradeFormDataSelector)

// ✅ 强制：加 useShallow 做浅比较
const formData = useRootStore(useShallow(tradeFormDataSelector))
```

返回原始值（`string` / `number` / `boolean`）不需要 `useShallow`。详见 [store-pattern.md](./store-pattern.md) ✅ Do 第 2 条。

---

## ⚠️ 强制规范：Zustand 状态读取

> 详细范式见 `./store-pattern.md` ❌ Don't 第 2 条

**在 callback / 事件处理器 / 异步函数中，如果数据不参与 JSX 渲染，必须用 `getState()` 读取快照，严禁订阅。**

```ts
// ❌ 禁止：订阅整个 map 导致无效重渲染
const symbolInfoMap = useRootStore(symbolInfoMapSelector)
const handle = useCallback(
  (symbol) => {
    const item = symbolInfoMap[symbol]
  },
  [symbolInfoMap],
)

// ✅ 强制：callback 内按需读取快照
const handle = useCallback((symbol) => {
  const item = createSymbolInfoSelector(symbol)(useRootStore.getState())
}, [])
```

## 扩展规则

./figma.md
./layout.md
./enum-option.md
./store-pattern.md
