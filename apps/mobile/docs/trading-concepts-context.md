# Stellux 交易系统 - 核心计算公式与概念文档

> 本文档用于导入 AI 模型，提供项目交易计算的完整上下文。

---

## 项目技术栈

- React Native + TypeScript
- MobX 状态管理
- WebSocket 实时行情推送

## 核心文件索引

| 文件路径 | 作用 |
|---------|------|
| `app/utils/wsUtil.ts` | 所有核心计算函数（盈亏、保证金、强平价、可开数量） |
| `app/stores/trade.ts` | 保证金率计算（MobX Store 层） |
| `app/hooks/trade/useMargin.tsx` | 预估保证金 Hook 封装 |
| `app/hooks/useMaxOpenVolume.tsx` | 可开数量 Hook 封装 |
| `app/hooks/trade/useOpenVolumn.ts` | 开仓数量管理 |
| `docs/trade-formulas.md` | 公式文档 |

## 函数调用关系

```
wsUtil.ts
├── useCovertProfitCallback(adapt)     → 单仓位浮动盈亏（adapt=false: Gross PnL, adapt=true: Net PnL）
├── useGetCurrentAccountFloatProfitCallback → 账户总浮动盈亏（遍历持仓求和）
├── useGetAccountBalanceCallback        → 账户余额/占用保证金/可用保证金/净值
├── calcYieldRate                       → 收益率
├── calcForceClosePrice                 → 持仓强平价
├── useCalcExpectedForceClosePriceCallback → 下单时预估强平价
├── useCalcExpectedMarginCallback       → 预估保证金
└── useGetMaxOpenVolumeCallback         → 最大可开数量

trade.ts (MobX Store)
├── calcIsolatedMarginRateInfo          → 逐仓保证金率
└── getMarginRateInfo                   → 全仓/逐仓保证金率
```

---

## 一、盈亏体系（PnL）

### 1.1 Gross PnL（毛盈亏 / 浮动盈亏）

- **函数**：`useCovertProfitCallback(false)`（wsUtil.ts:254-295）
- **定义**：纯粹由价格变动产生的未实现盈亏，不含任何费用
- **公式**：
  ```
  买入方向：Gross PnL = (bid - openPrice) × orderVolume × contractSize
  卖出方向：Gross PnL = (openPrice - ask) × orderVolume × contractSize
  最后经 calcExchangeRate 做汇率转换为账户本币
  ```
- **使用场景**：仓位列表 UI 展示、平仓确认弹窗、仓位详情页
- **调用位置**：
  - PositionItem.tsx（仓位列表项）
  - MarketCloseConfirmModal.tsx（市价平仓确认）
  - PositionContent.tsx（仓位详情）
  - CloseConfirmModal.tsx（平仓确认）

### 1.2 Net PnL（净盈亏）

- **函数**：`useCovertProfitCallback(true)`（wsUtil.ts:254-295）
- **定义**：扣除所有持仓成本后的真实盈亏
- **公式**：
  ```
  Net PnL = Gross PnL（已换汇） + handlingFees（手续费，负值） + interestFees（库存费/隔夜费，负值）
  ```
- **执行顺序**：先算价差 → 再换汇 → 最后加费用（费用本身已是账户本币）
- **使用场景**：账户净值计算、保证金率计算、可用保证金计算等账户层面风控数据
- **调用位置**：
  - useGetCurrentAccountFloatProfitCallback（账户总盈亏汇总）
  - calcIsolatedMarginRateInfo（逐仓保证金率计算）

### 1.3 Gross vs Net 区分原因

- **用户视角**：看仓位盈亏时关注"行情走了多少"，展示 Gross PnL
- **风控视角**：计算净值、强平、保证金率时必须用 Net PnL，因为手续费和库存费是已发生的真实扣款
- 与 MT4/MT5 行业惯例一致：Profit 列 = Gross，汇总加 Swap + Commission = Net

### 1.4 费用术语

| 代码字段 | 中文 | 英文 | 说明 |
|---------|------|------|------|
| `handlingFees` | 手续费/佣金 | Commission / Transaction Fee | 开仓时收取 |
| `interestFees` | 库存费/隔夜费/掉期费 | Swap / Overnight Fee / Rollover Fee | 持仓过夜产生 |

### 1.5 收益率

- **函数**：`calcYieldRate`（wsUtil.ts:381-386）
- **公式**：
  ```
  收益率 = (浮动盈亏 / 保证金) × 100%
  正值加"+"前缀，拼接"%"后缀
  ```

### 1.6 账户总浮动盈亏

- **函数**：`useGetCurrentAccountFloatProfitCallback`（wsUtil.ts:297-317）
- **公式**：
  ```
  totalProfit = Σ toFixed(NetPnL(每笔持仓), precision)
  注意：先按精度截断再累加，保证与页面显示一致
  ```

---

## 二、保证金体系

### 2.1 预估保证金（下单时）

- **函数**：`useCalcExpectedMarginCallback`（wsUtil.ts:565-614）
- **公式**：
  ```
  固定预付款模式（fixed_margin）：
    保证金 = initial_margin × orderVolume

  杠杆模式（fixed_leverage / float_leverage）：
    保证金 = contractSize × orderVolume × price / leverage

  最后经 calcExchangeRate 换汇（使用 prepaymentCurrency）
  ```
- **price 取值**：市价单用 ask(买)/bid(卖)，限价单用用户输入价格

### 2.2 单仓位占用保证金

- 由服务端 API 直接返回 `orderMargin` 字段
- 全仓模式 UI 显示 `orderBaseMargin`（基础保证金）
- 逐仓模式 UI 显示 `orderMargin`

