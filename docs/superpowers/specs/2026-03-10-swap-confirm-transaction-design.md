# Swap 确认页面交易功能设计文档

## 一、需求概述

在 Swap 确认页面实现完整的交易流程，包括：

1. 点击确定时刷新询价倒计时
2. 调用 `/api/swap/build-tx` 接口获取交易订单
3. 使用用户连接的钱包发送交易
4. 根据交易结果显示成功/失败模态框
5. 失败时支持重新签名（需判断订单是否存在）

## 二、架构设计

### 2.1 核心组件

1. **SwapConfirmScreen** - 确认页面主组件
2. **useSwapTransaction** - 交易管理 Hook（新建）
3. **SignatureSuccessModal** - 签名成功模态框（已存在）
4. **SignatureFailModal** - 签名失败模态框（需修改）

### 2.2 数据流

```text
用户点击确定
  ↓
检查是否已有交易订单
  ↓
有订单 → 直接发送交易
无订单 → 请求 /api/swap/build-tx → 保存订单到状态 → 刷新倒计时 → 发送交易
  ↓
调用钱包签名并发送
  ↓
成功 → 打开 SignatureSuccessModal
失败 → 打开 SignatureFailModal（根据订单是否存在显示重新签名按钮）
```

### 2.3 倒计时与订单联动

- 倒计时从 30 秒开始
- 倒计时归零时，自动清除已保存的交易订单数据
- 点击确定按钮时，如果无订单则请求接口并刷新倒计时

## 三、状态管理设计

### 3.1 useSwapTransaction Hook

**状态定义：**

```typescript
{
  // 交易订单数据（从 /api/swap/build-tx 返回）
  swapTransaction: SwapTransactionData | null

  // 签名状态
  signatureStatus: 'idle' | 'signing' | 'success' | 'failed'

  // 是否正在请求构建交易
  isBuilding: boolean

  // 方法
  buildAndSendTransaction: () => Promise<void>  // 构建并发送交易
  sendTransaction: () => Promise<void>          // 直接发送已有交易
  clearTransaction: () => void                   // 清除交易数据
  resetStatus: () => void                        // 重置签名状态
}
```

**职责：**

- 管理交易订单数据的生命周期
- 封装构建交易和发送交易的逻辑
- 提供统一的错误处理

## 四、API 接口设计

### 4.1 构建交易接口

**端点：** `POST /api/swap/build-tx`

**请求参数：**

```typescript
interface BuildSwapTxParams {
  fromToken: string      // 来源 Token（如 "SOL"）
  toToken: string        // 目标 Token（如 "USDC"）
  amount: string         // 数量（最小单位）
  fromAddress: string    // 用户钱包地址（公钥）
  slippageBps?: number   // 滑点 BPS（默认 50 = 0.5%）
  provider?: string      // "lifi"（默认）或 "jupiter"
}
```

**响应数据：**

```typescript
interface BuildSwapTxResponse {
  swapTransaction: string           // base64 编码的交易
  fromToken: string
  toToken: string
  inputAmount: string
  expectedOutputAmount: string
  minOutputAmount: string
  slippageBps: number
  provider: string
  quoteData: any                    // 原始 quote 信息
}
```

**调用方式：**

```typescript
const response = await depositRequest<BuildSwapTxResponse>('/api/swap/build-tx', {
  method: 'POST',
  data: params,
})
```

## 五、交易发送流程

### 5.1 反序列化交易

```typescript
import { VersionedTransaction } from '@solana/web3.js'

const txBytes = Buffer.from(swapTransaction, 'base64')
const tx = VersionedTransaction.deserialize(txBytes)
```

### 5.2 签名并发送交易

```typescript
const { signAndSendTransaction } = useSolanaProvider()
const signature = await signAndSendTransaction(swapTransaction)
```

### 5.3 错误处理

- **用户取消签名** → 捕获错误，设置 `signatureStatus = 'failed'`
- **网络错误** → 捕获错误，设置 `signatureStatus = 'failed'`
- **交易失败** → 捕获错误，设置 `signatureStatus = 'failed'`

## 六、组件修改设计

### 6.1 SignatureFailModal 修改

**新增 prop：**

```typescript
interface SignatureFailModalProps {
  visible: boolean
  onClose: () => void
  onRetry: () => void
  showRetryButton: boolean  // 新增：是否显示重新签名按钮
}
```

**逻辑：**

- 当 `showRetryButton = false` 时，隐藏重新签名按钮
- 重新签名按钮需要 loading 状态，文案与确认页面的按钮一致

### 6.2 SwapConfirmScreen 修改

**主要修改点：**

1. 引入 `useSwapTransaction` hook
2. 倒计时归零时调用 `clearTransaction()`
3. 确定按钮点击逻辑：
   - 检查是否有订单
   - 有订单 → 调用 `sendTransaction()`
   - 无订单 → 调用 `buildAndSendTransaction()`
4. 传递 `showRetryButton={!!swapTransaction}` 给 `SignatureFailModal`
5. 重新签名按钮调用 `sendTransaction()`

## 七、文件结构

### 7.1 新建文件

```text
apps/mobile/src/pages/(protected)/(assets)/deposit/wallet-transfer/swap/_hooks/
  └── use-swap-transaction.ts
```

### 7.2 修改文件

```text
apps/mobile/src/pages/(protected)/(assets)/deposit/wallet-transfer/swap/confirm/
  └── index.tsx

apps/mobile/src/pages/(protected)/(assets)/deposit/wallet-transfer/_comps/
  └── signature-fail-modal.tsx
```

## 八、实现要点

### 8.1 倒计时刷新逻辑

在 `buildAndSendTransaction` 中：

1. 请求 `/api/swap/build-tx` 接口
2. 保存订单数据到状态
3. 重置倒计时为 30 秒
4. 发送交易

### 8.2 订单数据清除时机

- 倒计时归零时自动清除
- 交易成功后不清除（用于显示成功信息）
- 用户关闭模态框后可选择性清除

### 8.3 按钮状态管理

**确定按钮：**
- `disabled={signatureStatus === 'signing' || countdown <= 0}`
- `loading={signatureStatus === 'signing'}`
- 文案：签名中显示"等待签名"，否则显示"确定"

**重新签名按钮：**
- `disabled={signatureStatus === 'signing'}`
- `loading={signatureStatus === 'signing'}`
- 文案：签名中显示"等待签名"，否则显示"重新签名"

## 九、技术栈

- **状态管理：** React Hooks (useState, useCallback, useEffect)
- **网络请求：** depositRequest (基于 fetch)
- **钱包交互：** useSolanaProvider
- **交易处理：** @solana/web3.js (VersionedTransaction)

## 十、测试要点

1. 首次点击确定，验证是否请求接口并刷新倒计时
2. 倒计时未结束再次点击确定，验证是否直接发送交易
3. 倒计时归零后，验证订单数据是否被清除
4. 签名失败后，验证重新签名按钮是否正确显示
5. 订单不存在时签名失败，验证重新签名按钮是否隐藏

