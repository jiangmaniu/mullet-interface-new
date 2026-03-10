# 钱包回调管理使用指南

## 概述

`useWalletCallback` Hook 提供了一个统一的方式来管理从外部钱包返回时的路由恢复逻辑。

## 使用方法

### 1. 在需要调用钱包的页面中使用

```typescript
import { useWalletCallback, WalletActionType } from '@/hooks/use-wallet-callback'

function YourConfirmScreen() {
  const { saveContext } = useWalletCallback()

  const handleSign = async () => {
    // 在调用钱包操作前,保存当前上下文
    saveContext(WalletActionType.SignTransaction)

    // 然后调用钱包操作
    await walletProvider.signTransaction(...)
  }

  return (
    <Button onPress={handleSign}>确认</Button>
  )
}
```

### 2. 支持的操作类型

```typescript
export enum WalletActionType {
  /** 连接钱包 */
  Connect = 'connect',
  /** 签名交易 */
  SignTransaction = 'sign_transaction',
  /** 签名消息 */
  SignMessage = 'sign_message',
}
```

- `WalletActionType.Connect` - 连接钱包（返回到登录页）
- `WalletActionType.SignTransaction` - 签名交易（返回到当前页面）
- `WalletActionType.SignMessage` - 签名消息（返回到当前页面）

### 3. 在不同场景中使用

#### USDC 转账确认页面

```typescript
// src/pages/(protected)/(assets)/deposit/wallet-transfer/usdc/confirm/index.tsx

import { useWalletCallback, WalletActionType } from '@/hooks/use-wallet-callback'

const UsdcConfirmScreen = observer(function UsdcConfirmScreen() {
  const { saveContext } = useWalletCallback()

  const handleConfirmTransfer = async () => {
    // 保存上下文
    saveContext(WalletActionType.SignTransaction)

    // 调用转账
    await transferToken(...)
  }
})
```

#### Swap 确认页面

```typescript
// src/pages/(protected)/(assets)/deposit/wallet-transfer/swap/confirm/index.tsx

import { useWalletCallback, WalletActionType } from '@/hooks/use-wallet-callback'

const SwapConfirmScreen = observer(function SwapConfirmScreen() {
  const { saveContext } = useWalletCallback()

  const handleConfirmSwap = async () => {
    // 保存上下文
    saveContext(WalletActionType.SignTransaction)

    // 调用 swap
    await swapToken(...)
  }
})
```

#### 连接钱包页面

```typescript
// src/pages/(public)/login/index.tsx

import { useWalletCallback, WalletActionType } from '@/hooks/use-wallet-callback'

function LoginScreen() {
  const { saveContext } = useWalletCallback()

  const handleConnectWallet = async () => {
    // 保存上下文，标记为连接操作
    saveContext(WalletActionType.Connect)

    // 调用连接钱包
    await appKit.open()
  }
}
```

## 工作流程

1. **用户操作** → 点击确认按钮
2. **保存上下文** → 调用 `saveContext(WalletActionType.SignTransaction)`
3. **跳转钱包** → App 跳转到 OKX 钱包
4. **用户签名** → 在 OKX 中完成签名
5. **返回 App** → OKX 调用 `mullet://wallet-callback`
6. **恢复路由** → wallet-callback 页面读取保存的上下文,跳转回原页面

## 优势

1. **统一管理** - 所有钱包回调逻辑集中在一个 Hook 中
2. **易于扩展** - 添加新的操作类型只需修改 Hook
3. **类型安全** - TypeScript 类型定义确保正确使用
4. **可复用** - 任何需要调用钱包的页面都可以使用
5. **灵活配置** - 支持不同业务场景的路由策略

## 注意事项

1. 必须在调用钱包操作**之前**调用 `saveContext()`
2. 确保传入正确的操作类型
3. wallet-callback 页面会自动清理保存的上下文