### 2.3 账户占用保证金

- **函数**：`useGetAccountBalanceCallback`（wsUtil.ts:336-338）
- **公式**：
  ```
  occupyMargin = margin（全仓保证金） + isolatedMargin（逐仓保证金）
  两个值均来自 currentAccountInfo（服务端推送）
  ```

### 2.4 账户可用保证金

- **函数**：`useGetAccountBalanceCallback`（wsUtil.ts:340-357）
- **公式**：
  ```
  availableMargin = money（账户余额） - occupyMargin（占用保证金）

  如果账户组设置 usableAdvanceCharge === 'PROFIT_LOSS'：
    availableMargin = availableMargin + totalProfit（账户总浮动盈亏 Net PnL）
  ```
- 说明：PROFIT_LOSS 模式下浮动盈亏计入可用，盈利增加可用、亏损减少可用

### 2.5 账户净值

- **公式**：
  ```
  balance（净值） = money（账户余额） + totalProfit（账户总 Net PnL）
  ```

---

## 三、保证金率与强平

### 3.1 仓位保证金率

- **逐仓**（trade.ts:476-509 `calcIsolatedMarginRateInfo`）：
  ```
  逐仓净值 = orderMargin + interestFees + handlingFees + profit(Net PnL)
  逐仓保证金率 = (逐仓净值 / orderBaseMargin) × 100%
  维持保证金 = orderMargin × (compelCloseRatio / 100)
  ```

- **全仓**（trade.ts:521-572 `getMarginRateInfo`）：
  ```
  全仓净值 = 账户总净值(balance) - 逐仓净值
  全仓保证金率 = (全仓净值 / 全仓占用保证金) × 100%
  维持保证金 = 全仓占用保证金 × compelCloseRatio
  ```

- **强平触发条件**：保证金率 ≤ 强平比例（compelCloseRatio）

### 3.2 预估强平价

- **函数**：`calcForceClosePrice`（wsUtil.ts:393-458）
- **核心推导**：
  ```
  由等式：(净值 - PnL变化) / 占用保证金 = 强平比例
  反推出价格能承受的最大波动幅度

  exchangeRateValue = calcExchangeRate(contractSize × orderVolume × (1/leverage))

  全仓：
    value = (balance - profit - occupyMargin × compelCloseRatio) / exchangeRateValue
    买入强平价 = startPrice - value
    卖出强平价 = startPrice + value

  逐仓：
    balance = orderMargin + interestFees + handlingFees + profit（重算逐仓净值）
    occupyMargin = orderMargin（仅用本单）
    value = (balance - profit - occupyMargin × compelCloseRatio) / exchangeRateValue
    强平价同上
  ```

- **下单预估强平价**：`useCalcExpectedForceClosePriceCallback`（wsUtil.ts:493-522）
  - 使用当前市价作为 startPrice，profit=0，interestFees=0
  - 调用 calcForceClosePrice 计算

---

## 四、可开数量

- **函数**：`useGetMaxOpenVolumeCallback`（wsUtil.ts:666-723）
- **公式**：
  ```
  exchangeValue = calcExchangeRate(currentPrice × contractSize)  // 单手合约价值换汇

  固定保证金模式（fixed_margin）：
    volume = availableMargin / calcExchangeRate(initial_margin)

  固定杠杆模式（fixed_leverage）：
    volume = (availableMargin × fixed_leverage) / exchangeValue

  浮动杠杆模式（float_leverage）：
    volume = (availableMargin × float_leverage) / exchangeValue
  ```

---

## 五、汇率转换机制

- **函数**：`calcExchangeRate`
- 所有计算最终都会换算成账户本币
- 盈亏计算使用 `profitCurrency`（盈利货币）
- 保证金计算使用 `prepaymentCurrency`（预付款货币）
- USD 在前用除法，USD 在后用乘法

---

## 六、保证金模式体系

项目支持三种保证金模式（`prepaymentConf.mode`）：

| 模式 | 字段 | 保证金计算 | 可开数量计算 |
|------|------|-----------|------------|
| 固定预付款 | `fixed_margin` | `initial_margin × 手数` | `可用 / initial_margin` |
| 固定杠杆 | `fixed_leverage` | `合约价值 / leverage` | `可用 × leverage / 合约价值` |
| 浮动杠杆 | `float_leverage` | `合约价值 / leverage` | `可用 × leverage / 合约价值` |

固定杠杆与浮动杠杆的区别：固定杠杆由品种配置决定，浮动杠杆由用户自行设置（`trade.leverageMultiple`）。

---

## 七、仓位模式

| 模式 | 字段值 | 特点 |
|------|--------|------|
| 全仓 | `CROSS_MARGIN` | 所有全仓单共享账户净值，一损俱损 |
| 逐仓 | `ISOLATED_MARGIN` | 每单独立，风险隔离，最大亏损 = 该单保证金 |

---

## 八、数据流向

```
服务端 WebSocket 推送
├── 行情数据（bid/ask 实时价格）
├── 账户数据（money/margin/isolatedMargin/compelCloseRatio）
└── 持仓订单（orderMargin/orderVolume/startPrice/handlingFees/interestFees）
         ↓
    前端实时计算（wsUtil.ts hooks）
    ├── Gross PnL / Net PnL
    ├── 收益率
    ├── 账户余额/占用/可用/净值
    ├── 保证金率
    ├── 强平价
    └── 可开数量
         ↓
    UI 展示层（Position/Account/Order 页面组件）
```
