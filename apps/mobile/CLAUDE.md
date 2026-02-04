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
- 使用 `@/v1/utils/request` 进行 API 请求
- 不使用 axios，已重构为 fetch

## 登录流程

### Web3 钱包登录
1. 连接钱包（AppKit）
2. 验证授权（签名 + Privy + 后端登录合并为一步）

### Hooks
- `useWalletAuth` - 钱包签名和 Privy 登录
- `useBackendLogin` - 后端登录，可复用于邮箱登录

### 注意事项
- 登录前检查 `privyUser` 是否存在，避免重复登录 Privy
- 后端登录使用 `useAuthStore.loginWithPrivy`
