# 钱包回调功能实现总结

## 实现概述

完成了 Solana 钱包回调路由管理系统的重构，使用 Zustand + MMKV 实现状态持久化，支持多种钱包操作场景。

## 核心文件

### 1. Store 层
- **[route-callback.ts](../src/stores/route-callback.ts)** - Zustand store
  - 管理 `walletCallback` 状态对象
  - 支持 MMKV 持久化存储
  - 预留扩展空间支持未来其他业务回调

### 2. Hook 层
- **[use-wallet-route-callback.ts](../src/hooks/use-wallet-route-callback.ts)** - 封装 hook
  - 提供 `saveContext`、`clearContext`、`getContext` 方法
  - 自动获取当前路由路径
  - 导出 `WalletActionType` 枚举

### 3. 路由层
- **[wallet.tsx](../src/app/(public)/route-callback/wallet.tsx)** - 回调处理页面
  - 路径：`/route-callback/wallet`
  - Deep link：`mullet://route-callback/wallet`
  - 根据 `walletAction` 类型动态跳转

### 4. 配置层
- **[config.ts](../src/lib/appkit/config.ts)** - AppKit 配置
  - 设置 redirect URI 为 `mullet://route-callback/wallet`

## 集成点

### 登录场景
**文件**: [web3-login-drawer.tsx](../src/pages/(public)/login/_comps/web3-login-drawer.tsx)

```typescript
// 连接钱包前
saveContext(WalletActionType.Connect)
open({ view: 'Connect' })

// 签名消息前
saveContext(WalletActionType.SignMessage)
await signAndLoginPrivy()
```

### 转账场景
**文件**: [use-solana-transfer.ts](../src/pages/(protected)/(assets)/deposit/wallet-transfer/_hooks/use-solana-transfer.ts)

```typescript
// 签名交易前
saveContext(WalletActionType.SignTransaction)
await walletProvider.signTransaction(...)
```

## 操作类型

```typescript
export enum WalletActionType {
  /** 连接钱包 - 返回到登录页 */
  Connect = 'connect',
  /** 签名交易 - 返回到当前页面 */
  SignTransaction = 'sign_transaction',
  /** 签名消息 - 返回到当前页面 */
  SignMessage = 'sign_message',
}
```

## 工作流程

```
用户操作 → saveContext() → 跳转钱包 → 用户签名
  → 返回 App (mullet://route-callback/wallet)
  → 读取 store → 清除状态 → 跳转到目标页面
```

## 路由堆栈保留

使用 `router.replace()` 实现：
- App 保持运行时：保留原有路由堆栈
- App 被杀死重启：重建到目标页面

## 测试检查清单

- [x] Store 文件创建并导出正确
- [x] Hook 文件重命名并更新导入
- [x] 回调页面路由正确配置
- [x] AppKit redirect URI 更新
- [x] 登录场景集成 saveContext
- [x] 转账场景集成 saveContext
- [x] 文档更新完整
- [x] 无旧导入路径残留

## 待测试项

1. **连接钱包流程**
   - 打开登录页 → 点击连接 → 跳转 OKX → 连接成功 → 返回登录页

2. **签名消息流程**
   - 连接钱包后 → 点击签名 → 跳转 OKX → 签名成功 → 返回登录页

3. **转账签名流程**
   - 进入转账确认页 → 点击确认 → 跳转 OKX → 签名成功 → 返回确认页

4. **路由堆栈验证**
   - 多层路由跳转后进行钱包操作 → 返回后能正常 back 返回

## 扩展性

未来可轻松添加新的回调类型：

```typescript
// 在 store 中添加新的状态对象
interface RouteCallbackState {
  walletCallback: WalletCallbackContext
  paymentCallback: PaymentCallbackContext  // 新增
  // ...
}

// 创建对应的 hook
export function usePaymentRouteCallback() { ... }

// 创建对应的回调页面
// src/app/(public)/route-callback/payment.tsx
```

## 注意事项

1. 必须在调用钱包操作**之前**调用 `saveContext()`
2. 确保传入正确的 `WalletActionType`
3. 回调页面会自动清理保存的上下文
4. MMKV 持久化确保 app 重启后也能恢复

---

**实现日期**: 2026-03-10
**实现人员**: Claude Opus 4.6
